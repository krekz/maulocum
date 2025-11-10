"use client";

import { useSearchParams } from "next/navigation";
import { useVerifiedDoctors } from "@/lib/hooks/useAdminDoctors";
import { DoctorsSearch } from "./doctors-search";
import { DoctorsTable } from "./doctors-table";

export function DoctorsContent() {
	const searchParams = useSearchParams();
	const search = searchParams.get("search") || undefined;

	const { data, isLoading, error } = useVerifiedDoctors({ search });

	const doctors = data?.data?.doctors || [];
	const total = data?.data?.total || 0;

	return (
		<div className="px-6 w-full mx-auto">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold">Verified Doctors</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Total: {total} verified doctor{total !== 1 ? "s" : ""}
					</p>
				</div>
			</div>

			<div className="mb-4">
				<DoctorsSearch />
			</div>

			{isLoading ? (
				<div className="rounded-md border p-8 text-center">
					<div className="flex items-center justify-center gap-2">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						<p className="text-muted-foreground">Loading doctors...</p>
					</div>
				</div>
			) : error ? (
				<div className="rounded-md border border-destructive p-8 text-center">
					<p className="text-destructive">
						Error loading doctors: {error.message}
					</p>
				</div>
			) : doctors.length === 0 ? (
				<div className="rounded-md border p-8 text-center">
					<p className="text-muted-foreground">
						{search
							? "No doctors found matching your search."
							: "No verified doctors yet."}
					</p>
				</div>
			) : (
				<DoctorsTable doctors={doctors} />
			)}
		</div>
	);
}
