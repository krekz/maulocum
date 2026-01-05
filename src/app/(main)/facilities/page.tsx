import { Building2, SearchX } from "lucide-react";
import { backendApi } from "@/lib/rpc";
import { FacilitiesSearchClient } from "./_components/facilities-search-client";
import { FacilityCard } from "./_components/facility-card";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
	search?: string;
	location?: string;
	page?: string;
}>;

async function FacilitiesPage({
	searchParams,
}: {
	searchParams: SearchParams;
}) {
	const params = await searchParams;

	// Build query object, only include non-empty values
	const query: Record<string, string> = {
		page: params.page || "1",
		limit: "12",
	};

	if (params.search) query.search = params.search;
	if (params.location && params.location !== "all")
		query.location = params.location;

	const facilities = await backendApi.api.v2.facilities.$get({
		query,
	});

	const data = await facilities.json();

	return (
		<div className="min-h-screen bg-slate-50">
			<FacilitiesSearchClient />
			<div className="lg:container mx-auto px-4 py-6">
				{(() => {
					switch (facilities.status) {
						case 200:
							return (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
									{data?.data?.facilities?.map((facility) => (
										<FacilityCard
											key={facility.id}
											id={facility.id}
											name={facility.name}
											profileImage={facility.profileImage}
											openJobs={facility._count.jobs}
										/>
									))}
								</div>
							);
						case 404:
							return (
								<div className="flex flex-col items-center justify-center py-20">
									<div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
										<SearchX className="w-8 h-8 text-slate-400" />
									</div>
									<h3 className="text-lg font-semibold text-slate-900 mb-1">
										No Facilities Found
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
										<Building2 className="w-8 h-8 text-red-400" />
									</div>
									<h3 className="text-lg font-semibold text-slate-900 mb-1">
										Failed to Load Facilities
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

export default FacilitiesPage;
