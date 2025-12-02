import {
	ArrowLeft,
	Banknote,
	Briefcase,
	Calendar,
	Clock,
	Edit3,
	MapPin,
	Sparkles,
	TrendingUp,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CloseJobButton } from "@/components/employer/close-job-button";
import { DeleteJobButton } from "@/components/employer/delete-job-button";
import { JobApplicantsTable } from "@/components/employer/job-applicants-table";
import { ReopenJobButton } from "@/components/employer/reopen-job-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { backendApi } from "@/lib/rpc";

const statusConfig = {
	OPEN: {
		label: "Open",
		className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
		dot: "bg-emerald-500",
	},
	FILLED: {
		label: "Filled",
		className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
		dot: "bg-blue-500",
	},
	CLOSED: {
		label: "Closed",
		className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
		dot: "bg-slate-400",
	},
} as const;

const urgencyConfig = {
	LOW: {
		label: "Low Priority",
		className: "bg-slate-100 text-slate-600",
		icon: null,
	},
	MEDIUM: {
		label: "Medium",
		className: "bg-amber-100 text-amber-700",
		icon: null,
	},
	HIGH: {
		label: "High Priority",
		className: "bg-orange-100 text-orange-700",
		icon: TrendingUp,
	},
} as const;

async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const cookie = await headers();
	const res = await backendApi.api.v2.facilities.jobs[":id"].$get(
		{ param: { id } },
		{ headers: { cookie: cookie.get("cookie") || "" } },
	);

	if (!res.ok) {
		if ([401, 403, 404].includes(res.status)) return notFound();
		return (
			<div className="min-h-[50vh] flex items-center justify-center">
				<p className="text-muted-foreground">Something went wrong</p>
			</div>
		);
	}

	const { data: job } = await res.json();
	if (!job) return notFound();

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("en-MY", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});

	const formatTime = (time: string) =>
		new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});

	const status = statusConfig[job.status as keyof typeof statusConfig];
	const urgency = urgencyConfig[job.urgency as keyof typeof urgencyConfig];

	return (
		<div className="min-h-screen bg-linear-to-b from-slate-50/50 to-white">
			{/* Hero Header */}
			<div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl">
				<div className="mx-auto px-4 py-8 ">
					{/* Back Button */}
					<Link
						href="/employer/dashboard/jobs"
						className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
					>
						<ArrowLeft className="size-4" />
						Back to Jobs
					</Link>

					{/* Title Section */}
					<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
						<div className="space-y-4">
							<div className="flex items-center gap-3 flex-wrap">
								<Badge
									variant="outline"
									className={`${status.className} border px-3 py-1`}
								>
									<span
										className={`size-2 rounded-full ${status.dot} mr-2 animate-pulse`}
									/>
									{status.label}
								</Badge>
								{urgency && (
									<Badge className={`${urgency.className} border-0`}>
										{urgency.icon && <urgency.icon className="size-3 mr-1" />}
										{urgency.label}
									</Badge>
								)}
							</div>

							<h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
								{job.title || "Untitled Position"}
							</h1>

							<div className="flex items-center gap-4 text-slate-300 flex-wrap">
								<span className="flex items-center gap-2">
									<MapPin className="size-4" />
									{job.location || "Location not specified"}
								</span>
								<span className="flex items-center gap-2">
									<Briefcase className="size-4" />
									{job.jobType.charAt(0) +
										job.jobType.slice(1).toLowerCase().replace("_", " ")}
								</span>
							</div>
						</div>

						{/* Pay Rate Highlight */}
						<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
							<p className="text-slate-400 text-sm mb-1">Compensation</p>
							<p className="text-4xl font-bold text-white">
								RM{job.payRate}
								<span className="text-lg font-normal text-slate-400">
									/{job.payBasis.toLowerCase()}
								</span>
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="mx-auto py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column */}
					<div className="lg:col-span-2 space-y-6">
						{/* Quick Stats */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<Card className="bg-linear-to-br from-blue-50 to-white border-blue-100">
								<CardContent className="p-4">
									<Calendar className="size-5 text-blue-600 mb-2" />
									<p className="text-xs text-muted-foreground">Start Date</p>
									<p className="font-semibold text-sm">
										{formatDate(job.startDate)}
									</p>
								</CardContent>
							</Card>
							<Card className="bg-linear-to-br from-purple-50 to-white border-purple-100">
								<CardContent className="p-4">
									<Calendar className="size-5 text-purple-600 mb-2" />
									<p className="text-xs text-muted-foreground">End Date</p>
									<p className="font-semibold text-sm">
										{formatDate(job.endDate)}
									</p>
								</CardContent>
							</Card>
							<Card className="bg-linear-to-br from-amber-50 to-white border-amber-100">
								<CardContent className="p-4">
									<Clock className="size-5 text-amber-600 mb-2" />
									<p className="text-xs text-muted-foreground">Shift Start</p>
									<p className="font-semibold text-sm">
										{formatTime(job.startTime)}
									</p>
								</CardContent>
							</Card>
							<Card className="bg-linear-to-br from-emerald-50 to-white border-emerald-100">
								<CardContent className="p-4">
									<Clock className="size-5 text-emerald-600 mb-2" />
									<p className="text-xs text-muted-foreground">Shift End</p>
									<p className="font-semibold text-sm">
										{formatTime(job.endTime)}
									</p>
								</CardContent>
							</Card>
						</div>

						{/* Description */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Sparkles className="size-5 text-primary" />
									Job Description
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
									{job.description || "No description provided."}
								</p>
							</CardContent>
						</Card>

						{/* Applicants Section */}
						<JobApplicantsTable jobId={job.id} />
					</div>

					{/* Right Column - Sticky Sidebar */}
					<div className="lg:col-span-1">
						<div className="sticky top-6 space-y-6">
							{/* Actions Card */}
							<Card className="overflow-hidden">
								<CardHeader className="bg-linear-to-r from-primary/5 to-transparent">
									<CardTitle className="text-lg">Quick Actions</CardTitle>
								</CardHeader>
								<CardContent className="p-4 space-y-3">
									<Button asChild className="w-full" size="lg">
										<Link href={`/employer/dashboard/jobs/${job.id}/edit`}>
											<Edit3 className="size-4 mr-2" />
											Edit Job
										</Link>
									</Button>

									{job.status === "OPEN" && (
										<CloseJobButton
											jobId={job.id}
											jobTitle={job.title || "Untitled Position"}
										/>
									)}

									{(job.status === "CLOSED" || job.status === "FILLED") && (
										<ReopenJobButton
											jobId={job.id}
											jobTitle={job.title || "Untitled Position"}
										/>
									)}

									<Separator className="my-4" />

									<DeleteJobButton
										jobId={job.id}
										jobTitle={job.title || "Untitled Position"}
									/>
								</CardContent>
							</Card>

							{/* Job Details Card */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Job Details</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground text-sm flex items-center gap-2">
											<Banknote className="size-4" />
											Pay Rate
										</span>
										<span className="font-semibold">
											RM{job.payRate}/{job.payBasis.toLowerCase()}
										</span>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground text-sm flex items-center gap-2">
											<Briefcase className="size-4" />
											Job Type
										</span>
										<span className="font-medium capitalize">
											{job.jobType.toLowerCase().replace("_", " ")}
										</span>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground text-sm flex items-center gap-2">
											<MapPin className="size-4" />
											Location
										</span>
										<span className="font-medium text-right text-sm max-w-[150px] truncate">
											{job.location || "Not specified"}
										</span>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground text-sm flex items-center gap-2">
											<MapPin className="size-4" />
											Specialists
										</span>
										<span className="font-medium text-right text-sm max-w-[150px] truncate">
											{job.requiredSpecialists.map((specialist) => (
												<Badge
													key={specialist}
													variant="secondary"
													className="bg-primary/5 text-primary border border-primary/10 px-3 py-1.5"
												>
													{specialist}
												</Badge>
											))}
										</span>
									</div>
									<Separator />
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground text-sm">
											Posted
										</span>
										<span className="font-medium text-sm">
											{formatDate(job.createdAt)}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground text-sm">
											Updated
										</span>
										<span className="font-medium text-sm">
											{formatDate(job.updatedAt)}
										</span>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default JobDetailPage;
