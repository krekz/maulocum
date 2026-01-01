"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import type { JobResponse } from "@/lib/rpc";
import { Sheet, SheetContent } from "../ui/sheet";
import JobDetails from "./job-details";
import JobList from "./job-list";

interface JobsResponsiveWrapperProps {
	jobListings: JobResponse;
}

export function JobsResponsiveWrapper({
	jobListings,
}: JobsResponsiveWrapperProps) {
	const isMobile = useIsMobile();
	const searchParams = useSearchParams();
	const selectedJobId = searchParams.get("id");
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	// Open sheet when job is selected on mobile
	useEffect(() => {
		if (isMobile && selectedJobId) {
			setIsSheetOpen(true);
		}
	}, [isMobile, selectedJobId]);

	// Close sheet handler
	const handleSheetClose = () => {
		setIsSheetOpen(false);
		// Clear the job ID from URL when closing sheet
		const url = new URL(window.location.href);
		url.searchParams.delete("id");
		window.history.pushState({}, "", url.toString());
	};

	if (isMobile) {
		return (
			<>
				<JobList jobListings={jobListings} />
				<Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
					<SheetContent side="bottom" className="h-[90vh] p-0">
						<div className="h-full overflow-y-auto">
							<JobDetails jobListings={jobListings} isMobileSheet />
						</div>
					</SheetContent>
				</Sheet>
			</>
		);
	}

	// Desktop view - side by side
	return (
		<div className="flex flex-col md:flex-row gap-4">
			<JobList jobListings={jobListings} />
			<JobDetails jobListings={jobListings} />
		</div>
	);
}
