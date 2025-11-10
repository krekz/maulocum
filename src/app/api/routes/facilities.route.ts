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
			return c.json({
				success: true,
				message: "Facilities fetched successfully",
				data: result,
			});
		} catch (error) {
			console.error(error);
			const httpError = error as HTTPException;
			return c.json(
				{
					success: false,
					message: httpError.message,
					data: null,
				},
				httpError.status,
			);
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
				throw new HTTPException(401, {
					message: "Unauthorized",
				});
			}

			const facility = await facilityService.getUserFacilityProfile(
				session.user.id,
			);

			return c.json(
				{
					success: true,
					message: "Facility fetched successfully",
					data: facility,
				},
				200,
			);
		} catch (error) {
			console.error(error);
			const httpError = error as HTTPException;
			return c.json(
				{
					success: false,
					message: httpError.message,
					data: null,
				},
				httpError.status,
			);
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
				return c.json(
					{
						success: false,
						message: "Facility not found",
						data: null,
					},
					404,
				);
			}
			return c.json({
				success: true,
				message: "Facility fetched successfully",
				data: facility,
			});
		} catch (error) {
			console.error(error);
			const httpError = error as HTTPException;
			return c.json(
				{
					success: false,
					message: httpError.message,
					data: null,
				},
				httpError.status,
			);
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
			return c.json(
				{
					success: true,
					message: "Facility registered successfully",
					data: facility,
				},
				201,
			);
		} catch (error) {
			console.error(error);
			const httpError = error as HTTPException;
			return c.json(
				{
					success: false,
					message: httpError.message,
					data: null,
				},
				httpError.status,
			);
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
				return c.json({
					success: true,
					message: "Facility updated successfully",
					data: facility,
				});
			} catch (error) {
				console.error(error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
						data: null,
					},
					httpError.status,
				);
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
				return c.json({
					success: true,
					message: "Facility deleted successfully",
					data: null,
				});
			} catch (error) {
				console.error(error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
						data: null,
					},
					httpError.status,
				);
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
				return c.json(
					{
						success: true,
						message: "Contact info added successfully",
						data: contact,
					},
					201,
				);
			} catch (error) {
				console.error(error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
						data: null,
					},
					httpError.status,
				);
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
				return c.json(
					{
						success: true,
						message: "Review added successfully",
						data: review,
					},
					201,
				);
			} catch (error) {
				console.error(error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
						data: null,
					},
					httpError.status,
				);
			}
		},
	);

export default app;
