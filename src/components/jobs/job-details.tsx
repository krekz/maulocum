"use client";

import { TooltipTrigger } from "@radix-ui/react-tooltip";
import {
	Bookmark,
	Copy,
	Facebook,
	MessageSquare,
	MoreHorizontal,
	SquareArrowOutUpRight,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { JobResponse } from "@/lib/rpc-client";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tooltip, TooltipContent } from "../ui/tooltip";
import ApplyJobDialog from "./apply-jobs-dialog";

function JobDetails({ jobListings: data }: { jobListings?: JobResponse }) {
	const { data: session, isPending } = authClient.useSession();
	const jobListings = data?.data;
	const searchParams = useSearchParams();
	const router = useRouter();
	const selectedJobId = searchParams.get("id");

	type SingleJob = NonNullable<typeof jobListings>["jobs"][number];

	const [selectedJob, setSelectedJob] = useState<SingleJob | null>(null);

	useEffect(() => {
		if (selectedJobId && jobListings?.jobs) {
			const job = jobListings.jobs.find((j) => j.id === selectedJobId);
			setSelectedJob(job || null);
		} else {
			setSelectedJob(null);
		}
	}, [selectedJobId, jobListings?.jobs]);

	if (isPending) {
		return (
			<div className="w-full md:sticky md:top-20 h-auto md:h-full flex items-center justify-center p-4 rounded-lg shadow-sm bg-card border">
				<p className="text-muted-foreground">Loading Jobs...</p>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="w-full md:sticky md:top-20 h-auto md:h-full overflow-y-auto border p-4 rounded-lg shadow-sm bg-card/80 backdrop-blur-sm">
				<h4 className="font-semibold text-lg mb-4 bg-card/90 backdrop-blur-md py-2 border-b flex items-center gap-2">
					<span className="text-primary">🔒</span> Locum Details
				</h4>
				<div className="flex flex-col items-center justify-center text-center p-4 bg-muted/30 rounded-lg border border-dashed">
					<div className="mb-4 p-3 bg-background/80 rounded-full">
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-muted-foreground"
						>
							<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
							<path d="M7 11V7a5 5 0 0 1 10 0v4" />
						</svg>
					</div>
					<p className="mb-4 text-muted-foreground">
						You need to be logged in and verified to view job details.
					</p>
					<Button
						className="mt-2 w-full sm:w-auto"
						variant="default"
						onClick={() => router.push("/login")}
					>
						Sign In
					</Button>
				</div>
			</div>
		);
	}

	if (!selectedJob) {
		return (
			<div className="w-full h-full overflow-y-auto border p-4 rounded-lg shadow-sm bg-card">
				<h4 className="font-semibold text-lg mb-4 sticky top-0 bg-card py-2 border-b">
					Locum Details
				</h4>
				<p className="mb-4 text-muted-foreground">
					Select a job from the list on the left to see more details here. This
					panel will stick to the top as you scroll through jobs.
				</p>
			</div>
		);
	}

	const hasFullAccess = "createdAt" in selectedJob;

	if (!hasFullAccess) {
		const limitedJob = selectedJob;
		return (
			<div className="w-full md:sticky md:top-20 h-auto md:max-h-[calc(97vh-4rem)] overflow-y-auto p-4 rounded-lg border bg-card">
				<div className="flex items-center justify-between font-semibold text-lg mb-4 py-2 border-b">
					<h4 className="flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
							<path d="M7 11V7a5 5 0 0 1 10 0v4" />
						</svg>
						Limited Access
					</h4>
				</div>
				<div className="space-y-6">
					<div className="bg-muted/30 rounded-lg p-6 border border-dashed text-center">
						<div className="mb-4 p-4 bg-background/80 rounded-full inline-flex">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="text-muted-foreground"
							>
								<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
								<path d="M7 11V7a5 5 0 0 1 10 0v4" />
							</svg>
						</div>
						<h5 className="font-semibold mb-2">
							Sign in as Doctor to View Full Details
						</h5>
						<p className="text-sm text-muted-foreground mb-4">
							Get access to complete job information, facility details, and
							apply to positions.
						</p>
						<Button onClick={() => router.push("/login")}>Sign In</Button>
					</div>

					<div className="space-y-4">
						<h5 className="font-medium">Available Information</h5>
						<div className="grid grid-cols-2 gap-3">
							<div className="bg-accent/50 p-3 rounded">
								<p className="text-xs text-muted-foreground mb-1">Pay Basis</p>
								<p className="font-medium">{limitedJob.payBasis}</p>
							</div>
							<div className="bg-accent/50 p-3 rounded">
								<p className="text-xs text-muted-foreground mb-1">Start Date</p>
								<p className="font-medium">
									{new Date(limitedJob.startDate).toLocaleDateString()}
								</p>
							</div>
							<div className="bg-accent/50 p-3 rounded">
								<p className="text-xs text-muted-foreground mb-1">End Date</p>
								<p className="font-medium">
									{new Date(limitedJob.endDate).toLocaleDateString()}
								</p>
							</div>
							<div className="bg-muted/30 p-3 rounded flex items-center justify-center">
								<span className="text-sm text-muted-foreground">
									🔒 More details locked
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full md:sticky md:top-20 h-auto md:max-h-[calc(97vh-4rem)] overflow-y-auto p-4 rounded-lg">
			<div className="flex items-center justify-between font-semibold text-lg mb-4 py-2 border-b">
				<h4>Locum Details</h4>
				<div className="flex items-center gap-2">
					<Tooltip>
						<TooltipTrigger
							className="h-8 w-8 cursor-pointer"
							onClick={() => window.open(`/jobs/${selectedJob.id}`, "_blank")}
						>
							<SquareArrowOutUpRight className="h-4 w-4" />
							<span className="sr-only">Open in new tab</span>
						</TooltipTrigger>
						<TooltipContent>
							<p>Open in new tab</p>
						</TooltipContent>
					</Tooltip>

					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 cursor-pointer"
					>
						<Bookmark className="h-4 w-4" />
						<span className="sr-only">Bookmark</span>
					</Button>
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreHorizontal className="h-4 w-4" />
								<span className="sr-only">More options</span>
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-48 p-2">
							<div className="flex flex-col gap-1">
								<Button
									variant="ghost"
									size="sm"
									className="flex justify-start"
								>
									<Facebook className="mr-2 h-4 w-4" />
									<span>Share to Facebook</span>
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="flex justify-start"
								>
									<MessageSquare className="mr-2 h-4 w-4" />
									<span>Share via WhatsApp</span>
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="flex justify-start"
								>
									<Copy className="mr-2 h-4 w-4" />
									<span>Copy Link</span>
								</Button>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			<div className="space-y-6 bg-white rounded-lg">
				{/* Clinic Information at the top */}
				<div className="mb-4">
					<h5 className="text-xl font-semibold mb-2">
						{selectedJob.facility.name}
					</h5>
					<div className="flex items-center mb-2">
						<div className="flex items-center">
							{selectedJob.facility.reviews &&
								selectedJob.facility.reviews.length > 0 && (
									<span className="text-amber-500">
										{"★".repeat(
											Math.floor(
												selectedJob.facility.reviews
													.map((review) => review.rating)
													.reduce((a, b) => a + b, 0) /
													selectedJob.facility.reviews.length,
											),
										)}
									</span>
								)}
							{/* <span className="text-muted-foreground">
								{"★".repeat(5 - Math.floor(selectedJob.rating))}
							</span> */}
							{/* <span className="text-sm ml-1 font-medium">
								{selectedJob.rating}
							</span> */}
						</div>
						{/* <span className="text-xs text-muted-foreground ml-2">
							({selectedJob.reviewCount} reviews by locums)
						</span> */}
					</div>
					<p className="text-sm text-muted-foreground">
						{selectedJob.facility.address}
					</p>
					{/* <a
						href={selectedJob.gmapLink}
						target="_blank"
						rel="noopener noreferrer"
						className="text-xs text-primary hover:underline mt-1 inline-block"
					>
						View on Google Maps
					</a> */}
				</div>

				{/* Key Information */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
					<div className="flex flex-col">
						<span className="text-xs uppercase text-muted-foreground">
							Location
						</span>
						{/* <span className="font-medium">
							{selectedJob.address.split(",")[2]?.trim() || "Location"}
						</span> */}
					</div>
					<div className="flex flex-col">
						<span className="text-xs uppercase text-muted-foreground">
							Payment
						</span>
						<span className="font-medium">{selectedJob.payBasis}</span>
					</div>
					<div className="flex flex-col">
						<span className="text-xs uppercase text-muted-foreground">
							Specialist
						</span>
						<span className="font-medium">General Practitioner</span>
					</div>
				</div>

				{/* Highlighted Dates, Urgency & Hours */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
					<div className="bg-blue-50 rounded-lg p-3 flex-1">
						<h6 className="text-xs uppercase text-blue-700 font-semibold mb-1">
							Dates Needed
						</h6>
						<p className="text-blue-900 font-medium">
							{selectedJob.startDate} - {selectedJob.endDate}
						</p>
					</div>
					<div className="bg-purple-50 rounded-lg p-3 flex-1">
						<h6 className="text-xs uppercase text-purple-700 font-semibold mb-1">
							Working Hours
						</h6>
						<p className="text-purple-900 font-medium">
							{selectedJob.startTime} - {selectedJob.endTime}
						</p>
					</div>
					<div
						className={`rounded-lg p-3 flex-1 ${
							selectedJob.urgency === "HIGH"
								? "bg-red-50 text-red-900"
								: selectedJob.urgency === "MEDIUM"
									? "bg-orange-50 text-orange-900"
									: selectedJob.urgency === "LOW"
										? "bg-green-50 text-green-900"
										: "bg-green-50 text-green-900"
						}`}
					>
						<h6
							className={`text-xs uppercase font-semibold mb-1 ${
								selectedJob.urgency === "HIGH"
									? "text-red-700"
									: selectedJob.urgency === "MEDIUM"
										? "text-orange-700"
										: selectedJob.urgency === "LOW"
											? "text-yellow-700"
											: "text-green-700"
							}`}
						>
							Urgency Level
						</h6>
						<p className="font-medium">{selectedJob.urgency}</p>
					</div>
				</div>

				{/* Description */}
				<div className="mb-4">
					<h5 className="font-medium mb-2">Description</h5>
					<p className="text-sm text-muted-foreground">
						{selectedJob.description}
					</p>
					<p className="text-xs text-muted-foreground mt-2">
						Posted {selectedJob.createdAt}
					</p>
				</div>

				{/* Rest of the details */}
				{/* <div className="mb-4">
					<h5 className="font-medium mb-2">Job Responsibilities</h5>
					<ul className="text-sm space-y-1.5">
						{selectedJob.responsibilities.map((responsibility, index) => (
							<li key={index} className="flex gap-2">
								<span className="text-primary">•</span>
								<span>{responsibility}</span>
							</li>
						))}
					</ul>
				</div> */}

				{/* <div className="mb-4">
					<h5 className="font-medium mb-2">Facilities & Support</h5>
					<p className="text-sm text-muted-foreground">
						{selectedJob.facilities}
					</p>
				</div> */}

				{/* <div className="mb-4">
					<h5 className="font-medium mb-2">Payment Details</h5>
					<p className="text-sm text-muted-foreground">{selectedJob.payment}</p>
				</div> */}

				<div>
					<h5 className="font-medium mb-2">Contact Person</h5>
					{selectedJob.facility.contactInfo?.map((contact, index) => (
						<div key={index} className="mb-2">
							<p className="text-sm font-medium">
								{contact.name}{" "}
								<span className="font-normal text-muted-foreground">
									({contact.position})
								</span>
							</p>
							<p className="text-sm text-muted-foreground">{contact.contact}</p>
						</div>
					))}
				</div>
			</div>

			<div className="sticky bottom-0 bg-card pt-4 pb-2 border-t mt-6">
				<ApplyJobDialog
					trigger={<Button>Apply Now</Button>}
					jobTitle={selectedJob.title}
				/>
			</div>
		</div>
	);
}

export default JobDetails;
