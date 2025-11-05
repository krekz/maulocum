import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { PrismaClient } from "../../../../prisma/generated/prisma/client";

const prisma = new PrismaClient();

// Schema for verification approval/rejection
const verificationActionSchema = z.object({
	verificationId: z.string(),
	action: z.enum(["APPROVE", "REJECT"]),
	rejectionReason: z.string().optional(),
});

const app = new Hono()
	// Get all pending verification requests
	.get("/verifications/pending", async (c) => {
		try {
			const verifications = await prisma.doctorVerification.findMany({
				where: { status: "PENDING" },
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
	.get("/verifications", async (c) => {
		const status = c.req.query("status"); // PENDING, APPROVED, REJECTED
		const limit = parseInt(c.req.query("limit") || "50", 10);
		const offset = parseInt(c.req.query("offset") || "0", 10);

		try {
			const where = status ? { status: status as any } : {};

			const [verifications, total] = await Promise.all([
				prisma.doctorVerification.findMany({
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
				prisma.doctorVerification.count({ where }),
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
	})
	// Get single verification details
	.get("/verifications/:verificationId", async (c) => {
		const verificationId = c.req.param("verificationId");

		try {
			const verification = await prisma.doctorVerification.findUnique({
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
		"/verifications/action",
		zValidator("json", verificationActionSchema),
		async (c) => {
			const { verificationId, action, rejectionReason } = c.req.valid("json");

			try {
				// Get verification
				const verification = await prisma.doctorVerification.findUnique({
					where: { id: verificationId },
					include: { user: true },
				});

				if (!verification) {
					return c.json({ error: "Verification not found" }, 404);
				}

				if (verification.status !== "PENDING") {
					return c.json(
						{ error: "Verification has already been processed" },
						400,
					);
				}

				if (action === "APPROVE") {
					// Update verification status to APPROVED
					await prisma.doctorVerification.update({
						where: { id: verificationId },
						data: {
							status: "APPROVED",
							reviewedAt: new Date(),
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
					await prisma.doctorVerification.update({
						where: { id: verificationId },
						data: {
							status: "REJECTED",
							rejectionReason,
							reviewedAt: new Date(),
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
	.get("/verifications/stats", async (c) => {
		try {
			const [pending, approved, rejected, total] = await Promise.all([
				prisma.doctorVerification.count({ where: { status: "PENDING" } }),
				prisma.doctorVerification.count({ where: { status: "APPROVED" } }),
				prisma.doctorVerification.count({ where: { status: "REJECTED" } }),
				prisma.doctorVerification.count(),
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
	.get("/doctors/verified", async (c) => {
		const search = c.req.query("search") || "";
		const limit = parseInt(c.req.query("limit") || "50", 10);
		const offset = parseInt(c.req.query("offset") || "0", 10);

		try {
			const where: any = {
				role: "DOCTOR",
				doctorVerification: {
					status: "APPROVED",
				},
			};

			if (search) {
				where.OR = [
					{ name: { contains: search, mode: "insensitive" } },
					{ email: { contains: search, mode: "insensitive" } },
					{
						doctorVerification: {
							apcNumber: { contains: search, mode: "insensitive" },
						},
					},
				];
			}

			const [doctors, total] = await Promise.all([
				prisma.user.findMany({
					where,
					include: {
						doctorVerification: true,
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
						doctorVerification: true,
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
					include: { doctorVerification: true },
				});

				return c.json({ user, message: `User role updated to ${role}` });
			} catch (error) {
				console.error("Error updating user role:", error);
				return c.json({ error: "Failed to update user role" }, 500);
			}
		},
	);

export default app;
