"use client";

import { Calendar, Lock, MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { FullAccessJob } from "@/app/api/types/jobs.types";
import { authClient } from "@/lib/auth-client";
import type { JobResponse } from "@/lib/rpc";

// Type guard to check if job is full access
function isFullAccessJob(job: unknown): job is FullAccessJob {
	return typeof job === "object" && job !== null && "createdAt" in job;
}

function JobList({ jobListings: data }: { jobListings: JobResponse }) {
	const jobListings = data.data;

	const { isPending } = authClient.useSession();
	const handleJobClick = (jobId: string) => {
		const url = new URL(window.location.href);
		url.searchParams.set("id", jobId);
		window.history.pushState({}, "", url.toString());
	};

	const searchParams = useSearchParams();
	const selectedJobId = searchParams.get("id");

	if (!jobListings) {
		return (
			<div className="w-full md:w-[500px] shrink-0">
				<div className="bg-white rounded-xl p-6 border border-slate-100 text-center">
					<p className="text-slate-500 text-sm">No job listings found</p>
				</div>
			</div>
		);
	}

	if (isPending) {
		return (
			<div className="w-full md:w-[500px] shrink-0 space-y-3">
				{Array.from({ length: 4 }).map((_, index) => (
					<div
						key={index}
						className="bg-white rounded-xl p-4 border border-slate-100 animate-pulse"
					>
						<div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
						<div className="h-6 bg-slate-200 rounded w-1/2 mb-2" />
						<div className="h-3 bg-slate-100 rounded w-2/3" />
					</div>
				))}
			</div>
		);
	}
	return (
		<div className="w-full md:w-[500px] shrink-0 space-y-3">
			{jobListings.jobs.map((job, index) => {
				const isSelected = selectedJobId === job.id;
				const isNew = index === 0;
				const fullAccess = isFullAccessJob(job);

				return (
					<button
						type="button"
						onClick={() => handleJobClick(job.id)}
						key={job.id}
						className={`w-full text-left bg-white rounded-xl p-4 transition-all cursor-pointer ${
							isSelected
								? "border-2 border-blue-500 shadow-md"
								: "border border-slate-100 hover:border-slate-200 hover:shadow-sm"
						}`}
					>
						{/* Header */}
						<div className="flex items-start justify-between mb-2">
							<h4 className="font-semibold text-slate-900 text-sm leading-tight pr-2">
								{fullAccess ? job.facility.name : "Healthcare Facility"}
							</h4>
							<div className="flex items-center gap-1.5 shrink-0">
								{!fullAccess && (
									<span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-medium rounded flex items-center gap-0.5">
										<Lock className="w-2.5 h-2.5" />
										Limited
									</span>
								)}
								{isNew && fullAccess && (
									<span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded">
										New
									</span>
								)}
								{fullAccess && job.urgency === "HIGH" && (
									<span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded">
										Urgent
									</span>
								)}
							</div>
						</div>

						{/* Pay Rate */}
						<div
							className={`text-lg font-bold mb-2 ${isSelected ? "text-blue-600" : "text-slate-700"}`}
						>
							RM {fullAccess ? job.payRate : "---"}
							<span className="text-xs font-normal text-slate-400 ml-0.5">
								/{job.payBasis?.toLowerCase() || "day"}
							</span>
						</div>

						{/* Location */}
						<div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2">
							<MapPin className="w-3 h-3" />
							<span className="truncate">
								{job.location || job.facility.address || "Location hidden"}
							</span>
						</div>

						{/* Date Range */}
						<div className="flex items-center gap-1 text-[11px] text-slate-500">
							<Calendar className="w-3 h-3" />
							<span>
								{new Date(job.startDate).toLocaleDateString("en-MY", {
									month: "short",
									day: "numeric",
								})}{" "}
								-{" "}
								{new Date(job.endDate).toLocaleDateString("en-MY", {
									month: "short",
									day: "numeric",
								})}
							</span>
						</div>
					</button>
				);
			})}
		</div>
	);
}

export default JobList;
