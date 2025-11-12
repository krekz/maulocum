"use client";
import { Bookmark, CalendarIcon, GlobeIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function BookmarkPage() {
	const [bookmarkedJobs, setBookmarkedJobs] = React.useState([
		{
			id: 1,
			clinicName: "KL Medical Center",
			date: "12 May 2024",
			location: "Kuala Lumpur",
			specialist: "Emergency Medicine",
			fee: "RM 800/day",
		},
		{
			id: 2,
			clinicName: "Selangor Family Clinic",
			date: "18 May 2024",
			location: "Petaling Jaya, Selangor",
			specialist: "General Practice",
			fee: "RM 650/day",
		},
		{
			id: 3,
			clinicName: "Penang Health Center",
			date: "25 May 2024",
			location: "Georgetown, Penang",
			specialist: "Paediatrics",
			fee: "RM 750/day",
		},
	]);

	const removeBookmark = (id: number) => {
		setBookmarkedJobs(bookmarkedJobs.filter((job) => job.id !== id));
	};

	return (
		<>
			{/* Page Title (Desktop only) */}
			<div className="hidden md:flex items-center justify-between">
				<h1 className="text-3xl font-bold">Your Bookmarked Jobs</h1>
			</div>

			{/* No Bookmarks Message */}
			{bookmarkedJobs.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						You haven't bookmarked any jobs yet.
					</p>
					<Button className="mt-4" variant="outline" asChild>
						<Link href="/jobs">Browse Jobs</Link>
					</Button>
				</div>
			) : (
				<div className="grid gap-4">
					{bookmarkedJobs.map((job) => (
						<div
							key={job.id}
							className="border rounded-lg p-4 bg-card shadow-sm hover:shadow-md transition-shadow"
						>
							<div className="flex justify-between items-start">
								<div>
									<h3 className="font-semibold text-lg">{job.clinicName}</h3>
									<div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
										<CalendarIcon className="h-4 w-4" />
										<span>{job.date}</span>
									</div>
									<div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
										<GlobeIcon className="h-4 w-4" />
										<span>{job.location}</span>
									</div>
									<div className="mt-2 flex gap-2">
										<Badge variant="outline">{job.specialist}</Badge>
										<Badge variant="secondary">{job.fee}</Badge>
									</div>
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => removeBookmark(job.id)}
									className="text-muted-foreground hover:text-destructive"
								>
									<Bookmark className="h-5 w-5 fill-current" />
								</Button>
							</div>
							<div className="mt-4 flex justify-end">
								<Link
									href="/jobs/job1"
									className="px-4 py-2 bg-accent rounded-md hover:bg-accent/80 transition-colors"
								>
									View Details
								</Link>
							</div>
						</div>
					))}
				</div>
			)}
		</>
	);
}

export default BookmarkPage;
