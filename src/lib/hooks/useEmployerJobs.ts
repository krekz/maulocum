import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { JobPostFormValues } from "@/app/api/types/jobs.types";
import { client } from "@/lib/rpc";

/**
 * Hook to post a job for employer's facility
 */
export function usePostJob() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: JobPostFormValues) => {
			const res = await client.api.v2.facilities.jobs.$post({
				json: data,
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to post job");
			}

			return res.json();
		},
		onSuccess: () => {
			// Invalidate facility jobs query to refetch
			queryClient.invalidateQueries({
				queryKey: ["employer", "facility", "jobs"],
			});
		},
	});
}

/**
 * Hook to get all jobs posted by employer's facility
 */
export function useMyFacilityJobs() {
	return useQuery({
		queryKey: ["employer", "facility", "jobs"],
		queryFn: async () => {
			const res = await client.api.v2.facilities.jobs.$get();

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to fetch jobs");
			}

			return res.json();
		},
		retry: 1,
	});
}
