import { HTTPException } from "hono/http-exception";
import { prisma } from "@/lib/prisma";
import type { NotificationType } from "../../../../prisma/generated/prisma/enums";
import type {
	InputJsonValue,
	NotificationWhereInput,
} from "../../../../prisma/generated/prisma/internal/prismaNamespace";

interface CreateNotificationParams {
	type: NotificationType;
	title: string;
	message: string;
	userId?: string;
	doctorProfileId?: string;
	facilityId?: string;
	jobId?: string;
	jobApplicationId?: string;
	metadata?: InputJsonValue;
	actionUrl?: string;
}

interface GetNotificationsParams {
	userId?: string;
	doctorProfileId?: string;
	facilityId?: string;
	isRead?: boolean;
	limit?: number;
	offset?: number;
}

export class NotificationService {
	async createNotification(params: CreateNotificationParams) {
		try {
			if (!params.userId && !params.doctorProfileId && !params.facilityId) {
				throw new HTTPException(400, {
					message:
						"At least one recipient (userId, doctorProfileId, or facilityId) must be provided",
				});
			}

			const notification = await prisma.notification.create({
				data: {
					type: params.type,
					title: params.title,
					message: params.message,
					userId: params.userId,
					doctorProfileId: params.doctorProfileId,
					facilityId: params.facilityId,
					jobId: params.jobId,
					jobApplicationId: params.jobApplicationId,
					metadata: params.metadata,
					actionUrl: params.actionUrl,
				},
			});

			return notification;
		} catch (error) {
			console.error("Error in notification.service.createNotification:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to create notification",
			});
		}
	}

	async getNotifications(params: GetNotificationsParams) {
		try {
			const where: NotificationWhereInput = {};

			if (params.userId) where.userId = params.userId;
			if (params.doctorProfileId)
				where.doctorProfileId = params.doctorProfileId;
			if (params.facilityId) where.facilityId = params.facilityId;
			if (params.isRead !== undefined) where.isRead = params.isRead;

			const notifications = await prisma.notification.findMany({
				where,
				orderBy: { createdAt: "desc" },
				take: params.limit || 50,
				skip: params.offset || 0,
				include: {
					job: {
						select: {
							id: true,
							title: true,
						},
					},
					jobApplication: {
						select: {
							id: true,
							job: {
								select: {
									title: true,
								},
							},
						},
					},
				},
			});

			return notifications;
		} catch (error) {
			console.error("Error in notification.service.getNotifications:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to fetch notifications",
			});
		}
	}

	async markAsRead(notificationId: string, recipientId: string) {
		try {
			const notification = await prisma.notification.findUnique({
				where: { id: notificationId },
			});

			if (!notification) {
				throw new HTTPException(404, {
					message: "Notification not found",
				});
			}

			if (
				notification.userId !== recipientId &&
				notification.doctorProfileId !== recipientId &&
				notification.facilityId !== recipientId
			) {
				throw new HTTPException(403, {
					message: "Not authorized to mark this notification as read",
				});
			}

			const updated = await prisma.notification.update({
				where: { id: notificationId },
				data: { isRead: true },
			});

			return updated;
		} catch (error) {
			console.error("Error in notification.service.markAsRead:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to mark notification as read",
			});
		}
	}

	async markAllAsRead(params: {
		userId?: string;
		doctorProfileId?: string;
		facilityId?: string;
	}) {
		try {
			const where: {
				userId?: string;
				doctorProfileId?: string;
				facilityId?: string;
				isRead: boolean;
			} = { isRead: false };

			if (params.userId) where.userId = params.userId;
			if (params.doctorProfileId)
				where.doctorProfileId = params.doctorProfileId;
			if (params.facilityId) where.facilityId = params.facilityId;

			const result = await prisma.notification.updateMany({
				where,
				data: { isRead: true },
			});

			return { count: result.count };
		} catch (error) {
			console.error("Error in notification.service.markAllAsRead:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to mark all notifications as read",
			});
		}
	}

	async getUnreadCount(params: {
		userId?: string;
		doctorProfileId?: string;
		facilityId?: string;
	}) {
		try {
			const where: {
				userId?: string;
				doctorProfileId?: string;
				facilityId?: string;
				isRead: boolean;
			} = { isRead: false };

			if (params.userId) where.userId = params.userId;
			if (params.doctorProfileId)
				where.doctorProfileId = params.doctorProfileId;
			if (params.facilityId) where.facilityId = params.facilityId;

			const count = await prisma.notification.count({ where });

			return { count };
		} catch (error) {
			console.error("Error in notification.service.getUnreadCount:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to get unread count",
			});
		}
	}

	async deleteNotification(notificationId: string, recipientId: string) {
		try {
			const notification = await prisma.notification.findUnique({
				where: { id: notificationId },
			});

			if (!notification) {
				throw new HTTPException(404, {
					message: "Notification not found",
				});
			}

			if (
				notification.userId !== recipientId &&
				notification.doctorProfileId !== recipientId &&
				notification.facilityId !== recipientId
			) {
				throw new HTTPException(403, {
					message: "Not authorized to delete this notification",
				});
			}

			await prisma.notification.delete({
				where: { id: notificationId },
			});

			return { success: true };
		} catch (error) {
			console.error("Error in notification.service.deleteNotification:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to delete notification",
			});
		}
	}

	async resetAllToUnread(params: {
		userId?: string;
		doctorProfileId?: string;
		facilityId?: string;
	}) {
		try {
			const where: {
				userId?: string;
				doctorProfileId?: string;
				facilityId?: string;
			} = {};

			if (params.userId) where.userId = params.userId;
			if (params.doctorProfileId)
				where.doctorProfileId = params.doctorProfileId;
			if (params.facilityId) where.facilityId = params.facilityId;

			const result = await prisma.notification.updateMany({
				where,
				data: { isRead: false },
			});

			return { count: result.count };
		} catch (error) {
			console.error("Error in notification.service.resetAllToUnread:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to reset notifications",
			});
		}
	}

	async notifyStaffInvitation(params: {
		invitationToken: string;
		email: string;
		facilityName: string;
		role: string;
		invitedByName: string;
		userId: string;
	}) {
		return this.createNotification({
			type: "STAFF_INVITATION_RECEIVED",
			title: "Staff Invitation Received",
			message: `${params.invitedByName} invited you to join ${params.facilityName} as ${params.role}`,
			userId: params.userId,
			metadata: {
				facilityName: params.facilityName,
				role: params.role,
				invitedBy: params.invitedByName,
				invitationToken: params.invitationToken,
			},
			actionUrl: `/profile/invitations?token=${params.invitationToken}`,
		});
	}

	async notifyStaffInvitationAccepted(params: {
		facilityId: string;
		facilityOwnerId: string;
		staffName: string;
		role: string;
	}) {
		return this.createNotification({
			type: "STAFF_INVITATION_ACCEPTED",
			title: "Staff Invitation Accepted",
			message: `${params.staffName} accepted the invitation and joined as ${params.role}`,
			userId: params.facilityOwnerId,
			facilityId: params.facilityId,
			metadata: {
				staffName: params.staffName,
				role: params.role,
			},
			actionUrl: `/facilities/${params.facilityId}/staff`,
		});
	}

	async notifyStaffRemoved(params: {
		userId: string;
		facilityName: string;
		reason?: string;
	}) {
		return this.createNotification({
			type: "STAFF_REMOVED",
			title: "Removed from Staff",
			message: `You have been removed from ${params.facilityName}${params.reason ? `: ${params.reason}` : ""}`,
			userId: params.userId,
			metadata: {
				facilityName: params.facilityName,
				reason: params.reason,
			},
		});
	}
}

export const notificationService = new NotificationService();
