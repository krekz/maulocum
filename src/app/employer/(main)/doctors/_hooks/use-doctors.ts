"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export function useDoctors(search?: string) {
	return useQuery({
		queryKey: ["employer-doctors", search],
		queryFn: async () => {
			const res = await client.api.v2.facilities.doctors.$get({
				query: { search: search || undefined },
			});
			if (!res.ok) {
				throw new Error("Failed to fetch doctors");
			}
			const data = await res.json();
			return data.data;
		},
	});
}

export function useDoctorById(id: string) {
	return useQuery({
		queryKey: ["employer-doctor", id],
		queryFn: async () => {
			const res = await client.api.v2.facilities.doctors[":id"].$get({
				param: { id },
			});
			if (!res.ok) {
				throw new Error("Failed to fetch doctor");
			}
			const data = await res.json();
			return data.data;
		},
		enabled: !!id,
	});
}
