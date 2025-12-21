"use client";

import { TooltipTrigger } from "@radix-ui/react-tooltip";
import {
	ArrowRight,
	Bookmark,
	Briefcase,
	Clock,
	Copy,
	ExternalLink,
	Facebook,
	Lock,
	MapPin,
	MessageSquare,
	MoreHorizontal,
	Phone,
	ShieldCheck,
	Star,
	User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useToggleBookmark } from "@/lib/hooks/useBookmark";
import type { JobResponse } from "@/lib/rpc";
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
	const toggleBookmark = useToggleBookmark();

	type SingleJob = NonNullable<typeof jobListings>["jobs"][number];

	const [selectedJob, setSelectedJob] = useState<SingleJob | null>(null);
	const [localBookmarkState, setLocalBookmarkState] = useState<
		Record<string, boolean>
	>({});

	// Get isBookmarked: local state takes priority, fallback to server data
	const isBookmarked =
		selectedJob?.id && selectedJob.id in localBookmarkState
			? localBookmarkState[selectedJob.id]
			: selectedJob && "isBookmarked" in selectedJob
				? selectedJob.isBookmarked
				: false;

	const handleToggleBookmark = () => {
		if (!selectedJob?.id) return;
		// Optimistically update local state
		setLocalBookmarkState((prev) => ({
			...prev,
			[selectedJob.id]: !isBookmarked,
		}));
		toggleBookmark.mutate(selectedJob.id, {
			onError: () => {
				// Revert on error
				setLocalBookmarkState((prev) => ({
					...prev,
					[selectedJob.id]: isBookmarked,
				}));
			},
		});
	};

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
			<div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
				<div className="p-6 flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 animate-pulse">
							<Briefcase className="w-5 h-5 text-slate-400" />
						</div>
						<p className="text-sm text-slate-500">Loading job details...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
				<div className="p-6">
					<div className="flex flex-col items-center justify-center text-center py-10">
						<div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
							<Lock className="w-7 h-7 text-slate-400" />
						</div>
						<h3 className="font-semibold text-slate-900 mb-2">
							Sign In Required
						</h3>
						<p className="text-sm text-slate-500 mb-6 max-w-sm">
							You need to be logged in and verified to view full job details and
							apply.
						</p>
						<Button onClick={() => router.push("/login")}>
							Sign In to Continue
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (!selectedJob) {
		return (
			<div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
				<div className="p-6">
					<div className="flex flex-col items-center justify-center text-center py-10">
						<div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
							<Briefcase className="w-7 h-7 text-blue-500" />
						</div>
						<h3 className="font-semibold text-slate-900 mb-2">Select a Job</h3>
						<p className="text-sm text-slate-500 max-w-sm">
							Choose a job from the list to view details, requirements, and
							apply.
						</p>
					</div>
				</div>
			</div>
		);
	}

	const hasFullAccess = "createdAt" in selectedJob;

	if (!hasFullAccess) {
		return (
			<div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
				<div className="p-6">
					<div className="flex flex-col items-center justify-center text-center py-8">
						<div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
							<ShieldCheck className="w-7 h-7 text-amber-500" />
						</div>
						<h3 className="font-semibold text-slate-900 mb-2">
							Verification Required
						</h3>
						<p className="text-sm text-slate-500 mb-6 max-w-sm">
							Complete your doctor verification to view full job details,
							contact information, and apply.
						</p>

						<div className="bg-slate-50 rounded-lg p-4 mb-6 text-left w-full max-w-sm">
							<p className="text-xs font-medium text-slate-700 mb-2">
								What you&apos;ll unlock:
							</p>
							<ul className="space-y-1.5 text-xs text-slate-500">
								<li className="flex items-center gap-2">
									<div className="w-1 h-1 rounded-full bg-emerald-500" />
									Full clinic information & contact
								</li>
								<li className="flex items-center gap-2">
									<div className="w-1 h-1 rounded-full bg-emerald-500" />
									Detailed pay rates & benefits
								</li>
								<li className="flex items-center gap-2">
									<div className="w-1 h-1 rounded-full bg-emerald-500" />
									Apply to unlimited jobs
								</li>
							</ul>
						</div>

						<Button onClick={() => router.push("/profile")}>
							Complete Verification
							<ArrowRight className="w-4 h-4 ml-1" />
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Calculate average rating
	const avgRating =
		selectedJob.facility.facilityReviews &&
		selectedJob.facility.facilityReviews.length > 0
			? selectedJob.facility.facilityReviews.reduce((a, b) => a + b.rating, 0) /
				selectedJob.facility.facilityReviews.length
			: 0;

	return (
		<div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden md:sticky md:top-20 md:max-h-[calc(100vh-6rem)]">
			{/* Header */}
			<div className="p-4 border-b border-slate-100">
				<div className="flex items-start justify-between mb-3">
					<div className="flex-1 min-w-0">
						<h3 className="font-bold text-slate-900 text-lg mb-1">
							{selectedJob.title || "Locum Position"}
						</h3>
						<p className="text-sm text-slate-500">
							{selectedJob.facility.name}
						</p>
					</div>
					<div className="text-right shrink-0 ml-4">
						<div className="text-xl font-bold text-emerald-600">
							RM {selectedJob.payRate}
						</div>
						<div className="text-[10px] text-slate-400 uppercase">
							per {selectedJob.payBasis?.toLowerCase() || "day"}
						</div>
					</div>
				</div>

				{/* Meta info */}
				<div className="flex flex-wrap items-center gap-3 text-xs">
					<span className="flex items-center gap-1 text-slate-500">
						<MapPin className="w-3.5 h-3.5" />
						{selectedJob.facility.address?.split(",")[0] || "Location"}
					</span>
					<span className="flex items-center gap-1 text-slate-500">
						<Clock className="w-3.5 h-3.5" />
						{selectedJob.startTime} - {selectedJob.endTime}
					</span>
					{avgRating > 0 && (
						<span className="flex items-center gap-1 text-amber-500">
							<Star className="w-3.5 h-3.5 fill-current" />
							{avgRating.toFixed(1)}
						</span>
					)}
					{selectedJob.requiredSpecialists && (
						<span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full">
							{selectedJob.requiredSpecialists}
						</span>
					)}
				</div>

				{/* Action buttons */}
				<div className="flex items-center gap-2 mt-3">
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								onClick={() => window.open(`/jobs/${selectedJob.id}`, "_blank")}
								className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
							>
								<ExternalLink className="w-4 h-4 text-slate-500" />
							</button>
						</TooltipTrigger>
						<TooltipContent>Open in new tab</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								onClick={handleToggleBookmark}
								disabled={toggleBookmark.isPending}
								className={`p-2 rounded-lg border transition-colors disabled:opacity-50 ${
									isBookmarked
										? "border-amber-200 bg-amber-50 text-amber-500"
										: "border-slate-200 hover:bg-slate-50 text-slate-500"
								}`}
							>
								<Bookmark
									className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
								/>
							</button>
						</TooltipTrigger>
						<TooltipContent>
							{isBookmarked ? "Remove bookmark" : "Bookmark job"}
						</TooltipContent>
					</Tooltip>

					<Popover>
						<PopoverTrigger asChild>
							<button
								type="button"
								className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
							>
								<MoreHorizontal className="w-4 h-4 text-slate-500" />
							</button>
						</PopoverTrigger>
						<PopoverContent className="w-44 p-1.5">
							<button
								type="button"
								className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
							>
								<Facebook className="w-4 h-4" />
								Share to Facebook
							</button>
							<button
								type="button"
								className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
							>
								<MessageSquare className="w-4 h-4" />
								Share via WhatsApp
							</button>
							<button
								type="button"
								className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
							>
								<Copy className="w-4 h-4" />
								Copy Link
							</button>
						</PopoverContent>
					</Popover>
				</div>
			</div>

			{/* Content - Scrollable */}
			<div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-20rem)]">
				{/* Date & Duration Cards */}
				<div className="grid grid-cols-3 gap-2">
					<div className="bg-slate-50 rounded-lg p-3">
						<div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">
							Start Date
						</div>
						<div className="text-sm font-semibold text-slate-900">
							{new Date(selectedJob.startDate).toLocaleDateString("en-MY", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</div>
					</div>
					<div className="bg-slate-50 rounded-lg p-3">
						<div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">
							End Date
						</div>
						<div className="text-sm font-semibold text-slate-900">
							{new Date(selectedJob.endDate).toLocaleDateString("en-MY", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</div>
					</div>
					<div
						className={`rounded-lg p-3 ${
							selectedJob.urgency === "HIGH"
								? "bg-red-50"
								: selectedJob.urgency === "MEDIUM"
									? "bg-amber-50"
									: "bg-emerald-50"
						}`}
					>
						<div
							className={`text-[10px] uppercase tracking-wide mb-1 ${
								selectedJob.urgency === "HIGH"
									? "text-red-500"
									: selectedJob.urgency === "MEDIUM"
										? "text-amber-500"
										: "text-emerald-500"
							}`}
						>
							Urgency
						</div>
						<div
							className={`text-sm font-semibold ${
								selectedJob.urgency === "HIGH"
									? "text-red-700"
									: selectedJob.urgency === "MEDIUM"
										? "text-amber-700"
										: "text-emerald-700"
							}`}
						>
							{selectedJob.urgency || "Normal"}
						</div>
					</div>
				</div>

				{/* Description */}
				{selectedJob.description && (
					<div>
						<h4 className="text-xs font-semibold text-slate-700 mb-2">
							Job Description
						</h4>
						<p className="text-sm text-slate-500 leading-relaxed">
							{selectedJob.description}
						</p>
					</div>
				)}

				{/* Facility Address */}
				<div>
					<h4 className="text-xs font-semibold text-slate-700 mb-2">
						Location
					</h4>
					<div className="flex items-start gap-2 text-sm text-slate-500">
						<MapPin className="w-4 h-4 shrink-0 mt-0.5" />
						<span>{selectedJob.facility.address}</span>
					</div>
				</div>

				{/* Contact Person */}
				{selectedJob.facility.contactInfo &&
					selectedJob.facility.contactInfo.length > 0 && (
						<div>
							<h4 className="text-xs font-semibold text-slate-700 mb-2">
								Contact Person
							</h4>
							<div className="space-y-2">
								{selectedJob.facility.contactInfo.map((contact, index) => (
									<div
										key={index}
										className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
									>
										<div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
											<User className="w-4 h-4 text-slate-500" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-slate-900">
												{contact.name}
											</p>
											<p className="text-xs text-slate-500">
												{contact.position}
											</p>
										</div>
										{contact.contact && (
											<a
												href={`tel:${contact.contact}`}
												className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
											>
												<Phone className="w-4 h-4 text-slate-500" />
											</a>
										)}
									</div>
								))}
							</div>
						</div>
					)}

				{/* Posted date */}
				<p className="text-[10px] text-slate-400">
					Posted{" "}
					{new Date(selectedJob.createdAt).toLocaleDateString("en-MY", {
						month: "long",
						day: "numeric",
						year: "numeric",
					})}
				</p>
			</div>

			{/* Sticky Apply Button */}
			<div className="p-4 border-t border-slate-100 bg-white">
				<ApplyJobDialog
					trigger={
						<Button className="w-full" size="lg">
							Apply Now
							<ArrowRight className="w-4 h-4 ml-2" />
						</Button>
					}
					jobTitle={selectedJob.title}
					jobId={selectedJob.id}
				/>
			</div>
		</div>
	);
}

export default JobDetails;
