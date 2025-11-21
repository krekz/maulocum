import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CloseJobButton } from "@/components/employer/close-job-button";
import { DeleteJobButton } from "@/components/employer/delete-job-button";
import { JobApplicantsTable } from "@/components/employer/job-applicants-table";
import { ReopenJobButton } from "@/components/employer/reopen-job-button";
import { backendApi } from "@/lib/rpc";

async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const cookie = await headers();
	const res = await backendApi.api.v2.facilities.jobs[":id"].$get(
		{
			param: {
				id,
			},
		},
		{
			headers: {
				cookie: cookie.get("cookie") || "",
			},
		},
	);

	if (!res.ok) {
		switch (res.status) {
			case 401:
			case 403:
			case 404:
				return notFound();
			default:
				return <div>Something went wrong</div>;
		}
	}

	const { data: job } = await res.json();

	if (!job) {
		return notFound();
	}

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatTime = (time: string) => {
		return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	};

	const getStatusBadge = (status: string) => {
		const styles = {
			OPEN: "bg-green-100 text-green-800 border-green-200",
			FILLED: "bg-blue-100 text-blue-800 border-blue-200",
			CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
			CANCELLED: "bg-red-100 text-red-800 border-red-200",
		};
		return styles[status as keyof typeof styles] || styles.OPEN;
	};

	const getUrgencyBadge = (urgency: string) => {
		const styles = {
			LOW: "bg-gray-100 text-gray-700 border-gray-200",
			MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
			HIGH: "bg-orange-100 text-orange-800 border-orange-200",
			URGENT: "bg-red-100 text-red-800 border-red-200",
		};
		return styles[urgency as keyof typeof styles] || styles.MEDIUM;
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-5xl">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-start justify-between mb-4">
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							{job.title || "Untitled Position"}
						</h1>
						<p className="text-gray-600 flex items-center gap-2">
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
							{job.location || "Location not specified"}
						</p>
					</div>
					<div className="flex gap-2">
						<span
							className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(job.status)}`}
						>
							{job.status}
						</span>
						<span
							className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyBadge(job.urgency)}`}
						>
							{job.urgency}
						</span>
					</div>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Main Details */}
				<div className="lg:col-span-2 space-y-6">
					{/* Description */}
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">
							Job Description
						</h2>
						<p className="text-gray-700 whitespace-pre-wrap">
							{job.description || "No description provided."}
						</p>
					</div>

					{/* Required Specialists */}
					{job.requiredSpecialists && job.requiredSpecialists.length > 0 && (
						<div className="bg-white rounded-lg border border-gray-200 p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Required Specialists
							</h2>
							<div className="flex flex-wrap gap-2">
								{job.requiredSpecialists.map((specialist: string) => (
									<span
										key={specialist}
										className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-200"
									>
										{specialist}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Schedule Details */}
					<div className="bg-white rounded-lg border border-gray-200 p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">
							Schedule
						</h2>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-gray-500 mb-1">Start Date</p>
								<p className="text-gray-900 font-medium">
									{formatDate(job.startDate)}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500 mb-1">End Date</p>
								<p className="text-gray-900 font-medium">
									{formatDate(job.endDate)}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500 mb-1">Start Time</p>
								<p className="text-gray-900 font-medium">
									{formatTime(job.startTime)}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-500 mb-1">End Time</p>
								<p className="text-gray-900 font-medium">
									{formatTime(job.endTime)}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column - Summary Card */}
				<div className="lg:col-span-1">
					<div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-6">
							Job Summary
						</h2>

						<div className="space-y-4">
							{/* Pay Rate */}
							<div className="pb-4 border-b border-gray-200">
								<p className="text-sm text-gray-500 mb-1">Compensation</p>
								<p className="text-2xl font-bold text-gray-900">
									${job.payRate}
									<span className="text-sm font-normal text-gray-600">
										/{job.payBasis.toLowerCase()}
									</span>
								</p>
							</div>

							{/* Job Type */}
							<div className="pb-4 border-b border-gray-200">
								<p className="text-sm text-gray-500 mb-1">Job Type</p>
								<p className="text-gray-900 font-medium capitalize">
									{job.jobType.toLowerCase()}
								</p>
							</div>

							{/* Duration */}
							<div className="pb-4 border-b border-gray-200">
								<p className="text-sm text-gray-500 mb-1">Duration</p>
								<p className="text-gray-900 font-medium">
									{formatDate(job.startDate)} - {formatDate(job.endDate)}
								</p>
							</div>

							{/* Posted Date */}
							<div className="pb-4 border-b border-gray-200">
								<p className="text-sm text-gray-500 mb-1">Posted</p>
								<p className="text-gray-900 font-medium">
									{formatDate(job.createdAt)}
								</p>
							</div>

							{/* Last Updated */}
							<div>
								<p className="text-sm text-gray-500 mb-1">Last Updated</p>
								<p className="text-gray-900 font-medium">
									{formatDate(job.updatedAt)}
								</p>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="mt-6 space-y-3">
							<Link
								href={`/employer/dashboard/jobs/${job.id}/edit`}
								className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-center"
							>
								Edit Job
							</Link>
							<button
								type="button"
								className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg border border-gray-300 transition-colors"
							>
								View Applicants
							</button>
							{job.status === "OPEN" && (
								<CloseJobButton
									jobId={job.id}
									jobTitle={job.title || "Untitled Position"}
								/>
							)}
							{job.status === "CLOSED" && (
								<ReopenJobButton
									jobId={job.id}
									jobTitle={job.title || "Untitled Position"}
								/>
							)}
							<div className="pt-3 border-t border-gray-200">
								<DeleteJobButton
									jobId={job.id}
									jobTitle={job.title || "Untitled Position"}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Applicants Section */}
			<div className="mt-8">
				<JobApplicantsTable jobId={job.id} />
			</div>
		</div>
	);
}

export default JobDetailPage;
