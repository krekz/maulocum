import { Briefcase, Plus } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { backendApi } from "@/lib/rpc";
import type { JobColumn } from "./_components/columns";
import { JobsTable } from "./_components/jobs-table";

export const dynamic = "force-dynamic";

async function JobsPage() {
	const cookie = (await headers()).get("cookie");
	const response = await backendApi.api.v2.facilities.jobs.$get(undefined, {
		headers: {
			cookie: cookie || "",
		},
	});

	const data = await response.json();

	if (!response.ok) {
		switch (response.status) {
			case 401:
			case 403:
				return notFound();
			case 404:
				return (
					<div className="px-6 w-full">
						<div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
							{data.message}
						</div>
					</div>
				);
			default:
				return (
					<div className="px-6 w-full">
						<div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
							Error loading jobs: {data.message}
						</div>
					</div>
				);
		}
	}

	const jobs = (data?.data || []) as JobColumn[];

	return (
		<div className="px-6 w-full space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-primary/10 rounded-lg">
						<Briefcase className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold">Job Postings</h1>
						<p className="text-sm text-muted-foreground">
							Manage your job listings and view applicants
						</p>
					</div>
				</div>
				<Button asChild>
					<Link href="/employer/dashboard/jobs/post">
						<Plus className="mr-2 h-4 w-4" />
						Post New Job
					</Link>
				</Button>
			</div>

			{/* Table or Empty State */}
			{jobs.length === 0 ? (
				<div className="bg-muted/50 rounded-lg p-12 text-center border-2 border-dashed">
					<Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
					<p className="text-muted-foreground mb-4">
						Create your first job posting to start receiving applications
					</p>
					<Button asChild>
						<Link href="/employer/dashboard/jobs/post">
							<Plus className="mr-2 h-4 w-4" />
							Post Your First Job
						</Link>
					</Button>
				</div>
			) : (
				<JobsTable data={jobs} />
			)}
		</div>
	);
}

export default JobsPage;
