import { Calendar, MapPin } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { backendApi } from "@/lib/rpc";
import type { $Enums } from "../../../../../prisma/generated/prisma/client";
import { CancelApplicationDialog } from "./cancel-application-dialog";
import ReviewsDialog from "./reviews-dialog";

async function HistoryPage() {
	const cookie = await cookies();
	const response = await backendApi.api.v2.doctors.applications.$get(
		undefined,
		{
			headers: {
				cookie: cookie.toString(),
			},
		},
	);

	if (!response.ok) {
		switch (response.status) {
			case 400:
			case 401:
			case 403:
				return (
					<div className="min-h-[50vh] flex flex-col items-center justify-center rounded-xl px-6 py-10 text-center shadow-sm">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
							<span className="text-2xl">⚕️</span>
						</div>
						<h2 className="text-xl font-semibold tracking-tight text-red-900">
							Doctor Registration Required
						</h2>
						<p className="mt-2 max-w-md text-sm text-red-800/80">
							You need an approved doctor profile before you can view your
							application history. Complete your registration to continue.
						</p>
						<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
							<Link
								href="/profile"
								className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-red-50 shadow-sm transition-colors hover:bg-red-700"
							>
								Verify as Doctor
							</Link>
						</div>
					</div>
				);
			case 404:
				return (
					<div className="min-h-[50vh] flex flex-col items-center justify-center rounded-xl px-6 py-10 text-center shadow-sm">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<span className="text-2xl">🩺</span>
						</div>
						<h2 className="text-xl font-semibold tracking-tight">
							No Applications Found
						</h2>
						<p className="mt-2 max-w-md text-sm text-muted-foreground">
							We couldn&apos;t find any locum applications associated with your
							account. Once you start applying for locum jobs, your history will
							appear here.
						</p>
						<div className="mt-6">
							<Link
								href="/jobs"
								className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
							>
								Browse Locum Jobs
							</Link>
						</div>
					</div>
				);
			default:
				return <div>Something went wrong</div>;
		}
	}

	const applications = await response.json();
	if (!applications.data || applications.data.length === 0) {
		return (
			<div className="min-h-[50vh] flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 px-6 py-10 text-center shadow-sm">
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<span className="text-2xl">📋</span>
				</div>
				<h2 className="text-xl font-semibold tracking-tight">
					No Applications Yet
				</h2>
				<p className="mt-2 max-w-md text-sm text-muted-foreground">
					Start applying to locum jobs to see your application history here.
				</p>
				<div className="mt-6">
					<Link
						href="/jobs"
						className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
					>
						Browse Locum Jobs
					</Link>
				</div>
			</div>
		);
	}

	const getStatusBadge = (status: $Enums.JobApplicationStatus) => {
		switch (status) {
			case "COMPLETED":
				return {
					label: "Completed",
					className: "bg-emerald-50 text-emerald-700",
				};
			case "DOCTOR_REJECTED":
				return {
					label: "Rejected by doctor",
					className: "bg-red-50 text-red-700",
				};
			case "PENDING":
				return {
					label: "Pending",
					className: "bg-amber-50 text-amber-700",
				};
			case "EMPLOYER_REJECTED":
				return {
					label: "Rejected by employer",
					className: "bg-red-50 text-red-700",
				};
			case "CANCELLED":
				return {
					label: "Cancelled",
					className: "bg-slate-100 text-slate-600",
				};
			case "DOCTOR_CONFIRMED":
				return {
					label: "Confirmed",
					className: "bg-emerald-50 text-emerald-700",
					desc: "You confirmed the job application",
				};
			case "EMPLOYER_APPROVED":
				return {
					label: "Waiting for your confirmation",
					className: "bg-blue-50 text-blue-700",
					desc: "Employer approved the job application",
				};
			default:
				return {
					label: status,
					className: "bg-slate-100 text-slate-600",
				};
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-MY", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	const formatPayRate = (payRate: string, payBasis: string) => {
		const basis = payBasis === "HOURLY" ? "/hr" : "/day";
		return `RM ${payRate}${basis}`;
	};

	return (
		<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
			{/* Header */}
			<div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
				<h3 className="font-semibold text-slate-900 text-sm">
					My Applications
				</h3>
				<div className="text-xs text-muted-foreground">
					{applications.data.length} application
					{applications.data.length !== 1 ? "s" : ""}
				</div>
			</div>

			{/* Applications List */}
			<div className="divide-y divide-slate-50">
				{applications.data.map((application) => {
					const isCompleted = application.status.toUpperCase() === "COMPLETED";
					const hasReviewed = isCompleted && application.facilityReview;
					const statusBadge = hasReviewed
						? { label: "Reviewed", className: "bg-purple-50 text-purple-700" }
						: getStatusBadge(application.status);
					const canCancel =
						application.status === "PENDING" ||
						application.status === "DOCTOR_CONFIRMED";

					return (
						<div
							key={application.id}
							className="p-4 hover:bg-slate-50/50 transition-colors"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1 min-w-0">
									{/* Title */}
									<h4 className="font-medium text-slate-900 text-sm truncate">
										{application.job.title || "Untitled Job"}
									</h4>

									{/* Facility Name */}
									<p className="text-xs text-slate-500 mb-2">
										{application.job.facility.name}
									</p>

									{/* Meta Info */}
									<div className="flex items-center gap-3 text-xs text-slate-400">
										<span className="flex items-center gap-1">
											<Calendar className="w-3 h-3" />
											{formatDate(application.job.startDate)}
										</span>
										{application.job.location && (
											<span className="flex items-center gap-1">
												<MapPin className="w-3 h-3" />
												{application.job.location}
											</span>
										)}
										<span className="font-medium text-emerald-600">
											{formatPayRate(
												application.job.payRate,
												application.job.payBasis,
											)}
										</span>
									</div>
								</div>

								{/* Actions */}
								<div className="flex items-center gap-2 shrink-0">
									<span
										className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${statusBadge.className}`}
									>
										{statusBadge.label}
									</span>
									<Link
										href={`/jobs/${application.job.id}`}
										className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
									>
										View Details
									</Link>
									{canCancel && (
										<CancelApplicationDialog
											applicationId={application.id}
											jobTitle={application.job.title || "Untitled Job"}
											status={application.status}
										/>
									)}
									{isCompleted && !application.facilityReview && (
										<ReviewsDialog
											jobId={application.job.id}
											facilityName={application.job.facility.name}
										/>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default HistoryPage;
