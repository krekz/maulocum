import { Briefcase, Clock, TrendingUp, Users } from "lucide-react";
import { cookies } from "next/headers";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { backendApi } from "@/lib/rpc";
import { ApplicantsDataTable } from "./_components/applicants-data-table";
import { columns } from "./_components/columns";

async function JobApplicantsPage() {
	const cookie = await cookies();
	const res = await backendApi.api.v2.facilities.jobs.applicants.$get(
		undefined,
		{
			headers: {
				cookie: cookie.toString(),
			},
		},
	);

	const json = await res.json();
	const applicants = json.data ?? [];

	// Calculate stats
	const totalApplicants = applicants.length;
	const pendingCount = applicants.filter((a) => a.status === "PENDING").length;
	const acceptedCount = applicants.filter(
		(a) => a.status === "DOCTOR_CONFIRMED",
	).length;
	const uniqueJobs = new Set(applicants.map((a) => a.job.id)).size;

	const stats = [
		{
			title: "Total Applications",
			value: totalApplicants,
			description: "All time applications",
			icon: Users,
			trend: null,
		},
		{
			title: "Pending Review",
			value: pendingCount,
			description: "Awaiting your decision",
			icon: Clock,
			trend: pendingCount > 0 ? "action-needed" : null,
		},
		{
			title: "Accepted",
			value: acceptedCount,
			description: "Successfully hired",
			icon: TrendingUp,
			trend: null,
		},
		{
			title: "Active Jobs",
			value: uniqueJobs,
			description: "Jobs with applications",
			icon: Briefcase,
			trend: null,
		},
	];

	return (
		<div className="flex flex-col gap-6 mx-4 sm:mx-0">
			{/* Page Header */}
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-bold tracking-tight">Job Applicants</h1>
				<p className="text-muted-foreground">
					Review and manage applications from doctors for your job postings.
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">
				{stats.map((stat) => (
					<Card key={stat.title}>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								{stat.title}
							</CardTitle>
							<stat.icon className="size-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className="text-xs text-muted-foreground">
								{stat.description}
							</p>
							{stat.trend === "action-needed" && (
								<p className="mt-1 text-xs text-yellow-600 font-medium">
									Action needed
								</p>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{/* Data Table */}
			<Card>
				<CardHeader className="border-b">
					<CardTitle>All Applications</CardTitle>
					<CardDescription>
						A comprehensive list of all job applications received. Click on
						column headers to sort.
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-6">
					<ApplicantsDataTable columns={columns} data={applicants} />
				</CardContent>
			</Card>
		</div>
	);
}

export default JobApplicantsPage;
