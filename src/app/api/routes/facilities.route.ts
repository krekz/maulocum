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
			if (error instanceof HTTPException)
				return c.json(
					{
						success: false,
						message: error.message,
						data: null,
					},
					error.status,
				);
			return c.json(
				{
					success: false,
					message: "Failed to fetch facilities",
					data: null,
				},
				500,
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
			if (error instanceof HTTPException)
				return c.json(
					{
						success: false,
						message: error.message,
						data: null,
					},
					error.status,
				);
			return c.json(
				{
					success: false,
					message: "Failed to fetch facility",
					data: null,
				},
				500,
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
			if (error instanceof HTTPException)
				return c.json(
					{
						success: false,
						message: error.message,
						data: null,
					},
					error.status,
				);
			return c.json(
				{
					success: false,
					message: "Failed to fetch facility",
					data: null,
				},
				500,
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
					message: "Facility created successfully",
					data: facility,
				},
				201,
			);
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException)
				return c.json(
					{
						success: false,
						message: error.message,
						data: null,
					},
					error.status,
				);
			return c.json(
				{
					success: false,
					message: "Failed to create facility",
					data: null,
				},
				500,
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
				if (error instanceof HTTPException)
					return c.json(
						{
							success: false,
							message: error.message,
							data: null,
						},
						error.status,
					);
				return c.json(
					{
						success: false,
						message: "Failed to update facility",
						data: null,
					},
					500,
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
				if (error instanceof HTTPException)
					return c.json(
						{
							success: false,
							message: error.message,
							data: null,
						},
						error.status,
					);
				return c.json(
					{
						success: false,
						message: "Failed to delete facility",
						data: null,
					},
					500,
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
				if (error instanceof HTTPException)
					return c.json(
						{
							success: false,
							message: error.message,
							data: null,
						},
						error.status,
					);
				return c.json(
					{
						success: false,
						message: "Failed to add contact info",
						data: null,
					},
					500,
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
				if (error instanceof HTTPException)
					return c.json(
						{
							success: false,
							message: error.message,
							data: null,
						},
						error.status,
					);
				return c.json(
					{
						success: false,
						message: "Failed to add review",
						data: null,
					},
					500,
				);
			}
		},
	);

export default app;
