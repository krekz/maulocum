import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/rpc";

export function useNotifications() {
	const queryClient = useQueryClient();

	const markAsReadMutation = useMutation({
		mutationFn: async (notificationId: string) => {
			const res = await client.api.v2.profile.notifications[":id"].read.$patch({
				param: { id: notificationId },
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to mark as read");
			}

			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const markAllAsReadMutation = useMutation({
		mutationFn: async () => {
			const res =
				await client.api.v2.profile.notifications["read-all"].$patch();

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to mark all as read");
			}

			return res.json();
		},
		onSuccess: (data) => {
			toast.success(data.message);
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const deleteNotificationMutation = useMutation({
		mutationFn: async (notificationId: string) => {
			const res = await client.api.v2.profile.notifications[":id"].$delete({
				param: { id: notificationId },
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to delete notification");
			}

			return res.json();
		},
		onSuccess: () => {
			toast.success("Notification deleted");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const getUnreadNotifications = useQuery({
		queryKey: ["notifications", "unread"],
		queryFn: async () => {
			const res = await client.api.v2.profile.notifications.$get({
				query: {
					isRead: "false",
					limit: "5",
				},
			});

			if (!res.ok) {
				throw new Error("Failed to fetch notifications");
			}

			return res.json();
		},
	});

	return {
		getUnreadNotifications,
		markAsReadMutation,
		markAllAsReadMutation,
		deleteNotificationMutation,
	};
}
