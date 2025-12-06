import { Briefcase, SearchX } from "lucide-react";
import { headers } from "next/headers";
import JobDetails from "@/components/jobs/job-details";
import JobFilter from "@/components/jobs/job-filter";
import JobList from "@/components/jobs/job-list";
import { backendApi } from "@/lib/rpc";

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
		<div className="min-h-screen bg-slate-50">
			<JobFilter />
			<div className="lg:container mx-auto px-4 py-6">
				{(() => {
					switch (jobs.status) {
						case 200:
							return (
								<div className="flex flex-col md:flex-row gap-4">
									<JobList jobListings={data} />
									<JobDetails jobListings={data} />
								</div>
							);
						case 404:
							return (
								<div className="flex flex-col items-center justify-center py-20">
									<div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
										<SearchX className="w-8 h-8 text-slate-400" />
									</div>
									<h3 className="text-lg font-semibold text-slate-900 mb-1">
										No Jobs Found
									</h3>
									<p className="text-sm text-slate-500">
										Try adjusting your search filters
									</p>
								</div>
							);
						default:
							return (
								<div className="flex flex-col items-center justify-center py-20">
									<div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
										<Briefcase className="w-8 h-8 text-red-400" />
									</div>
									<h3 className="text-lg font-semibold text-slate-900 mb-1">
										Failed to Load Jobs
									</h3>
									<p className="text-sm text-slate-500">
										Please try again later
									</p>
								</div>
							);
					}
				})()}
			</div>
		</div>
	);
}

export default JobsPage;
