import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HTTPException } from "hono/http-exception";
import { z } from "zod";
import {
	doctorCreateExtendedVerificationSchemaAPI,
	doctorVerificationEditSchemaAPI,
} from "@/lib/schemas/doctor-verification.schema";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { requireAuth } from "../lib/api-utils";
import { notificationService } from "../services/notification.service";
import { profileServices } from "../services/profile.services";
import type { ProfileVariables } from "../types/hono.types";

const app = new Hono<{ Variables: ProfileVariables }>()
	// Submit doctor verification
	.post(
		"/verify-doctor",
		zValidator("form", doctorCreateExtendedVerificationSchemaAPI),
		requireAuth,
		async (c) => {
			const data = c.req.valid("form");
			const processedData = {
				...data,
				yearsOfExperience: Number(data.yearsOfExperience),
			};
			const user = c.get("user");

			try {
				const verification = await profileServices.submitDoctorVerification(
					user,
					processedData,
				);

				return c.json(
					{
						success: true,
						data: verification,
						message:
							"Verification submitted successfully. Please wait for admin approval.",
					},
					201,
				);
			} catch (error) {
				console.error("Error submitting verification:", error);
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
	// Update verification details (only for PENDING and REJECTED with AllowAppeal status)
	.patch(
		"/verification/:verificationId",
		zValidator("param", z.object({ verificationId: z.string() })),
		zValidator("form", doctorVerificationEditSchemaAPI),
		async (c) => {
			const { verificationId } = c.req.valid("param");
			const data = c.req.valid("form");
			const processedData = {
				...data,
				yearsOfExperience: Number(data.yearsOfExperience),
			};

			try {
				await profileServices.updateDoctorVerificationDetails(
					verificationId,
					processedData,
				);

				return c.json(
					{
						success: true,
						data: null,
						message: "Verification updated successfully",
					},
					201,
				);
			} catch (error) {
				console.error("Error updating verification:", error);
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
	// Update user role (admin only)
	.patch(
		"/user/:userId/role",
		zValidator("param", z.object({ userId: z.string() })),
		zValidator("json", z.object({ role: z.enum(UserRole) })),
		async (c) => {
			const { userId } = c.req.valid("param");
			const { role } = c.req.valid("json");

			try {
				await profileServices.updateUserRole(userId, role);
				return c.json(
					{
						message: "User role updated successfully",
						success: true,
						data: null,
					},
					201,
				);
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
	)

	// Get user profile with verification status
	.get(
		"/user/:userId",
		zValidator("param", z.object({ userId: z.string() })),
		async (c) => {
			const { userId } = c.req.valid("param");

			try {
				const user = await profileServices.getUserProfile(userId);

				return c.json(
					{
						message: "User profile fetched successfully",
						success: true,
						data: user,
					},
					200,
				);
			} catch (error) {
				console.error("Error fetching user profile:", error);
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
	 * GET /api/v2/profile/staff-invitations/:token
	 * Get staff invitation details by token
	 * @PROTECTED route
	 */
	.get(
		"/staff-invitations/:token",
		requireAuth,
		zValidator("param", z.object({ token: z.string() })),
		async (c) => {
			try {
				const { token } = c.req.valid("param");
				const user = c.get("user");

				const invitation = await profileServices.getStaffInvitation(
					token,
					user.id,
				);

				return c.json({
					success: true,
					message: "Invitation details fetched successfully",
					data: invitation,
				});
			} catch (error) {
				console.error("Error fetching invitation:", error);
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
	 * POST /api/v2/profile/staff-invitations/:token/respond
	 * Accept or decline a staff invitation
	 * @PROTECTED route
	 */
	.post(
		"/staff-invitations/:token/respond",
		requireAuth,
		zValidator("param", z.object({ token: z.string() })),
		zValidator("json", z.object({ action: z.enum(["accept", "decline"]) })),
		async (c) => {
			try {
				const { token } = c.req.valid("param");
				const { action } = c.req.valid("json");
				const user = c.get("user");

				const result = await profileServices.respondToStaffInvitation(
					token,
					user.id,
					action,
				);

				return c.json({
					success: true,
					message: result.message,
					data: result,
				});
			} catch (error) {
				console.error("Error responding to invitation:", error);
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
	 * GET /api/v2/profile/notifications
	 * Get user notifications
	 * @PROTECTED route
	 */
	.get(
		"/notifications",
		requireAuth,
		zValidator(
			"query",
			z.object({
				isRead: z.enum(["true", "false"]).optional(),
				limit: z.string().optional(),
				offset: z.string().optional(),
			}),
		),
		async (c) => {
			try {
				const user = c.get("user");
				const query = c.req.valid("query");

				const params = {
					userId: user.id,
					isRead: query.isRead ? query.isRead === "true" : undefined,
					limit: query.limit ? parseInt(query.limit, 10) : 50,
					offset: query.offset ? parseInt(query.offset, 10) : 0,
				};

				const notifications =
					await notificationService.getNotifications(params);
				const unreadCount = await notificationService.getUnreadCount({
					userId: user.id,
				});

				return c.json({
					success: true,
					message: "Notifications fetched successfully",
					data: {
						notifications: notifications,
						unreadCount: unreadCount.count,
					},
				});
			} catch (error) {
				console.error("Error fetching notifications:", error);
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
	 * PATCH /api/v2/profile/notifications/:id/read
	 * Mark notification as read
	 * @PROTECTED route
	 */
	.patch(
		"/notifications/:id/read",
		requireAuth,
		zValidator("param", z.object({ id: z.string() })),
		async (c) => {
			try {
				const user = c.get("user");
				const { id } = c.req.valid("param");

				await notificationService.markAsRead(id, user.id);

				return c.json({
					success: true,
					message: "Notification marked as read",
				});
			} catch (error) {
				console.error("Error marking notification as read:", error);
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
	 * PATCH /api/v2/profile/notifications/read-all
	 * Mark all notifications as read
	 * @PROTECTED route
	 */
	.patch("/notifications/read-all", requireAuth, async (c) => {
		try {
			const user = c.get("user");

			const result = await notificationService.markAllAsRead({
				userId: user.id,
			});

			return c.json({
				success: true,
				message: `Marked ${result.count} notifications as read`,
				data: result,
			});
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
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
	 * DELETE /api/v2/profile/notifications/:id
	 * Delete a notification
	 * @PROTECTED route
	 */
	.delete(
		"/notifications/:id",
		requireAuth,
		zValidator("param", z.object({ id: z.string() })),
		async (c) => {
			try {
				const user = c.get("user");
				const { id } = c.req.valid("param");

				await notificationService.deleteNotification(id, user.id);

				return c.json({
					success: true,
					message: "Notification deleted",
				});
			} catch (error) {
				console.error("Error deleting notification:", error);
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
