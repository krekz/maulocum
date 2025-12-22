"use client";

import { useQuery } from "@tanstack/react-query";
import { client, type TFacilityStaff } from "@/lib/rpc";

export default function StaffsPage() {
	const {
		data: result,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["employer", "facility", "staffs"],
		queryFn: async () => {
			const res = await client.api.v2.facilities.staffs.$get();
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || "Failed to fetch staffs");
			}
			return res.json();
		},
		retry: 1,
	});

	const staffs = (result?.data ?? []) as TFacilityStaff[];

	if (isLoading) return <div>Loading staffs...</div>;
	if (error instanceof Error) return <div>{error.message}</div>;

	return (
		<div className="space-y-4">
			<div className="text-lg font-semibold">Staffs</div>
			{staffs.length === 0 ? (
				<div className="text-muted-foreground">No staffs found.</div>
			) : (
				<div className="space-y-2">
					{staffs.map((staff) => (
						<div
							key={staff.id}
							className="flex items-center justify-between rounded-md border p-3"
						>
							<div className="min-w-0">
								<div className="truncate font-medium">
									{staff.user?.name ?? "Unknown"}
								</div>
								<div className="truncate text-sm text-muted-foreground">
									{staff.user?.email ?? ""}
								</div>
							</div>
							<div className="shrink-0 text-sm text-muted-foreground">
								{staff.role}
								{staff.isActive ? "" : " (inactive)"}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
