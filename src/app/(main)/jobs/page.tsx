import { headers } from "next/headers";
import { Suspense } from "react";
import JobDetails from "@/components/jobs/job-details";
import JobFilter from "@/components/jobs/job-filter";
import JobList from "@/components/jobs/job-list";
import { backendApi } from "@/lib/rpc-client";

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
	const data = await jobs.json();

	return (
		<div>
			<JobFilter />
			<div className="px-3 lg:container flex flex-col md:flex-row w-full gap-2 py-5">
				{(() => {
					switch (jobs.status) {
						case 200:
							return (
								<Suspense fallback={<div>Loading...</div>}>
									<JobList jobListings={data} />
									<JobDetails jobListings={data} />
								</Suspense>
							);
						case 404:
							return (
								<div className="w-full text-center py-10">
									<p className="text-red-500">Jobs not found</p>
								</div>
							);
						default:
							return (
								<div className="w-full text-center py-10">
									<p className="text-red-500">Failed to fetch jobs</p>
								</div>
							);
					}
				})()}
			</div>
		</div>
	);
}

export default JobsPage;
