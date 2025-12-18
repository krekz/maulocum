import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/rpc";

interface BookmarkedJob {
	id: string;
	title: string | null;
	facilityName: string;
	date: Date;
	location: string | null;
	specialist: string | null;
	payRate: string;
	payBasis: string;
	bookmarkedAt: Date;
}

export function useBookmarks() {
	return useQuery({
		queryKey: ["bookmarks"],
		queryFn: async () => {
			const response = await client.api.v2.doctors.bookmarks.$get();
			if (!response.ok) {
				throw new Error("Failed to fetch bookmarks");
			}
			return response.json();
		},
	});
}

export function useToggleBookmark() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (jobId: string) => {
			const response = await client.api.v2.doctors.bookmarks.$post({
				json: { jobId },
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to toggle bookmark");
			}
			return response.json();
		},
		onMutate: async (jobId) => {
			await queryClient.cancelQueries({ queryKey: ["bookmarks"] });

			const previousBookmarks = queryClient.getQueryData<{
				success: boolean;
				data: BookmarkedJob[];
			}>(["bookmarks"]);

			queryClient.setQueryData<{ success: boolean; data: BookmarkedJob[] }>(
				["bookmarks"],
				(old) => {
					if (!old) return old;
					return {
						...old,
						data: old.data.filter((job) => job.id !== jobId),
					};
				},
			);

			return { previousBookmarks };
		},
		onError: (_err, _jobId, context) => {
			if (context?.previousBookmarks) {
				queryClient.setQueryData(["bookmarks"], context.previousBookmarks);
			}
			toast.error("Failed to update bookmark");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
		},
	});
}
