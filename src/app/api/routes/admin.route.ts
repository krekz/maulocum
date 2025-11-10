import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { adminService } from "../services/admin.services";
import { facilityQuerySchema } from "../types/facilities.types";

// Schema for verification approval/rejection
const verificationActionSchema = z.object({
	verificationId: z.string(),
	action: z.enum(["APPROVE", "REJECT"]),
	rejectionReason: z.string().optional(),
});

// Schema for facility verification action
const facilityVerificationActionSchema = z.object({
	verificationId: z.string(),
	action: z.enum(["APPROVE", "REJECT"]),
	rejectionReason: z.string().optional(),
});

const app = new Hono()
	// Get all pending doctor verification requests
	// @route GET /api/v2/admin/doctors/verifications/pending
	.get("/doctors/verifications/pending", async (c) => {
		try {
			const verifications = await adminService.getPendingDoctorsVerifications();

			return c.json({
				success: true,
				message: "Pending verifications fetched successfully",
				data: { verifications, count: verifications.length },
			});
		} catch (error) {
			console.error("Error fetching pending verifications:", error);
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

	// Get all verifications with filters
	// @route GET /api/v2/admin/doctors/verifications
	.get(
		"/doctors/verifications",
		zValidator(
			"query",
			z.object({
				status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
				limit: z.coerce.number().int().min(1).max(100).default(10),
				offset: z.coerce.number().int().min(0).default(0),
			}),
		),
		async (c) => {
			const { status, limit, offset } = c.req.valid("query");

			try {
				const verifications = await adminService.getDoctorVerifications({
					status,
					limit,
					offset,
				});

				return c.json({
					success: true,
					message: "Verifications fetched successfully",
					data: {
						verifications: verifications.verifications,
						total: verifications.total,
						limit,
						offset,
						totalPages: verifications.totalPages,
					},
				});
			} catch (error) {
				console.error("Error fetching verifications:", error);
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

	// Approve or reject verification
	// @route POST /api/v2/admin/doctors/verifications/action
	.post(
		"/doctors/verifications/action",
		zValidator("json", verificationActionSchema),
		async (c) => {
			const { verificationId, action, rejectionReason } = c.req.valid("json");

			try {
				const result = await adminService.createDoctorVerificationAction({
					doctorId: verificationId,
					action,
					rejectionReason,
				});

				return c.json({
					success: true,
					message: "Verification processed successfully",
					data: result?.doctorProfile,
				});
			} catch (error) {
				console.error("Error processing verification:", error);
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

	// Get verified doctors only
	// @route GET /api/v2/admin/doctors/verifications/verified
	.get(
		"/doctors/verifications/verified",
		zValidator(
			"query",
			z.object({
				search: z.string().optional(),
				limit: z.coerce.number().int().min(1).max(100).default(10),
				offset: z.coerce.number().int().min(0).default(0),
			}),
		),
		async (c) => {
			const { search, limit, offset } = c.req.valid("query");

			try {
				const { doctors, total, totalPages } =
					await adminService.getVerifiedDoctors({
						search,
						limit,
						offset,
					});

				return c.json({
					success: true,
					message: "Verified doctors fetched successfully",
					data: {
						doctors,
						total,
						limit,
						offset,
						totalPages,
					},
				});
			} catch (error) {
				console.error("Error fetching verified doctors:", error);
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

	// ============================================
	// FACILITIES MANAGEMENT ROUTES
	// ============================================
	// Get all facilities (admin only)
	// @route GET /api/v2/admin/facilities
	.get("/facilities", zValidator("query", facilityQuerySchema), async (c) => {
		try {
			const query = c.req.valid("query");
			const result = await adminService.getFacilities(query);
			return c.json({
				success: true,
				message: "Facilities fetched successfully",
				data: result,
			});
		} catch (error) {
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
	// Get all pending facility verifications
	.get("/facilities/verifications/pendings", async (c) => {
		try {
			const { verifications, count } =
				await adminService.getFacilitiesPendingVerifications();

			return c.json({
				success: true,
				message: "Facility verifications fetched successfully",
				data: { verifications, count },
			});
		} catch (error) {
			console.error("Error fetching pending facility verifications:", error);
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

	// Approve or reject facility verification
	.post(
		"/facilities/verifications/action",
		zValidator("json", facilityVerificationActionSchema),
		async (c) => {
			const { verificationId, action, rejectionReason } = c.req.valid("json");

			try {
				const updatedVerification =
					await adminService.facilityVerificationAction({
						verificationId,
						action,
						rejectionReason,
					});

				return c.json({
					success: true,
					message: `Facility verification ${action === "APPROVE" ? "approved" : "rejected"} successfully`,
					data: { verification: updatedVerification },
				});
			} catch (error) {
				console.error("Error processing facility verification:", error);
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

	// ============================================
	// USER MANAGEMENT ROUTES
	// ============================================
	// Get all users with role filter
	.get(
		"/users",
		zValidator(
			"query",
			z.object({
				role: z.enum(["USER", "DOCTOR", "ADMIN"]).optional(),
				limit: z.coerce.number().int().min(1).max(100).default(10),
				offset: z.coerce.number().int().min(0).default(0),
			}),
		),
		async (c) => {
			const { role, limit, offset } = c.req.valid("query");

			try {
				const {
					users,
					total,
					limit: limitResult,
					offset: offsetResult,
					totalPages,
				} = await adminService.getUsers({
					role,
					limit,
					offset,
				});

				return c.json({
					success: true,
					message: "Users fetched successfully",
					data: {
						users,
						total,
						limit: limitResult,
						offset: offsetResult,
						totalPages,
					},
				});
			} catch (error) {
				console.error("Error fetching users:", error);
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

	// Get single verification details
	// @route GET /api/v2/admin/doctors/verifications/:verificationId
	.get("/doctors/verifications/:verificationId", async (c) => {
		const verificationId = c.req.param("verificationId");

		try {
			const verification =
				await adminService.getDoctorsVerificationById(verificationId);

			return c.json({
				success: true,
				message: "Verification fetched successfully",
				data: { verification },
			});
		} catch (error) {
			console.error("Error fetching verification:", error);
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

	// Update user role manually (admin override)
	.patch(
		"/users/:userId/role",
		zValidator("json", z.object({ role: z.enum(["USER", "DOCTOR", "ADMIN"]) })),
		async (c) => {
			const userId = c.req.param("userId");
			const { role } = c.req.valid("json");

			try {
				const result = await adminService.updateUserRole({
					userId,
					role,
				});

				return c.json({
					success: true,
					message: `User role updated to ${role}`,
					data: result.user,
				});
			} catch (error) {
				console.error("Error updating user role:", error);
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
