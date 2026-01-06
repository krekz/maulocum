"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobActionsDropdown } from "./job-actions-dropdown";

export interface JobColumn {
	id: string;
	title: string | null;
	status: "OPEN" | "FILLED" | "CLOSED";
	urgency: "LOW" | "MEDIUM" | "HIGH";
	startDate: string;
	endDate: string;
	startTime: string;
	endTime: string;
	payRate: string;
	payBasis: string;
	requiredSpecialists: string[];
	createdAt: string;
	facility: {
		name: string;
	};
	_count: {
		applicants: number;
	};
}

const statusVariants: Record<JobColumn["status"], string> = {
	OPEN: "text-emerald-700",
	FILLED: "text-blue-700",
	CLOSED: "text-red-700",
};

const urgencyVariants: Record<JobColumn["urgency"], string> = {
	LOW: "text-slate-700",
	MEDIUM: "text-amber-700",
	HIGH: "text-red-700",
};

export const columns: ColumnDef<JobColumn>[] = [
	{
		accessorKey: "title",
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				className="-ml-3 h-8 data-[state=open]:bg-accent"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Job Title
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const title = row.getValue("title") as string | null;
			const facilityName = row.original.facility.name;
			return <div className="font-medium">{title || facilityName}</div>;
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as JobColumn["status"];
			return (
				<Badge variant="secondary" className={statusVariants[status]}>
					{status}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		accessorKey: "urgency",
		header: "Urgency",
		cell: ({ row }) => {
			const urgency = row.getValue("urgency") as JobColumn["urgency"];
			return (
				<Badge variant="secondary" className={urgencyVariants[urgency]}>
					{urgency}
				</Badge>
			);
		},
	},
	{
		accessorKey: "startDate",
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				className="-ml-3 h-8"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Start Date
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const date = row.getValue("startDate") as string;
			return <span>{format(new Date(date), "dd MMM yyyy")}</span>;
		},
	},
	{
		accessorKey: "payRate",
		header: "Pay Rate",
		cell: ({ row }) => {
			const rate = row.getValue("payRate") as string;
			const basis = row.original.payBasis.toLowerCase();
			return (
				<span className="font-medium">
					RM{rate}/{basis}
				</span>
			);
		},
	},
	{
		accessorKey: "requiredSpecialists",
		header: "Specialization",
		cell: ({ row }) => {
			const specialists = row.getValue("requiredSpecialists") as string[];
			const display = specialists.slice(0, 2).join(", ");
			const remaining = specialists.length - 2;
			return (
				<div className="max-w-[150px] truncate">
					{display}
					{remaining > 0 && (
						<span className="text-muted-foreground"> +{remaining}</span>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "_count.applicants",
		header: "Applicants",
		cell: ({ row }) => {
			const count = row.original._count.applicants;
			return (
				<div className="flex items-center gap-1.5">
					<Users className="h-3.5 w-3.5 text-muted-foreground" />
					<span className="font-medium">{count}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				className="-ml-3 h-8"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Posted
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as string;
			return (
				<span className="text-muted-foreground">
					{format(new Date(date), "MMM d, yyyy")}
				</span>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const job = row.original;
			return <JobActionsDropdown job={job} />;
		},
	},
];
