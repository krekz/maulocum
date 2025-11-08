import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../../prisma/generated/prisma/client";

// Schema for verification approval/rejection
const verificationActionSchema = z.object({
	verificationId: z.string(),
	action: z.enum(["APPROVE", "REJECT"]),
	rejectionReason: z.string().optional(),
});

const app = new Hono()
	// Get all pending doctor verification requests
	.get("/doctors/verifications/pending", async (c) => {
		try {
			const verifications = await prisma.doctorProfile.findMany({
				where: { verificationStatus: "PENDING" },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
							createdAt: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});

			return c.json({ verifications, count: verifications.length });
		} catch (error) {
			console.error("Error fetching pending verifications:", error);
			return c.json({ error: "Failed to fetch verifications" }, 500);
		}
	})
	// Get all verifications with filters
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
				const where: Prisma.DoctorProfileWhereInput = status
					? { verificationStatus: status }
					: {};

				const [verifications, total] = await Promise.all([
					prisma.doctorProfile.findMany({
						where,
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									image: true,
									role: true,
									createdAt: true,
								},
							},
						},
						orderBy: { createdAt: "desc" },
						take: limit,
						skip: offset,
					}),
					prisma.doctorProfile.count({ where }),
				]);

				return c.json({
					verifications,
					total,
					limit,
					offset,
					hasMore: offset + limit < total,
				});
			} catch (error) {
				console.error("Error fetching verifications:", error);
				return c.json({ error: "Failed to fetch verifications" }, 500);
			}
		},
	)
	// Get single verification details
	.get("/doctors/verifications/:verificationId", async (c) => {
		const verificationId = c.req.param("verificationId");

		try {
			const verification = await prisma.doctorProfile.findUnique({
				where: { id: verificationId },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
							role: true,
							phoneNumber: true,
							location: true,
							createdAt: true,
						},
					},
				},
			});

			if (!verification) {
				return c.json({ error: "Verification not found" }, 404);
			}

			return c.json({ verification });
		} catch (error) {
			console.error("Error fetching verification:", error);
			return c.json({ error: "Failed to fetch verification" }, 500);
		}
	})
	// Approve or reject verification
	.post(
		"/doctors/verifications/action",
		zValidator("json", verificationActionSchema),
		async (c) => {
			const { verificationId, action, rejectionReason } = c.req.valid("json");

			try {
				// Get verification
				const verification = await prisma.doctorProfile.findUnique({
					where: { id: verificationId },
					include: { user: true },
				});

				if (!verification) {
					return c.json({ error: "Verification not found" }, 404);
				}

				if (verification.verificationStatus !== "PENDING") {
					return c.json(
						{ error: "Verification has already been processed" },
						400,
					);
				}

				if (action === "APPROVE") {
					// Update verification status to APPROVED
					await prisma.doctorProfile.update({
						where: { id: verificationId },
						data: {
							verificationStatus: "APPROVED",
							reviewAt: new Date(),
						},
					});

					// Update user role to DOCTOR
					await prisma.user.update({
						where: { id: verification.userId },
						data: { role: "DOCTOR" },
					});

					return c.json({
						message: "Verification approved successfully",
						verification: {
							...verification,
							status: "APPROVED",
						},
					});
				} else {
					// REJECT
					if (!rejectionReason) {
						return c.json({ error: "Rejection reason is required" }, 400);
					}

					// Update verification status to REJECTED
					await prisma.doctorProfile.update({
						where: { id: verificationId },
						data: {
							verificationStatus: "REJECTED",
							rejectionReason,
							reviewAt: new Date(),
						},
					});

					return c.json({
						message: "Verification rejected",
						verification: {
							...verification,
							status: "REJECTED",
							rejectionReason,
						},
					});
				}
			} catch (error) {
				console.error("Error processing verification:", error);
				return c.json({ error: "Failed to process verification" }, 500);
			}
		},
	)
	// Get verification statistics
	.get("/doctors/verifications/stats", async (c) => {
		try {
			const [pending, approved, rejected, total] = await Promise.all([
				prisma.doctorProfile.count({
					where: { verificationStatus: "PENDING" },
				}),
				prisma.doctorProfile.count({
					where: { verificationStatus: "APPROVED" },
				}),
				prisma.doctorProfile.count({
					where: { verificationStatus: "REJECTED" },
				}),
				prisma.doctorProfile.count(),
			]);

			return c.json({
				stats: {
					pending,
					approved,
					rejected,
					total,
				},
			});
		} catch (error) {
			console.error("Error fetching stats:", error);
			return c.json({ error: "Failed to fetch statistics" }, 500);
		}
	})
	// Get verified doctors only
	.get("/doctors/verifications/verified", async (c) => {
		const search = c.req.query("search") || "";
		const limit = parseInt(c.req.query("limit") || "50", 10);
		const offset = parseInt(c.req.query("offset") || "0", 10);

		try {
			const where: Prisma.UserWhereInput = {
				role: "DOCTOR",
				doctorProfile: {
					verificationStatus: "APPROVED",
				},
			};

			if (search) {
				where.OR = [
					{ name: { contains: search, mode: "insensitive" } },
					{ email: { contains: search, mode: "insensitive" } },
					{
						doctorProfile: {
							apcNumber: { contains: search, mode: "insensitive" },
						},
					},
				];
			}

			const [doctors, total] = await Promise.all([
				prisma.user.findMany({
					where,
					include: {
						doctorProfile: true,
					},
					orderBy: { createdAt: "desc" },
					take: limit,
					skip: offset,
				}),
				prisma.user.count({ where }),
			]);

			return c.json({
				doctors,
				total,
				limit,
				offset,
				hasMore: offset + limit < total,
			});
		} catch (error) {
			console.error("Error fetching verified doctors:", error);
			return c.json({ error: "Failed to fetch verified doctors" }, 500);
		}
	})
	// Get all pending facility verifications
	.get("/facilities/verifications", async (c) => {
		try {
			const verifications = await prisma.facilityVerification.findMany({
				where: { verificationStatus: "PENDING" },
				include: {
					facility: {
						include: {
							owner: {
								select: {
									id: true,
									name: true,
									email: true,
									phoneNumber: true,
									createdAt: true,
								},
							},
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});

			return c.json({ verifications, count: verifications.length });
		} catch (error) {
			console.error("Error fetching pending facility verifications:", error);
			return c.json({ error: "Failed to fetch facility verifications" }, 500);
		}
	})
	// Get all users with role filter
	.get("/users", async (c) => {
		const role = c.req.query("role"); // USER, DOCTOR, ADMIN
		const limit = parseInt(c.req.query("limit") || "50", 10);
		const offset = parseInt(c.req.query("offset") || "0", 10);

		try {
			const where = role ? { role: role as any } : {};

			const [users, total] = await Promise.all([
				prisma.user.findMany({
					where,
					include: {
						doctorProfile: true,
					},
					orderBy: { createdAt: "desc" },
					take: limit,
					skip: offset,
				}),
				prisma.user.count({ where }),
			]);

			return c.json({
				users,
				total,
				limit,
				offset,
				hasMore: offset + limit < total,
			});
		} catch (error) {
			console.error("Error fetching users:", error);
			return c.json({ error: "Failed to fetch users" }, 500);
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
				const user = await prisma.user.update({
					where: { id: userId },
					data: { role },
					include: { doctorProfile: true },
				});

				return c.json({ user, message: `User role updated to ${role}` });
			} catch (error) {
				console.error("Error updating user role:", error);
				return c.json({ error: "Failed to update user role" }, 500);
			}
		},
	);

export default app;
