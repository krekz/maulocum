import { Briefcase, SearchX } from "lucide-react";
import { headers } from "next/headers";
import { Suspense } from "react";
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
								<Suspense
									fallback={
										<div className="flex gap-4">
											<div className="w-[340px] shrink-0 space-y-3">
												{Array.from({ length: 4 }).map((_, i) => (
													<div
														key={i}
														className="bg-white rounded-xl p-4 border border-slate-100 animate-pulse"
													>
														<div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
														<div className="h-6 bg-slate-200 rounded w-1/2 mb-2" />
														<div className="h-3 bg-slate-100 rounded w-2/3" />
													</div>
												))}
											</div>
											<div className="flex-1 bg-white rounded-xl border border-slate-100 animate-pulse p-6">
												<div className="h-6 bg-slate-200 rounded w-1/2 mb-4" />
												<div className="h-4 bg-slate-100 rounded w-3/4 mb-6" />
												<div className="grid grid-cols-3 gap-3 mb-6">
													{Array.from({ length: 3 }).map((_, i) => (
														<div
															key={i}
															className="h-16 bg-slate-100 rounded-lg"
														/>
													))}
												</div>
											</div>
										</div>
									}
								>
									<div className="flex flex-col md:flex-row gap-4">
										<JobList jobListings={data} />
										<JobDetails jobListings={data} />
									</div>
								</Suspense>
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
