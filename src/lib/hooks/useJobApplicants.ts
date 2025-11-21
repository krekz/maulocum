"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export function useJobApplicants(jobId: string) {
	return useQuery({
		queryKey: ["job-applicants", jobId],
		queryFn: async () => {
			const res = await client.api.v2.facilities.jobs[":id"].applicants.$get({
				param: { id: jobId },
			});

			if (!res.ok) {
				throw new Error("Failed to fetch applicants");
			}

			const result = await res.json();
			return result.success ? result.data : [];
		},
		enabled: !!jobId,
	});
}
