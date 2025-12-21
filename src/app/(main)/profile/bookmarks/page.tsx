"use client";

import { format } from "date-fns";
import { Bookmark, Calendar, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useBookmarks, useToggleBookmark } from "@/lib/hooks/useBookmark";

function BookmarkPage() {
	const { data, isLoading } = useBookmarks();
	const toggleBookmarkMutation = useToggleBookmark();

	const formatPayRate = (payRate: string, payBasis: string) => {
		const basis = payBasis === "HOURLY" ? "/hr" : "/day";
		return `RM ${payRate}${basis}`;
	};

	if (isLoading) {
		return (
			<div className="min-h-[50vh] flex items-center justify-center">
				<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const bookmarkedJobs = data?.data ?? [];

	if (bookmarkedJobs.length === 0) {
		return (
			<div className="min-h-[50vh] flex flex-col items-center justify-center rounded-xl px-6 py-10 text-center shadow-sm">
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<Bookmark className="w-5 h-5 text-muted-foreground" />
				</div>
				<h2 className="text-xl font-semibold tracking-tight">
					No Bookmarks Yet
				</h2>
				<p className="mt-2 max-w-md text-sm text-muted-foreground">
					Save jobs you&apos;re interested in to quickly access them later.
				</p>
				<div className="mt-6">
					<Link
						href="/jobs"
						className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
					>
						Browse Locum Jobs
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
			{/* Header */}
			<div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
				<h3 className="font-semibold text-slate-900 text-sm">Saved Jobs</h3>
				<div className="text-xs text-muted-foreground">
					{bookmarkedJobs.length} bookmark
					{bookmarkedJobs.length !== 1 ? "s" : ""}
				</div>
			</div>

			{/* Bookmarks List */}
			<div className="divide-y divide-slate-50">
				{bookmarkedJobs.map((job) => (
					<div
						key={job.id}
						className="p-4 hover:bg-slate-50/50 transition-colors"
					>
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1 min-w-0">
								{/* Title & Specialist Badge */}
								<div className="flex items-center gap-2 mb-1">
									<h4 className="font-medium text-slate-900 text-sm truncate">
										{job.title ?? "Untitled Job"}
									</h4>
									{job.specialist && (
										<span className="shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
											{job.specialist}
										</span>
									)}
								</div>

								{/* Facility Name */}
								<p className="text-xs text-slate-500 mb-2">
									{job.facilityName}
								</p>

								{/* Meta Info */}
								<div className="flex items-center gap-3 text-xs text-slate-400">
									<span className="flex items-center gap-1">
										<Calendar className="w-3 h-3" />
										{format(new Date(job.date), "dd MMM yyyy")}
									</span>
									{job.location && (
										<span className="flex items-center gap-1">
											<MapPin className="w-3 h-3" />
											{job.location}
										</span>
									)}
									<span className="font-medium text-emerald-600">
										{formatPayRate(job.payRate, job.payBasis)}
									</span>
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-2 shrink-0">
								<button
									type="button"
									onClick={() => toggleBookmarkMutation.mutate(job.id)}
									disabled={toggleBookmarkMutation.isPending}
									className="p-1.5 rounded-md text-amber-500 hover:bg-amber-50 transition-colors disabled:opacity-50"
									title="Remove bookmark"
								>
									<Bookmark className="w-4 h-4 fill-current" />
								</button>
								<Link
									href={`/jobs/${job.id}`}
									className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
								>
									View Details
								</Link>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default BookmarkPage;
