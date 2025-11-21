"use client";

import { Mail, MapPin, Phone, User } from "lucide-react";
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

	const getStatusBadge = (status: string) => {
		const variants = {
			pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
			accepted: "bg-green-100 text-green-800 border-green-200",
			rejected: "bg-red-100 text-red-800 border-red-200",
			reviewing: "bg-blue-100 text-blue-800 border-blue-200",
		};
		return (
			variants[status.toLowerCase() as keyof typeof variants] ||
			variants.pending
		);
	};

	const getVerificationBadge = (status: string) => {
		const variants = {
			APPROVED: "bg-green-100 text-green-800",
			PENDING: "bg-yellow-100 text-yellow-800",
			REJECTED: "bg-red-100 text-red-800",
		};
		return variants[status as keyof typeof variants] || variants.PENDING;
	};

	return (
		<div className="bg-white rounded-lg border border-gray-200">
			<div className="p-6 border-b border-gray-200">
				<h2 className="text-xl font-semibold text-gray-900">
					Applicants ({applicants.length})
				</h2>
				<p className="text-sm text-gray-500 mt-1">
					Review and manage job applications
				</p>
			</div>

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
						{applicants.map((application) => (
							<TableRow key={application.id}>
								<TableCell>
									<div className="flex items-center gap-3">
										{application.DoctorProfile?.user?.image ? (
											<Image
												src={application.DoctorProfile.user.image}
												width={40}
												height={40}
												alt={application.DoctorProfile.fullName}
												className="h-10 w-10 rounded-full object-cover"
											/>
										) : (
											<div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
												<User className="h-5 w-5 text-blue-600" />
											</div>
										)}
										<div>
											<p className="font-medium text-gray-900">
												{application.DoctorProfile?.fullName || "Unknown"}
											</p>
											<p className="text-sm text-gray-500">
												{application.DoctorProfile?.yearsOfExperience || 0}{" "}
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
												{application.DoctorProfile?.phoneNumber || "N/A"}
											</span>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<MapPin className="h-4 w-4" />
										<span>{application.DoctorProfile?.location || "N/A"}</span>
									</div>
								</TableCell>
								<TableCell>
									<span className="text-sm text-gray-900">
										{application.DoctorProfile?.specialty || "General"}
									</span>
								</TableCell>
								<TableCell>
									<span className="text-sm text-gray-900">
										{application.DoctorProfile?.yearsOfExperience || 0} years
									</span>
								</TableCell>
								<TableCell>
									<Badge
										className={getVerificationBadge(
											application.DoctorProfile?.verificationStatus ||
												"PENDING",
										)}
									>
										{application.DoctorProfile?.verificationStatus || "PENDING"}
									</Badge>
								</TableCell>
								<TableCell>
									<span
										className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(application.status)}`}
									>
										{application.status}
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
										{application.status === "pending" && (
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
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
