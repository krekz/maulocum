import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { facilityService } from "../services/facilities.service";
import {
	createContactInfoSchema,
	createReviewSchema,
	facilityQuerySchema,
	facilitySchema,
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
			throw new HTTPException(500, { message: "Failed to fetch facilities" });
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
				throw new HTTPException(404, { message: "Facility not found" });
			}
			return c.json(facility);
		} catch (error) {
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, { message: "Failed to fetch facility" });
		}
	})

	/**
	 * POST /api/v2/facilities
	 * Create a new facility
	 */
	.post("/", zValidator("json", facilitySchema), async (c) => {
		try {
			const data = c.req.valid("json");
			const headers = c.req.raw.headers;
			const facility = await facilityService.createFacility(data, headers);
			return c.json(facility, 201);
		} catch (error) {
			if (error instanceof HTTPException) return c.json(error, error.status);
			return c.json({ message: "Failed to create facility" }, 500);
		}
	})

	/**
	 * PATCH /api/v2/facilities/:id
	 * Update an existing facility
	 */
	.patch(
		"/:id",
		zValidator("param", z.object({ id: z.string() })),
		zValidator("json", facilitySchema),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const data = c.req.valid("json");
				const facility = await facilityService.updateFacility(id, data);
				return c.json(facility);
			} catch (error) {
				console.error(error);
				throw new HTTPException(500, { message: "Failed to update facility" });
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
				throw new HTTPException(500, { message: "Failed to delete facility" });
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
				throw new HTTPException(500, { message: "Failed to add contact info" });
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
				throw new HTTPException(500, { message: "Failed to add review" });
			}
		},
	);

export default app;
