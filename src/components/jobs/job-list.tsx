"use client";

import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import type { JobResponse } from "@/lib/rpc-client";

function JobList({ jobListings: data }: { jobListings: JobResponse }) {
	const jobListings = data.data;

	const { isPending } = useSession();
	const handleJobClick = (jobId: string) => {
		// Update URL with the selected job ID in the query parameters
		const url = new URL(window.location.href);
		url.searchParams.set("id", jobId);
		window.history.pushState({}, "", url.toString());
	};

	// Get the currently selected job ID from URL search params
	const searchParams = useSearchParams();
	const selectedJobId = searchParams.get("id");

	if (!jobListings) {
		return (
			<div className="w-full md:w-2/3 space-y-2">No job listings found</div>
		);
	}

	if (isPending) {
		return (
			<div className="w-full md:w-2/3 space-y-2">
				{Array.from({ length: 5 }).map((_, index) => (
					<div
						key={index}
						className="bg-card p-6 min-h-[200px] animate-pulse rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
					/>
				))}
			</div>
		);
	}

	const hasFullAccess =
		jobListings.jobs.length > 0 && "title" in jobListings.jobs[0];

	return (
		<div className="w-full md:w-2/3 space-y-2">
			{jobListings.jobs.map((job) => (
				<button
					onClick={() => handleJobClick(job.id)}
					key={job.id}
					className={`bg-card p-6 w-full rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer relative ${
						selectedJobId === job.id
							? "border border-primary"
							: "border border-border hover:border-primary"
					}`}
				>
					{!hasFullAccess && (
						<div className="absolute top-2 right-2 bg-muted/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-xs">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
								<path d="M7 11V7a5 5 0 0 1 10 0v4" />
							</svg>
							<span className="text-muted-foreground">Limited</span>
						</div>
					)}

					<div className="flex flex-col space-y-4">
						{hasFullAccess ? (
							<>
								<div className="flex justify-between items-start">
									<div>
										<h3 className="text-xl font-semibold">
											{"facility" in job && job.facility?.name}
										</h3>
										<p className="text-muted-foreground flex items-center gap-1 text-sm">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
												<circle cx="12" cy="10" r="3" />
											</svg>
											{"facility" in job && job.facility?.address}
										</p>
									</div>
								</div>
								<p className="text-sm line-clamp-2">
									{"description" in job && job.description}
								</p>
								<div className="grid grid-cols-2 gap-3">
									<div className="bg-accent/50 p-2 rounded">
										<p className="text-xs text-muted-foreground">Specialist</p>
										<p className="font-medium text-sm">
											{"requiredSpecialists" in job && job.requiredSpecialists}
										</p>
									</div>
									<div className="bg-accent/50 p-2 rounded">
										<p className="text-xs text-muted-foreground">Pay Rate</p>
										<p className="font-medium text-green-600 text-sm">
											{"payRate" in job && job.payRate}
										</p>
									</div>
									<div className="bg-accent/50 p-2 rounded">
										<p className="text-xs text-muted-foreground">Start</p>
										<p className="font-medium text-sm">
											{new Date(job.startDate).toLocaleDateString()}
										</p>
									</div>
									<div className="bg-accent/50 p-2 rounded">
										<p className="text-xs text-muted-foreground">End</p>
										<p className="font-medium text-sm">
											{new Date(job.endDate).toLocaleDateString()}
										</p>
									</div>
								</div>
							</>
						) : (
							<>
								<div className="space-y-2">
									<div className="h-6 bg-muted/50 rounded w-3/4 animate-pulse" />
									<div className="h-4 bg-muted/30 rounded w-1/2 animate-pulse" />
								</div>
								<div className="h-4 bg-muted/30 rounded w-full animate-pulse" />
								<div className="grid grid-cols-2 gap-3">
									<div className="bg-accent/50 p-2 rounded">
										<p className="text-xs text-muted-foreground">Pay Basis</p>
										<p className="font-medium text-sm">{job.payBasis}</p>
									</div>
									<div className="bg-accent/50 p-2 rounded">
										<p className="text-xs text-muted-foreground">Start</p>
										<p className="font-medium text-sm">
											{new Date(job.startDate).toLocaleDateString()}
										</p>
									</div>
									<div className="bg-accent/50 p-2 rounded">
										<p className="text-xs text-muted-foreground">End</p>
										<p className="font-medium text-sm">
											{new Date(job.endDate).toLocaleDateString()}
										</p>
									</div>
									<div className="bg-muted/30 p-2 rounded flex items-center justify-center">
										<span className="text-xs text-muted-foreground">
											🔒 Sign in
										</span>
									</div>
								</div>
							</>
						)}
					</div>
				</button>
			))}
		</div>
	);
}

export default JobList;
