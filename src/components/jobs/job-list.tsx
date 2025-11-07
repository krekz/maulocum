"use client";

import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import type { JobResponse } from "@/lib/rpc-client";

function JobList({ jobListings }: { jobListings: JobResponse }) {
	const { session, isPending } = useSession();
	const handleJobClick = (jobId: string) => {
		// Update URL with the selected job ID in the query parameters
		const url = new URL(window.location.href);
		url.searchParams.set("id", jobId);
		window.history.pushState({}, "", url.toString());
	};

	// Get the currently selected job ID from URL search params
	const searchParams = useSearchParams();
	const selectedJobId = searchParams.get("id");

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

	return (
		<div className="w-full md:w-2/3 space-y-2">
			{jobListings.jobs.map((job) => (
				<button
					onClick={() => handleJobClick(job.id)}
					key={job.id}
					className={`bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
						selectedJobId === job.id
							? "border border-primary"
							: "border border-border hover:border-primary"
					}`}
				>
					{/* Job Card Content */}
					<div className="flex flex-col space-y-4">
						<div className="flex justify-between items-start">
							<div>
								<h3 className="text-xl font-semibold">
									{session ? (
										job.facility.name
									) : (
										<span className="blur-sm">Klinik Kesihatan</span>
									)}
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
										className="lucide lucide-map-pin"
									>
										<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
										<circle cx="12" cy="10" r="3" />
									</svg>
									{job.facility.address}
								</p>
							</div>
							<div
								className={`h-10 w-10 rounded-full flex items-center justify-center ${session ? "bg-primary/10" : "bg-muted blur-sm"}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className={`${session ? "text-primary" : "text-muted-foreground"}`}
								>
									<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
								</svg>
							</div>
						</div>

						<div className="text-sm">
							<p className="mb-2">
								{session ? (
									job.description
								) : (
									<span className="blur-sm">
										Lorem ipsum dolor sit amet, consectetur adipisicing elit.
										Eum, itaque adipisci? Minus reprehenderit explicabo rerum
										voluptates aspernatur mollitia provident blanditiis
										architecto repudiandae porro, assumenda consectetur sed est,
										sit aliquam et!
									</span>
								)}
							</p>
							{/* <p className="text-muted-foreground">{job.requirements}</p> */}
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="bg-accent/50 p-2 rounded">
								<p className="text-xs text-muted-foreground">Specialist</p>
								<p className="font-medium">{job.requiredSpecialists}</p>
							</div>
							<div className="bg-accent/50 p-2 rounded">
								<p className="text-xs text-muted-foreground">Pay Rate</p>
								<p className="font-medium text-green-600">{job.payRate}</p>
							</div>
							<div className="bg-accent/50 p-2 rounded">
								<p className="text-xs text-muted-foreground">Duration</p>
								<p className="font-medium">{job.startDate}</p>
							</div>
							<div className="bg-accent/50 p-2 rounded">
								<p className="text-xs text-muted-foreground">Date</p>
								<p className="font-medium">{job.endDate}</p>
							</div>
						</div>
					</div>
				</button>
			))}
		</div>
	);
}

export default JobList;
