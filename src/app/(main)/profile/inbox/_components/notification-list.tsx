"use client";

import {
	Bell,
	BriefcaseBusiness,
	Check,
	CheckCheck,
	Trash2,
	UserPlus,
	X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import type { NotificationType } from "../../../../../../prisma/generated/prisma/enums";

interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	isRead: boolean;
	actionUrl: string | null;
	createdAt: string;
	metadata: unknown;
	job: { id: string; title: string | null } | null;
	jobApplication: {
		id: string;
		job: { title: string | null };
	} | null;
}

interface NotificationListProps {
	initialNotifications: Notification[];
	unreadCount: number;
}

const notificationIcons: Partial<Record<NotificationType, React.ElementType>> =
	{
		STAFF_INVITATION_RECEIVED: UserPlus,
		STAFF_INVITATION_ACCEPTED: Check,
		STAFF_INVITATION_REJECTED: X,
		STAFF_REMOVED: X,
		JOB_APPLICATION_RECEIVED: BriefcaseBusiness,
		JOB_APPLICATION_APPROVED: Check,
		JOB_APPLICATION_CONFIRMED: CheckCheck,
		JOB_APPLICATION_REJECTED: X,
		JOB_APPLICATION_CANCELLED: X,
		JOB_POSTED: BriefcaseBusiness,
		VERIFICATION_APPROVED: Check,
		VERIFICATION_REJECTED: X,
		FACILITY_VERIFICATION_APPROVED: Check,
		FACILITY_VERIFICATION_REJECTED: X,
		REMINDER_UPCOMING_JOB: Bell,
		PAYMENT_RECEIVED: Check,
		MESSAGE_RECEIVED: Bell,
		REVIEW_RECEIVED: Bell,
	};

export function NotificationList({
	initialNotifications,
	unreadCount: initialUnreadCount,
}: NotificationListProps) {
	const {
		markAsReadMutation,
		markAllAsReadMutation,
		deleteNotificationMutation,
	} = useNotifications();

	const handleNotificationClick = (notification: Notification) => {
		if (!notification.isRead) {
			markAsReadMutation.mutate(notification.id);
		}

		if (notification.actionUrl) {
			window.location.href = notification.actionUrl;
		}
	};

	const getNotificationIcon = (type: NotificationType) => {
		const Icon = notificationIcons[type] || Bell;
		return Icon;
	};

	const formatRelativeTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) return "Just now";
		if (diffInSeconds < 3600)
			return `${Math.floor(diffInSeconds / 60)} minutes ago`;
		if (diffInSeconds < 86400)
			return `${Math.floor(diffInSeconds / 3600)} hours ago`;
		if (diffInSeconds < 604800)
			return `${Math.floor(diffInSeconds / 86400)} days ago`;

		return date.toLocaleDateString();
	};

	return (
		<div className="space-y-4">
			{initialUnreadCount > 0 && (
				<Button
					variant="outline"
					size="sm"
					onClick={() => markAllAsReadMutation.mutate()}
					disabled={markAllAsReadMutation.isPending}
				>
					<CheckCheck className="h-4 w-4 mr-2" />
					Mark all as read
				</Button>
			)}

			{initialNotifications.length === 0 ? (
				<Card className="p-8">
					<div className="flex flex-col items-center justify-center text-center space-y-3">
						<div className="rounded-full bg-muted p-4">
							<Bell className="h-8 w-8 text-muted-foreground" />
						</div>
						<div>
							<h3 className="font-semibold text-lg">No notifications</h3>
							<p className="text-sm text-muted-foreground">
								You're all caught up! Check back later for updates.
							</p>
						</div>
					</div>
				</Card>
			) : (
				<div className="space-y-2">
					{initialNotifications.map((notification) => {
						const Icon = getNotificationIcon(notification.type);

						return (
							<Card
								key={notification.id}
								className={cn(
									"p-4 transition-all hover:shadow-md cursor-pointer",
									!notification.isRead && "bg-primary/5 border-primary/20",
								)}
								onClick={() => handleNotificationClick(notification)}
							>
								<div className="flex items-start gap-4">
									<div
										className={cn(
											"flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
											notification.isRead
												? "bg-muted"
												: "bg-primary/10 text-primary",
										)}
									>
										<Icon className="h-5 w-5" />
									</div>

									<div className="flex-1 space-y-1">
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1">
												<h3
													className={cn(
														"font-medium",
														!notification.isRead && "font-semibold",
													)}
												>
													{notification.title}
												</h3>
												<p className="text-sm text-muted-foreground mt-1">
													{notification.message}
												</p>
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="shrink-0"
												onClick={(e) => {
													e.stopPropagation();
													deleteNotificationMutation.mutate(notification.id);
												}}
												disabled={deleteNotificationMutation.isPending}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>

										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<span>{formatRelativeTime(notification.createdAt)}</span>
											{!notification.isRead && (
												<Badge variant="secondary" className="text-xs">
													New
												</Badge>
											)}
										</div>
									</div>
								</div>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
