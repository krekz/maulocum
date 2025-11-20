import { format } from "date-fns";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { backendApi } from "@/lib/rpc";

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

	const jobs = data?.data || [];

	if (jobs.length === 0) {
		return (
			<div className="px-6 w-full">
				<h1 className="text-2xl font-bold mb-6">Your Job Postings</h1>
				<div className="bg-muted/50 rounded-lg p-8 text-center">
					<p className="text-muted-foreground">
						No jobs posted yet. Create your first job posting!
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="px-6 w-full">
			<h1 className="text-2xl font-bold mb-6">Your Job Postings</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
				{jobs.map((job) => (
					<a
						key={job.id}
						href={`/employer/dashboard/jobs/${job.id}`}
						className="block group"
					>
						<div className="bg-card border rounded-lg shadow-sm p-6 h-full transition-all duration-200 hover:shadow-md hover:border-primary">
							<div className="flex justify-between items-start mb-4">
								<h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
									{job.title || job.facility.name}
								</h3>
								<div className="flex flex-col items-end gap-1">
									<span className="text-xs bg-muted px-2 py-1 rounded-full">
										Posted {format(new Date(job.createdAt), "MMM d, yyyy")}
									</span>
									<span
										className={`text-xs px-2 py-1 rounded-full ${
											job.status === "OPEN"
												? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
												: job.status === "FILLED"
													? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
													: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
										}`}
									>
										{job.status}
									</span>
									{job.urgency === "HIGH" && (
										<span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
											Urgent
										</span>
									)}
								</div>
							</div>

							<div className="space-y-3 text-sm text-muted-foreground">
								<div className="flex justify-between">
									<span>Start Date:</span>
									<span className="font-medium text-foreground">
										{format(new Date(job.startDate), "MMM d, yyyy")}
									</span>
								</div>
								<div className="flex justify-between">
									<span>Specialization:</span>
									<span className="font-medium text-foreground">
										{job.requiredSpecialists.join(", ")}
									</span>
								</div>
								<div className="flex justify-between">
									<span>Pay Rate:</span>
									<span className="font-medium text-foreground">
										RM{job.payRate}/{job.payBasis.toLowerCase()}
									</span>
								</div>
								<div className="flex justify-between">
									<span>Working Hours:</span>
									<span className="font-medium text-foreground">
										{job.startTime} - {job.endTime}
									</span>
								</div>
								<div className="flex justify-between">
									<span>Applicants:</span>
									<span className="font-medium text-foreground">
										{job._count.applicants}
									</span>
								</div>
							</div>

							<div className="mt-4 text-xs text-right text-primary opacity-0 group-hover:opacity-100 transition-opacity">
								View details →
							</div>
						</div>
					</a>
				))}
			</div>
		</div>
	);
}

export default JobsPage;
