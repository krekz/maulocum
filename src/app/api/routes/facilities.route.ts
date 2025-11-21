import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { requireActiveEmployer } from "../lib/api-utils";
import { facilityService } from "../services/facilities.service";
import {
	createContactInfoSchema,
	createReviewSchema,
	facilityQuerySchema,
	facilityRegistrationApiSchema,
} from "../types/facilities.types";
import type { AppVariables } from "../types/hono.types";
import { jobPostInputSchema, jobPostSchema } from "../types/jobs.types";

const app = new Hono<{ Variables: AppVariables }>()
	/**
	 * GET /api/v2/facilities
	 * Get all facilities with pagination and filtering
	 * @PUBLIC endpoint
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
	 * @PROTECTED route
	 */
	.get("/my-facility", requireActiveEmployer, async (c) => {
		try {
			// Facility profile is already fetched and validated by middleware
			const facilityProfile = c.get("facilityProfile");

			// Omit sensitive owner data from response
			const { user, facility, ...facilityData } = facilityProfile;
			return c.json(
				{
					success: true,
					message: "Facility fetched successfully",
					data: {
						...facilityData,
						facility: {
							name: facility.name,
							address: facility.address,
							contactPhone: facility.contactPhone,
							contactEmail: facility.contactEmail,
							contactInfo: facility.contactInfo,
							facilityVerification: facility.facilityVerification,
						},
						user: {
							name: user.name,
						},
					},
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
	 * POST /api/v2/facilities/jobs
	 * Post a job for employer's facility
	 * @PROTECTED route
	 */
	.post("/jobs", requireActiveEmployer, async (c) => {
		try {
			const body = await c.req.json();

			// Transform string dates to Date objects before validation
			const transformedData = {
				...body,
				startDate: body.startDate ? new Date(body.startDate) : undefined,
				endDate: body.endDate ? new Date(body.endDate) : undefined,
			};

			// Validate with transformed data
			const validatedData = jobPostSchema.safeParse(transformedData);
			if (!validatedData.success) {
				console.error(validatedData.error);
				throw new HTTPException(400, {
					message: "Validation data failed",
				});
			}

			// Get facility data from middleware context
			const facilityProfile = c.get("facilityProfile");
			await facilityService.postJob(
				validatedData.data,
				facilityProfile.facilityId,
				facilityProfile.id,
			);
			return c.json(
				{
					success: true,
					message: "Job posted successfully",
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
				},
				httpError.status || 400,
			);
		}
	})

	/**
	 * GET /api/v2/facilities/jobs
	 * Get all jobs posted by employer's facility
	 * @PROTECTED route
	 */
	.get("/jobs", requireActiveEmployer, async (c) => {
		try {
			const facilityProfile = c.get("facilityProfile");
			const jobs = await facilityService.getMyFacilityJobs(
				facilityProfile.facilityId,
			);
			return c.json({
				success: true,
				message: "Jobs fetched successfully",
				data: jobs,
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

	.get(
		"/jobs/:id",
		requireActiveEmployer,
		zValidator("param", z.object({ id: z.string() })),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const facilityProfile = c.get("facilityProfile");

				// Fetch job with ownership verification
				const job = await facilityService.getJobById(
					id,
					facilityProfile.facilityId,
				);

				return c.json({
					success: true,
					message: "Job fetched successfully",
					data: job,
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
	 * PATCH /api/v2/facilities/jobs/:id
	 * Update a job posting
	 * @PROTECTED route
	 */
	.patch(
		"/jobs/:id",
		requireActiveEmployer,
		zValidator("param", z.object({ id: z.string() })),
		zValidator("json", jobPostInputSchema),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const body = c.req.valid("json");
				const facilityProfile = c.get("facilityProfile");

				// Transform string dates to Date objects for Prisma
				const transformedData = {
					...body,
					startDate: new Date(body.startDate),
					endDate: new Date(body.endDate),
				};

				// Update job with ownership verification
				const updatedJob = await facilityService.updateJob(
					id,
					facilityProfile.facilityId,
					transformedData,
				);

				return c.json({
					success: true,
					message: "Job updated successfully",
					data: updatedJob,
				});
			} catch (error) {
				console.error(error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
					},
					httpError.status,
				);
			}
		},
	)

	/**
	 * GET /api/v2/facilities/jobs/:id/applicants
	 * Get all applicants for a specific job
	 * @PROTECTED route
	 */
	.get(
		"/jobs/:id/applicants",
		requireActiveEmployer,
		zValidator("param", z.object({ id: z.string() })),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const facilityProfile = c.get("facilityProfile");

				// Get job applicants with ownership verification
				const applicants = await facilityService.getJobApplicants(
					id,
					facilityProfile.facilityId,
				);

				return c.json({
					success: true,
					message: "Applicants fetched successfully",
					data: applicants,
				});
			} catch (error) {
				console.error(error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
					},
					httpError.status,
				);
			}
		},
	)

	/**
	 * PATCH /api/v2/facilities/jobs/:id/close
	 * Close a job posting
	 * @PROTECTED route
	 */
	.patch(
		"/jobs/:id/close",
		requireActiveEmployer,
		zValidator("param", z.object({ id: z.string() })),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const facilityProfile = c.get("facilityProfile");

				// Close job with ownership verification
				await facilityService.closeJob(id, facilityProfile.facilityId);

				return c.json({
					success: true,
					message: "Job closed successfully",
				});
			} catch (error) {
				console.error(error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
					},
					httpError.status,
				);
			}
		},
	)

	/**
	 * PATCH /api/v2/facilities/jobs/:id/reopen
	 * Reopen a closed job posting
	 * @PROTECTED route
	 */
	.patch(
		"/jobs/:id/reopen",
		requireActiveEmployer,
		zValidator("param", z.object({ id: z.string() })),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const facilityProfile = c.get("facilityProfile");

				// Reopen job with ownership verification
				await facilityService.reopenJob(id, facilityProfile.facilityId);

				return c.json({
					success: true,
					message: "Job reopened successfully",
				});
			} catch (error) {
				console.error(error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
					},
					httpError.status,
				);
			}
		},
	)

	/**
	 * DELETE /api/v2/facilities/jobs/:id
	 * Delete a job posting
	 * @PROTECTED route
	 */
	.delete(
		"/jobs/:id",
		requireActiveEmployer,
		zValidator("param", z.object({ id: z.string() })),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const facilityProfile = c.get("facilityProfile");

				// Delete job with ownership verification
				await facilityService.deleteJob(id, facilityProfile.facilityId);

				return c.json({
					success: true,
					message: "Job deleted successfully",
				});
			} catch (error) {
				console.error(error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
					},
					httpError.status,
				);
			}
		},
	)

	/**
	 * GET /api/v2/facilities/:id
	 * Get a single facility by ID
	 * @PUBLIC endpoint
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
	 * @USER endpoint
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
	 * Update an existing facility while in pending verification
	 * @PROTECTED route
	 */
	.patch(
		"/:id",
		requireActiveEmployer,
		zValidator("param", z.object({ id: z.string() })),
		zValidator("form", facilityRegistrationApiSchema),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const data = c.req.valid("form");
				const facilityProfile = c.get("facilityProfile");

				// Security: Verify facility ownership
				if (id !== facilityProfile.facilityId) {
					throw new HTTPException(403, {
						message: "Forbidden - You don't have access to this facility",
					});
				}

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
	 * @PROTECTED route
	 */
	.delete("/:id", requireActiveEmployer, async (c) => {
		try {
			// Facility profile is already fetched and validated by middleware
			const facilityProfile = c.get("facilityProfile");
			await facilityService.deleteFacility(facilityProfile.id);
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
	})

	/**
	 * POST /api/v2/facilities/:id/contact
	 * Add contact info to facility
	 * @PROTECTED route
	 */
	.post(
		"/:id/contact",
		requireActiveEmployer,
		zValidator("param", z.object({ id: z.string() })),
		zValidator("json", createContactInfoSchema.omit({ facilityId: true })),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const data = c.req.valid("json");
				const facilityProfile = c.get("facilityProfile");

				// Security: Verify facility ownership
				if (id !== facilityProfile.facilityId) {
					throw new HTTPException(403, {
						message: "Forbidden - You don't have access to this facility",
					});
				}

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
	 * @PROTECTED route
	 */
	.post(
		"/:id/review",
		// todo: requireactiveDoctor (doctor review the employer)
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
