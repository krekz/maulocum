"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, Mail, Phone, User } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TSingleJobApplicant } from "@/lib/rpc";
import type { $Enums } from "../../../../../../../../prisma/generated/prisma/client";
import { ApplicationActions } from "./application-actions";

const statusConfig = {
	PENDING: {
		label: "Pending",
		variant: "outline" as const,
		className: "border-yellow-500 text-yellow-600 bg-yellow-50",
	},
	EMPLOYER_APPROVED: {
		label: "Awaiting Confirmation",
		variant: "outline" as const,
		className: "border-orange-500 text-orange-600 bg-orange-50",
	},
	DOCTOR_CONFIRMED: {
		label: "Confirmed",
		variant: "default" as const,
		className: "bg-emerald-500 text-white",
	},
	DOCTOR_REJECTED: {
		label: "Doctor Rejected",
		variant: "default" as const,
		className: "bg-red-500 text-white",
	},
	EMPLOYER_REJECTED: {
		label: "Employer Rejected",
		variant: "destructive" as const,
		className: "bg-red-500 text-white",
	},
	CANCELLED: {
		label: "Cancelled",
		variant: "secondary" as const,
		className: "bg-gray-200 text-gray-600",
	},
	COMPLETED: {
		label: "Completed",
		variant: "default" as const,
		className: "bg-blue-500 text-white",
	},
} satisfies Record<
	$Enums.JobApplicationStatus,
	{
		label: string;
		variant: "outline" | "default" | "destructive" | "secondary";
		className: string;
	}
>;

const verificationStatusConfig = {
	APPROVED: {
		label: "Verified",
		className: "bg-green-100 text-green-700 border-green-200",
	},
	PENDING: {
		label: "Pending",
		className: "bg-yellow-100 text-yellow-700 border-yellow-200",
	},
	REJECTED: {
		label: "Rejected",
		className: "bg-red-100 text-red-700 border-red-200",
	},
};

export const singleJobColumns: ColumnDef<TSingleJobApplicant>[] = [
	{
		accessorKey: "DoctorProfile",
		header: "Applicant",
		cell: ({ row }) => {
			const doctor = row.original.DoctorProfile;
			const verification = doctor?.doctorVerification;
			const user = doctor?.user;

			return (
				<div className="flex items-center gap-3 min-w-[200px]">
					{user?.image ? (
						<Image
							src={user.image}
							width={40}
							height={40}
							alt={verification?.fullName ?? "Doctor"}
							className="size-10 rounded-full object-cover ring-2 ring-muted"
						/>
					) : (
						<div className="size-10 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-muted">
							<User className="size-5 text-primary" />
						</div>
					)}
					<div className="flex flex-col">
						<span className="font-medium text-foreground">
							{verification?.fullName ?? "Unknown"}
						</span>
						<span className="text-xs text-muted-foreground">
							{verification?.specialty ?? "General Practitioner"}
						</span>
					</div>
				</div>
			);
		},
	},
	{
		id: "experience",
		header: "Experience",
		cell: ({ row }) => {
			const verification = row.original.DoctorProfile?.doctorVerification;
			return (
				<span className="text-sm">
					{verification?.yearsOfExperience ?? 0} years
				</span>
			);
		},
	},
	{
		id: "contact",
		header: "Contact",
		cell: ({ row }) => {
			const doctor = row.original.DoctorProfile;
			const verification = doctor?.doctorVerification;
			const user = doctor?.user;

			return (
				<TooltipProvider>
					<div className="flex items-center gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" className="size-8">
									<Mail className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{user?.email ?? "No email"}</p>
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" className="size-8">
									<Phone className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{verification?.phoneNumber ?? "No phone"}</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</TooltipProvider>
			);
		},
	},
	{
		id: "verification",
		header: "Verification",
		cell: ({ row }) => {
			const status =
				row.original.DoctorProfile?.doctorVerification?.verificationStatus ??
				"PENDING";
			const config =
				verificationStatusConfig[
					status as keyof typeof verificationStatusConfig
				];
			return (
				<Badge variant="outline" className={config?.className}>
					{config?.label ?? status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="-ml-4"
			>
				Status
				<ArrowUpDown className="ml-2 size-4" />
			</Button>
		),
		cell: ({ row }) => {
			const status = row.original.status;
			const config = statusConfig[status as keyof typeof statusConfig];
			return (
				<Badge variant={config?.variant} className={config?.className}>
					{config?.label ?? status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "appliedAt",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="-ml-4"
			>
				Applied
				<ArrowUpDown className="ml-2 size-4" />
			</Button>
		),
		cell: ({ row }) => {
			const date = new Date(row.original.appliedAt);
			return (
				<div className="flex flex-col">
					<span className="text-sm">{format(date, "MMM d, yyyy")}</span>
					<span className="text-xs text-muted-foreground">
						{format(date, "h:mm a")}
					</span>
				</div>
			);
		},
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => {
			const application = row.original;
			return <ApplicationActions application={application as any} />;
		},
	},
];
