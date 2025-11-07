import { Suspense } from "react";
import JobDetails from "@/components/jobs/job-details";
import JobFilter from "@/components/jobs/job-filter";
import JobList from "@/components/jobs/job-list";
import { backendApi } from "@/lib/rpc-client";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function JobsPage() {
	const headersList = await headers();
	const cookie = headersList.get("cookie");

	const jobs = await backendApi.api.v2.jobs.$get(
		{
			query: {
				page: "1",
				limit: "10",
			},
		},
		{
			headers: {
				cookie: cookie || "",
			},
		},
	);

	if (!jobs.ok) {
		throw new Error("Failed to fetch jobs");
	}

	const data = await jobs.json();

	return (
		<div>
			<JobFilter />
			<div className="px-3 lg:container flex flex-col md:flex-row w-full gap-2 py-5">
				{/* Left Side (Scrollable Job Listings) */}
				<Suspense fallback={<div>Loading...</div>}>
					<JobList jobListings={data} />
					<JobDetails jobListings={data} />
				</Suspense>
				{/* Right Side (Sticky Details Pane) */}
			</div>
		</div>
	);
}

export default JobsPage;
