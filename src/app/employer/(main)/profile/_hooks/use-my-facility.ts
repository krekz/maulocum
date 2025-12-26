import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export function useMyFacility() {
	return useQuery({
		queryKey: ["my-facility"],
		queryFn: async () => {
			const res = await client.api.v2.facilities["my-facility"].$get();

			if (!res.ok) {
				throw new Error("Failed to fetch facility");
			}

			return res.json();
		},
	});
}
