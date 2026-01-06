import { formatDistanceToNow } from "date-fns";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SectionCards } from "@/components/section-cards";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { backendApi } from "@/lib/rpc";

interface DashboardStats {
	activeJobs: number;
	totalApplicants: number;
	fillRate: number;
	recentApplicants: {
		id: string;
		status: string;
		appliedAt: string;
		jobTitle: string | null;
		specialty: string;
		doctorName: string;
		doctorImage: string | null;
	}[];
}

const statusStyles: Record<string, string> = {
	PENDING:
		"bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	EMPLOYER_APPROVED:
		"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	DOCTOR_CONFIRMED:
		"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
	EMPLOYER_REJECTED:
		"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	DOCTOR_REJECTED:
		"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	CANCELLED:
		"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
	COMPLETED:
		"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const statusLabels: Record<string, string> = {
	PENDING: "Pending",
	EMPLOYER_APPROVED: "Approved",
	DOCTOR_CONFIRMED: "Confirmed",
	EMPLOYER_REJECTED: "Rejected",
	DOCTOR_REJECTED: "Declined",
	CANCELLED: "Cancelled",
	COMPLETED: "Completed",
};

async function DashboardHome() {
	const headersList = await headers();
	const session = await auth.api.getSession({
		headers: headersList,
	});

	if (!session) notFound();
	if (!session.user.isEmployer) notFound();

	// Fetch dashboard stats
	const cookie = headersList.get("cookie");
	const response = await backendApi.api.v2.facilities["dashboard-stats"].$get(
		undefined,
		{
			headers: {
				cookie: cookie || "",
			},
		},
	);

	const result = await response.json();
	const stats = (result.data as DashboardStats) || {
		activeJobs: 0,
		totalApplicants: 0,
		fillRate: 0,
		recentApplicants: [],
	};

	return (
		<>
			<SectionCards
				activeJobs={stats.activeJobs}
				totalApplicants={stats.totalApplicants}
				fillRate={stats.fillRate}
			/>
			<div className="mt-8 lg:px-6">
				<h2 className="text-2xl font-bold mb-4 pl-4 sm:pl-0">
					Recent Applicants
				</h2>
				<div className="grid gap-2 m-4 sm:mx-0">
					{stats.recentApplicants.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-lg">
							No applicants yet. Post a job to start receiving applications!
						</div>
					) : (
						stats.recentApplicants.map((applicant) => (
							<div
								key={applicant.id}
								className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm hover:bg-muted/50 transition-colors"
							>
								<div className="flex items-center space-x-4">
									<Avatar className="h-10 w-10">
										<AvatarImage src={applicant.doctorImage || undefined} />
										<AvatarFallback className="bg-primary/10 text-primary font-semibold">
											{applicant.doctorName
												.split(" ")
												.map((n) => n[0])
												.join("")
												.slice(0, 2)
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div>
										<h3 className="font-medium">{applicant.doctorName}</h3>
										<p className="text-sm text-muted-foreground">
											{applicant.specialty}
											{applicant.jobTitle && (
												<span className="text-xs"> • {applicant.jobTitle}</span>
											)}
										</p>
									</div>
								</div>
								<div className="text-right flex flex-col items-end gap-1">
									<span className="text-xs text-muted-foreground">
										{formatDistanceToNow(new Date(applicant.appliedAt), {
											addSuffix: true,
										})}
									</span>
									<Badge
										variant="secondary"
										className={statusStyles[applicant.status] || ""}
									>
										{statusLabels[applicant.status] || applicant.status}
									</Badge>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</>
	);
}

export default DashboardHome;
