"use client";

import { Mail, MapPin, Phone, User, Users } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useJobApplicants } from "@/lib/hooks/useJobApplicants";
import type { $Enums } from "../../../prisma/generated/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface JobApplicantsTableProps {
	jobId: string;
}

export function JobApplicantsTable({ jobId }: JobApplicantsTableProps) {
	const { data: applicants, isLoading, error } = useJobApplicants(jobId);

	if (isLoading) {
		return (
			<div className="bg-white rounded-lg border border-gray-200 p-8">
				<div className="flex items-center justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
					<span className="ml-3 text-gray-600">Loading applicants...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white rounded-lg border border-red-200 p-6">
				<p className="text-red-600">Failed to load applicants</p>
			</div>
		);
	}

	if (!applicants || applicants.length === 0) {
		return (
			<div className="bg-white rounded-lg border border-gray-200 p-8">
				<div className="text-center">
					<User className="mx-auto h-12 w-12 text-gray-400" />
					<h3 className="mt-2 text-sm font-semibold text-gray-900">
						No applicants yet
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						Applications will appear here when doctors apply to this job.
					</p>
				</div>
			</div>
		);
	}

	const getJobApplicationStatus = (status: $Enums.JobApplicationStatus) => {
		const variants: Record<
			$Enums.JobApplicationStatus,
			{ title: string; className: string }
		> = {
			PENDING: {
				title: "Pending",
				className: "bg-yellow-100 text-yellow-800 border-yellow-200",
			},
			ACCEPTED: {
				title: "Accepted",
				className: "bg-green-100 text-green-800 border-green-200",
			},
			REJECTED: {
				title: "Rejected",
				className: "bg-red-100 text-red-800 border-red-200",
			},
			CANCELLED: {
				title: "Cancelled",
				className: "bg-blue-100 text-blue-800 border-blue-200",
			},
			COMPLETED: {
				title: "Completed",
				className: "bg-blue-100 text-blue-800 border-blue-200",
			},
			DOCTOR_CONFIRMED: {
				title: "Doctor Confirmed",
				className: "bg-blue-100 text-blue-800 border-blue-200",
			},
			EMPLOYER_APPROVED: {
				title: "Employer Approved",
				className: "bg-blue-100 text-blue-800 border-blue-200",
			},
		};
		return variants[status] || variants.PENDING;
	};

	const getDoctorVerificationStatus = (status: $Enums.VerificationStatus) => {
		const variants: Record<
			$Enums.VerificationStatus,
			{ title: string; className: string }
		> = {
			APPROVED: {
				title: "Verified",
				className: "bg-green-100 text-green-800",
			},
			PENDING: {
				title: "Pending",
				className: "bg-yellow-100 text-yellow-800",
			},
			REJECTED: {
				title: "Rejected",
				className: "bg-red-100 text-red-800",
			},
		};
		return variants[status] || variants.PENDING;
	};

	return (
		<div className="bg-white rounded-lg border border-gray-200">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Users className="size-5 text-primary" />
						Applicants ({applicants.length})
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Doctor</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Specialty</TableHead>
									<TableHead>Experience</TableHead>
									<TableHead>Verification</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Applied</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{applicants.map((application) => {
									if (
										!application.DoctorProfile?.doctorVerification ||
										!application.status
									) {
										return null;
									}
									const doctorVerification = getDoctorVerificationStatus(
										application.DoctorProfile?.doctorVerification
											?.verificationStatus,
									);
									const jobApplicationStatus = getJobApplicationStatus(
										application.status,
									);
									return (
										<TableRow key={application.id}>
											<TableCell>
												<div className="flex items-center gap-3">
													{application.DoctorProfile?.user?.image ? (
														<Image
															src={application.DoctorProfile.user.image}
															width={40}
															height={40}
															alt={
																application.DoctorProfile.doctorVerification
																	?.fullName ?? "Doctor"
															}
															className="h-10 w-10 rounded-full object-cover"
														/>
													) : (
														<div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
															<User className="h-5 w-5 text-blue-600" />
														</div>
													)}
													<div>
														<p className="font-medium text-gray-900">
															{application.DoctorProfile?.doctorVerification
																?.fullName ?? "Unknown"}
														</p>
														<p className="text-sm text-gray-500">
															{application.DoctorProfile?.doctorVerification
																?.yearsOfExperience ?? 0}{" "}
															years exp.
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="flex items-center gap-2 text-sm text-gray-600">
														<Mail className="h-4 w-4" />
														<span className="truncate max-w-[200px]">
															{application.DoctorProfile?.user?.email || "N/A"}
														</span>
													</div>
													<div className="flex items-center gap-2 text-sm text-gray-600">
														<Phone className="h-4 w-4" />
														<span>
															{application.DoctorProfile?.doctorVerification
																?.phoneNumber ?? "N/A"}
														</span>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2 text-sm text-gray-600">
													<MapPin className="h-4 w-4" />
													<span>
														{application.DoctorProfile?.doctorVerification
															?.location ?? "N/A"}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<span className="text-sm text-gray-900">
													{application.DoctorProfile?.doctorVerification
														?.specialty ?? "General"}
												</span>
											</TableCell>
											<TableCell>
												<span className="text-sm text-gray-900">
													{application.DoctorProfile?.doctorVerification
														?.yearsOfExperience ?? 0}{" "}
													years
												</span>
											</TableCell>
											<TableCell>
												<Badge className={doctorVerification.className}>
													{doctorVerification.title}
												</Badge>
											</TableCell>
											<TableCell>
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${jobApplicationStatus.className}`}
												>
													{jobApplicationStatus.title}
												</span>
											</TableCell>
											<TableCell>
												<span className="text-sm text-gray-600">
													{new Date(application.appliedAt).toLocaleDateString(
														"en-US",
														{
															month: "short",
															day: "numeric",
															year: "numeric",
														},
													)}
												</span>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-2">
													<button
														type="button"
														className="text-sm text-blue-600 hover:text-blue-800 font-medium"
													>
														View
													</button>
													{application.status === "PENDING" && (
														<>
															<button
																type="button"
																className="text-sm text-green-600 hover:text-green-800 font-medium"
															>
																Accept
															</button>
															<button
																type="button"
																className="text-sm text-red-600 hover:text-red-800 font-medium"
															>
																Reject
															</button>
														</>
													)}
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
