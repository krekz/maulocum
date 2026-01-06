import { formatDistanceToNow } from "date-fns";
import {
	Bell,
	BellOff,
	Briefcase,
	CheckCircle,
	MessageSquare,
	Star,
	UserCheck,
	UserMinus,
	UserPlus,
	Users,
	XCircle,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { backendApi } from "@/lib/rpc";
import { MarkAllReadButton } from "./_components/mark-all-read-button";

interface Notification {
	id: string;
	type: string;
	title: string;
	message: string;
	isRead: boolean;
	actionUrl: string | null;
	metadata: unknown;
	createdAt: string;
	job: {
		id: string;
		title: string | null;
	} | null;
	jobApplication: {
		id: string;
		status: string;
		DoctorProfile: {
			user: {
				name: string;
				image: string | null;
			};
		} | null;
	} | null;
}

const notificationIcons: Record<string, React.ReactNode> = {
	JOB_APPLICATION_RECEIVED: <UserPlus className="h-5 w-5 text-blue-500" />,
	JOB_APPLICATION_APPROVED: <UserCheck className="h-5 w-5 text-emerald-500" />,
	JOB_APPLICATION_CONFIRMED: (
		<CheckCircle className="h-5 w-5 text-emerald-500" />
	),
	JOB_APPLICATION_REJECTED: <XCircle className="h-5 w-5 text-red-500" />,
	JOB_APPLICATION_CANCELLED: <UserMinus className="h-5 w-5 text-amber-500" />,
	JOB_POSTED: <Briefcase className="h-5 w-5 text-primary" />,
	REVIEW_RECEIVED: <Star className="h-5 w-5 text-amber-500" />,
	VERIFICATION_APPROVED: <CheckCircle className="h-5 w-5 text-emerald-500" />,
	VERIFICATION_REJECTED: <XCircle className="h-5 w-5 text-red-500" />,
	FACILITY_VERIFICATION_APPROVED: (
		<CheckCircle className="h-5 w-5 text-emerald-500" />
	),
	FACILITY_VERIFICATION_REJECTED: <XCircle className="h-5 w-5 text-red-500" />,
	STAFF_INVITATION_RECEIVED: <Users className="h-5 w-5 text-blue-500" />,
	STAFF_INVITATION_ACCEPTED: <UserCheck className="h-5 w-5 text-emerald-500" />,
	STAFF_INVITATION_REJECTED: <UserMinus className="h-5 w-5 text-red-500" />,
	STAFF_REMOVED: <UserMinus className="h-5 w-5 text-red-500" />,
	REMINDER_UPCOMING_JOB: <Bell className="h-5 w-5 text-amber-500" />,
	PAYMENT_RECEIVED: <CheckCircle className="h-5 w-5 text-emerald-500" />,
	MESSAGE_RECEIVED: <MessageSquare className="h-5 w-5 text-blue-500" />,
};

export const dynamic = "force-dynamic";

async function NotificationsPage() {
	const headersList = await headers();
	const cookie = headersList.get("cookie");

	const response = await backendApi.api.v2.facilities.notifications.$get(
		undefined,
		{
			headers: {
				cookie: cookie || "",
			},
		},
	);

	if (!response.ok) {
		if (response.status === 401 || response.status === 403) {
			return notFound();
		}
	}

	const result = await response.json();
	const notifications = (result.data as Notification[]) || [];
	const unreadCount = notifications.filter((n) => !n.isRead).length;

	return (
		<div className="px-6 w-full space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-primary/10 rounded-lg">
						<Bell className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold">Notifications</h1>
						<p className="text-sm text-muted-foreground">
							{unreadCount > 0
								? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
								: "All caught up!"}
						</p>
					</div>
				</div>
				{unreadCount > 0 && <MarkAllReadButton />}
			</div>

			{/* Notifications List */}
			<div className="space-y-2">
				{notifications.length === 0 ? (
					<div className="text-center py-16 bg-muted/50 rounded-lg border-2 border-dashed">
						<BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
						<p className="text-muted-foreground">
							You&apos;ll see notifications here when there&apos;s activity on
							your jobs
						</p>
					</div>
				) : (
					notifications.map((notification) => (
						<NotificationItem
							key={notification.id}
							notification={notification}
						/>
					))
				)}
			</div>
		</div>
	);
}

function NotificationItem({ notification }: { notification: Notification }) {
	const icon = notificationIcons[notification.type] || (
		<Bell className="h-5 w-5 text-muted-foreground" />
	);

	const content = (
		<div
			className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
				notification.isRead
					? "bg-card hover:bg-muted/50"
					: "bg-primary/5 border-primary/20 hover:bg-primary/10"
			}`}
		>
			<div className="flex-shrink-0 mt-0.5">{icon}</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-start justify-between gap-2">
					<div>
						<h3
							className={`font-medium ${!notification.isRead ? "text-foreground" : ""}`}
						>
							{notification.title}
						</h3>
						<p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
							{notification.message}
						</p>
						{notification.job && (
							<p className="text-xs text-muted-foreground mt-1">
								Job: {notification.job.title || "Untitled"}
							</p>
						)}
					</div>
					<div className="flex flex-col items-end gap-1 flex-shrink-0">
						<span className="text-xs text-muted-foreground whitespace-nowrap">
							{formatDistanceToNow(new Date(notification.createdAt), {
								addSuffix: true,
							})}
						</span>
						{!notification.isRead && (
							<Badge variant="default" className="text-[10px] px-1.5 py-0">
								New
							</Badge>
						)}
					</div>
				</div>
			</div>
		</div>
	);

	if (notification.actionUrl) {
		return (
			<Link href={notification.actionUrl} className="block">
				{content}
			</Link>
		);
	}

	return content;
}

export default NotificationsPage;
