import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { facilityService } from "../services/facilities.service";
import {
	createContactInfoSchema,
	createReviewSchema,
	facilityQuerySchema,
	facilityRegistrationApiSchema,
} from "../types/facilities.types";

const app = new Hono()
	/**
	 * GET /api/v2/facilities
	 * Get all facilities with pagination and filtering
	 */
	.get("/", zValidator("query", facilityQuerySchema), async (c) => {
		try {
			const query = c.req.valid("query");
			const result = await facilityService.getFacilities(query);
			return c.json(result);
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException)
				return c.json(error.message, error.status);
			return c.json("Failed to fetch facilities", 500);
		}
	})

	/**
	 * GET /api/v2/facilities/:id
	 * Get a single facility by ID
	 */
	.get("/:id", zValidator("param", z.object({ id: z.string() })), async (c) => {
		try {
			const { id } = c.req.valid("param");
			const facility = await facilityService.getFacilityById(id);
			if (!facility) {
				return c.json({ facility: null }, 404);
			}
			return c.json(facility);
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException)
				return c.json(error.message, error.status);
			return c.json("Failed to fetch facility", 500);
		}
	})

	/**
	 * POST /api/v2/facilities
	 * Create or Register a new facility with file uploads
	 */
	.post("/", zValidator("form", facilityRegistrationApiSchema), async (c) => {
		try {
			const data = c.req.valid("form");
			const facility = await facilityService.createFacility(data, c);
			return c.json(facility, 201);
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException)
				return c.json(error.message, error.status);
			return c.json("Failed to create facility", 500);
		}
	})
	/**
	 * GET /api/v2/facility/my-fility
	 * Get current user's facility
	 */
	.get("/my-facility", async (c) => {
		try {
			const session = await auth.api.getSession({
				headers: c.req.raw.headers,
			});

			if (!session?.user?.id) {
				return c.json("Unauthorized", 401);
			}

			const facility = await facilityService.getFacilityByOwnerId(
				session.user.id,
			);
			if (!facility) {
				return c.json(null, 200);
			}

			return c.json(facility, 200);
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException)
				return c.json(error.message, error.status);
			return c.json("Failed to fetch facility", 500);
		}
	})

	/**
	 * PATCH /api/v2/facilities/:id
	 * Update an existing facility
	 */
	.patch(
		"/:id",
		zValidator("param", z.object({ id: z.string() })),
		zValidator("json", facilityRegistrationApiSchema),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const data = c.req.valid("json");
				const facility = await facilityService.updateFacility(id, data);
				return c.json(facility);
			} catch (error) {
				console.error(error);
				if (error instanceof HTTPException)
					return c.json(error.message, error.status);
				return c.json("Failed to update facility", 500);
			}
		},
	)

	/**
	 * DELETE /api/v2/facilities/:id
	 * Delete a facility
	 */
	.delete(
		"/:id",
		zValidator("param", z.object({ id: z.string() })),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				await facilityService.deleteFacility(id);
				return c.json({ message: "Facility deleted successfully" });
			} catch (error) {
				console.error(error);
				if (error instanceof HTTPException)
					return c.json(error.message, error.status);
				return c.json("Failed to delete facility", 500);
			}
		},
	)

	/**
	 * POST /api/v2/facilities/:id/contact
	 * Add contact info to facility
	 */
	.post(
		"/:id/contact",
		zValidator("param", z.object({ id: z.string() })),
		zValidator("json", createContactInfoSchema.omit({ facilityId: true })),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const data = c.req.valid("json");
				const contact = await facilityService.addContactInfo({
					...data,
					facilityId: id,
				});
				return c.json(contact, 201);
			} catch (error) {
				console.error(error);
				if (error instanceof HTTPException)
					return c.json(error.message, error.status);
				return c.json("Failed to add contact info", 500);
			}
		},
	)

	/**
	 * POST /api/v2/facilities/:id/review
	 * Add review to facility
	 */
	.post(
		"/:id/review",
		zValidator("param", z.object({ id: z.string() })),
		zValidator("json", createReviewSchema.omit({ facilityId: true })),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const data = c.req.valid("json");
				const review = await facilityService.addReview({
					...data,
					facilityId: id,
				});
				return c.json(review, 201);
			} catch (error) {
				console.error(error);
				if (error instanceof HTTPException)
					return c.json(error.message, error.status);
				return c.json("Failed to add review", 500);
			}
		},
	);

export default app;
