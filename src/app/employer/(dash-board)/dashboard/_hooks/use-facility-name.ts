"use client";

import { useQuery } from "@tanstack/react-query";
import { getFacilityName } from "../_actions/get-facility-name";

export function useFacilityName() {
	return useQuery({
		queryKey: ["facility-name"],
		queryFn: getFacilityName,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
	});
}
