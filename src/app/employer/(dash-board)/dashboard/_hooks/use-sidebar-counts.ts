"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export function useSidebarCounts() {
	return useQuery({
		queryKey: ["sidebar-counts"],
		queryFn: async () => {
			const res = await client.api.v2.facilities["sidebar-counts"].$get();
			if (!res.ok) {
				throw new Error("Failed to fetch sidebar counts");
			}
			const data = await res.json();
			return data.data;
		},
		refetchInterval: 30000, // Refetch every 30 seconds
		staleTime: 10000, // Consider data stale after 10 seconds
	});
}
