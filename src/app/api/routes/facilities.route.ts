import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requireActiveEmployer, requireAuth } from "../lib/api-utils";
import { facilityService } from "../services/facilities.service";
import {
	createContactInfoSchema,
	facilityQuerySchema,
	facilityRegistrationApiSchema,
	facilityVerificationEditApiSchema,
	updateAboutSchema,
	updateClinicInfoSchema,
	updateFacilitiesServicesSchema,
} from "../types/facilities.types";
import type { FacilityVariables } from "../types/hono.types";
import { jobPostInputSchema, jobPostSchema } from "../types/jobs.types";

const app = new Hono<{ Variables: FacilityVariables }>()
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
			const staffProfile = c.get("staffProfile");

			// Omit sensitive owner data from response
			const { user, facility, ...facilityData } = staffProfile;
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
							description: facility.description,
							website: facility.website,
							operatingHours: facility.operatingHours,
							facilitiesServices: facility.facilitiesServices,
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
	 * GET /api/v2/facilities/dashboard-stats
	 * Get dashboard statistics for employer
	 * @PROTECTED route
	 */
	.get("/dashboard-stats", requireActiveEmployer, async (c) => {
		try {
			const staffProfile = c.get("staffProfile");
			const stats = await facilityService.getDashboardStats(
				staffProfile.facilityId,
			);
			return c.json({
				success: true,
				message: "Dashboard stats fetched successfully",
				data: stats,
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
	 * GET /api/v2/facilities/verification-status
	 * Get current user's facility verification status with editable flag
	 * @PROTECTED route
	 */
	.get("/verification-status", requireAuth, async (c) => {
		try {
			const userId = c.get("user").id;
			const verification =
				await facilityService.getFacilityVerificationStatus(userId);

			if (!verification) {
				return c.json(
					{
						success: false,
						message: "Facility verification not found",
						data: null,
					},
					404,
				);
			}

			return c.json({
				success: true,
				message: "Verification status fetched successfully",
				data: verification,
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
	 * PATCH /api/v2/facilities/verification
	 * Update facility verification details with optional file uploads
	 * (only for PENDING or REJECTED with allowAppeal)
	 * @PROTECTED route
	 */
	.patch(
		"/verification",
		requireAuth,
		zValidator("form", facilityVerificationEditApiSchema),
		async (c) => {
			try {
				const data = c.req.valid("form");
				const userId = c.get("user").id;

				await facilityService.updateFacilityVerificationDetails(userId, data);

				return c.json({
					success: true,
					message: "Verification updated successfully",
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
			const staffProfile = c.get("staffProfile");
			await facilityService.postJob(
				validatedData.data,
				staffProfile.facilityId,
				staffProfile.id,
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
			const staffProfile = c.get("staffProfile");
			const jobs = await facilityService.getMyFacilityJobs(
				staffProfile.facilityId,
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

	/**
	 * GET /api/v2/facilities/jobs/applicants
	 * Get all jobs posted by employer's facility
	 * @PROTECTED route
	 */
	.get("/jobs/applicants", requireActiveEmployer, async (c) => {
		try {
			const staffProfile = c.get("staffProfile");
			const jobs = await facilityService.getJobApplicants(
				staffProfile.facilityId,
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

	/**
	 * GET /api/v2/facilities/staffs
	 * Get all staffs for employer's facility
	 * @PROTECTED route
	 */
	.get("/staffs", requireActiveEmployer, async (c) => {
		try {
			const staffProfile = c.get("staffProfile");
			const staffs = await facilityService.getMyFacilityStaffs(
				staffProfile.facilityId,
			);
			return c.json({
				success: true,
				message: "Staffs fetched successfully",
				data: staffs,
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
				const staffProfile = c.get("staffProfile");

				// Fetch job (ownership verified by middleware)
				const job = await facilityService.getJobById(
					id,
					staffProfile.facilityId,
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
				const staffProfile = c.get("staffProfile");

				// Transform string dates to Date objects for Prisma
				const transformedData = {
					...body,
					startDate: new Date(body.startDate),
					endDate: new Date(body.endDate),
				};

				// Update job (ownership verified by middleware)
				const updatedJob = await facilityService.updateJob(
					id,
					staffProfile.facilityId,
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
				const staffProfile = c.get("staffProfile");

				// Get job applicants (ownership verified by middleware)
				const applicants = await facilityService.getJobApplicantsById(
					id,
					staffProfile.facilityId,
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
				const staffProfile = c.get("staffProfile");

				// Close job (ownership verified by middleware)
				await facilityService.closeJob(id, staffProfile.facilityId);

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
				const staffProfile = c.get("staffProfile");

				// Reopen job (ownership verified by middleware)
				await facilityService.reopenJob(id, staffProfile.facilityId);

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
				const staffProfile = c.get("staffProfile");

				// Delete job (ownership verified by middleware)
				await facilityService.deleteJob(id, staffProfile.facilityId);

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
	 * Sensitive data (reviews, ratings, jobs) only visible to verified doctors
	 * @PUBLIC endpoint (with conditional data based on auth)
	 */
	.get("/:id", zValidator("param", z.object({ id: z.string() })), async (c) => {
		try {
			const { id } = c.req.valid("param");

			// Determine if the requester is a verified doctor (has a doctorProfile)
			const session = await auth.api.getSession({
				headers: c.req.raw.headers,
			});

			const isVerifiedDoctor = Boolean(session?.user?.doctorProfile);

			const facility = await facilityService.getFacilityById(
				id,
				isVerifiedDoctor,
			);
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
				data: {
					...facility,
					isVerifiedDoctor,
				},
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
	.post(
		"/",
		requireAuth,
		zValidator("form", facilityRegistrationApiSchema),
		async (c) => {
			try {
				const userId = c.get("user").id;
				const data = c.req.valid("form");
				await facilityService.createFacility(userId, data);

				return c.json(
					{
						success: true,
						message: "Facility registered successfully",
						data: null,
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
				const staffProfile = c.get("staffProfile");

				// Security: Verify facility ownership
				if (id !== staffProfile.facilityId) {
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
			const staffProfile = c.get("staffProfile");
			await facilityService.deleteFacility(staffProfile.facilityId);
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
				const staffProfile = c.get("staffProfile");

				// Security: Verify facility ownership
				if (id !== staffProfile.facilityId) {
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
	 * POST /api/v2/facilities/applications/:applicationId/review
	 * Submit a review for a doctor after completing a job
	 * @PROTECTED route
	 */
	.post(
		"/applications/:applicationId/review",
		requireActiveEmployer,
		zValidator("param", z.object({ applicationId: z.string() })),
		zValidator(
			"json",
			z.object({
				rating: z.number().min(1).max(5),
				comment: z.string().max(1000).optional(),
			}),
		),
		async (c) => {
			try {
				const { applicationId } = c.req.valid("param");
				const { rating, comment } = c.req.valid("json");
				const staffProfile = c.get("staffProfile");

				const review = await facilityService.submitDoctorReview(
					applicationId,
					staffProfile.facilityId,
					rating,
					comment,
				);

				return c.json({
					success: true,
					message: "Review submitted successfully",
					data: review,
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

	// ============================================
	// Double Opt-In Job Application Routes
	// ============================================

	/**
	 * POST /api/v2/facilities/applications/:applicationId/approve
	 * Employer approves an application - triggers WhatsApp notification to doctor
	 */
	.post(
		"/applications/:applicationId/approve",
		zValidator("param", z.object({ applicationId: z.string() })),
		async (c) => {
			const { applicationId } = c.req.valid("param");

			try {
				await facilityService.approveApplication(applicationId);

				return c.json({
					success: true,
					message: "Application approved. Confirmation link sent to doctor.",
				});
			} catch (error) {
				console.error("Error approving application:", error);
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
	 * POST /api/v2/facilities/applications/:applicationId/reject
	 * Employer rejects an application
	 */
	.post(
		"/applications/:applicationId/reject",
		zValidator("param", z.object({ applicationId: z.string() })),
		zValidator("json", z.object({ reason: z.string().optional() })),
		async (c) => {
			const { applicationId } = c.req.valid("param");
			const { reason } = c.req.valid("json");

			try {
				await facilityService.rejectApplication(applicationId, reason);

				return c.json({
					success: true,
					message: "Application rejected.",
				});
			} catch (error) {
				console.error("Error rejecting application:", error);
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
	 * POST /api/v2/facilities/staffs/invite
	 * Invite a user to join facility as staff
	 * @PROTECTED route
	 */
	.post(
		"/staffs/invite",
		requireActiveEmployer,
		zValidator(
			"json",
			z.object({
				email: z.email(),
				role: z.string().min(1),
			}),
		),
		async (c) => {
			try {
				const { email, role } = c.req.valid("json");
				const staffProfile = c.get("staffProfile");
				const user = c.get("user");

				const invitation = await facilityService.inviteStaff(
					staffProfile.facilityId,
					user.id,
					email,
					role,
				);

				return c.json(
					{
						success: true,
						message: "Invitation sent successfully",
						data: invitation,
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
					httpError.status,
				);
			}
		},
	)

	/**
	 * GET /api/v2/facilities/staffs/invitations
	 * Get all pending invitations for facility
	 * @PROTECTED route
	 */
	.get("/staffs/invitations", requireActiveEmployer, async (c) => {
		try {
			const staffProfile = c.get("staffProfile");
			const invitations = await facilityService.getPendingInvitations(
				staffProfile.facilityId,
			);

			return c.json({
				success: true,
				message: "Invitations fetched successfully",
				data: invitations,
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
	})

	/**
	 * DELETE /api/v2/facilities/staffs/invitations/:id
	 * Revoke a pending invitation
	 * @PROTECTED route
	 */
	.delete(
		"/staffs/invitations/:id",
		requireActiveEmployer,
		zValidator("param", z.object({ id: z.string() })),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const staffProfile = c.get("staffProfile");

				await facilityService.revokeInvitation(id, staffProfile.facilityId);

				return c.json({
					success: true,
					message: "Invitation revoked successfully",
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
	 * DELETE /api/v2/facilities/staffs/:id
	 * Remove a staff member from facility
	 * @PROTECTED route
	 */
	.delete(
		"/staffs/:id",
		requireActiveEmployer,
		zValidator("param", z.object({ id: z.string() })),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const staffProfile = c.get("staffProfile");

				await facilityService.deleteStaff(id, staffProfile.facilityId);

				return c.json({
					success: true,
					message: "Staff member removed successfully",
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
	 * PATCH /api/v2/facilities/profile/clinic-info
	 * Update clinic information section
	 * @PROTECTED route
	 */
	.patch(
		"/profile/clinic-info",
		requireActiveEmployer,
		zValidator("json", updateClinicInfoSchema),
		async (c) => {
			try {
				const data = c.req.valid("json");
				const staffProfile = c.get("staffProfile");

				await facilityService.updateClinicInfo(staffProfile.facilityId, data);

				return c.json({
					success: true,
					message: "Clinic information updated successfully",
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
	 * PATCH /api/v2/facilities/profile/about
	 * Update about section
	 * @PROTECTED route
	 */
	.patch(
		"/profile/about",
		requireActiveEmployer,
		zValidator("json", updateAboutSchema),
		async (c) => {
			try {
				const data = c.req.valid("json");
				const staffProfile = c.get("staffProfile");

				await facilityService.updateAbout(staffProfile.facilityId, data);

				return c.json({
					success: true,
					message: "About section updated successfully",
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
	 * PATCH /api/v2/facilities/profile/facilities-services
	 * Update facilities & services section
	 * @PROTECTED route
	 */
	.patch(
		"/profile/facilities-services",
		requireActiveEmployer,
		zValidator("json", updateFacilitiesServicesSchema),
		async (c) => {
			try {
				const data = c.req.valid("json");
				const staffProfile = c.get("staffProfile");

				await facilityService.updateFacilitiesServices(
					staffProfile.facilityId,
					data,
				);

				return c.json({
					success: true,
					message: "Facilities & services updated successfully",
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
	);

export default app;
