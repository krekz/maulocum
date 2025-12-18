"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type DoctorVerification = {
	id: string;
	fullName: string;
	apcNumber: string;
	specialty: string | null;
	yearsOfExperience: number;
	location: string;
	reviewedBy: string | null;
	verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
	doctorProfile: {
		user: {
			email: string;
		};
	};
};

const columns: ColumnDef<DoctorVerification>[] = [
	{
		accessorKey: "fullName",
		header: "Name",
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("fullName")}</div>
		),
	},
	{
		accessorKey: "doctorProfile.user.email",
		header: "Email",
		cell: ({ row }) => (
			<div className="text-sm text-muted-foreground">
				{row.original.doctorProfile.user.email}
			</div>
		),
	},
	{
		accessorKey: "apcNumber",
		header: "APC Number",
		cell: ({ row }) => (
			<div className="font-mono text-sm">{row.getValue("apcNumber")}</div>
		),
	},
	{
		accessorKey: "specialty",
		header: "Specialty",
		cell: ({ row }) => (
			<div>{row.getValue("specialty") || "Not specified"}</div>
		),
	},
	{
		accessorKey: "yearsOfExperience",
		header: "Experience",
		cell: ({ row }) => <div>{row.getValue("yearsOfExperience")} years</div>,
	},
	{
		accessorKey: "location",
		header: "Location",
	},
	{
		accessorKey: "verificationStatus",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("verificationStatus") as string;
			return (
				<Badge
					variant={
						status === "APPROVED"
							? "default"
							: status === "PENDING"
								? "secondary"
								: "destructive"
					}
				>
					{status}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id));
		},
	},
	{
		id: "reviewedBy",
		header: "Reviewed By",
		cell: ({ row }) => (
			<div className="text-center">{row.getValue("reviewedBy") || "None"}</div>
		),
	},
	{
		id: "actions",
		cell: () => (
			<div className="text-right">
				<Button variant="ghost" size="sm">
					View Details
				</Button>
			</div>
		),
	},
];

export function DoctorsTable({ data }: { data: DoctorVerification[] }) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const table = useReactTable({
		data,
		columns,
		state: {
			columnFilters,
		},
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	const statusColumn = table.getColumn("verificationStatus");

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Select
					value={
						(statusColumn?.getFilterValue() as string[])?.join(",") || "all"
					}
					onValueChange={(value) => {
						if (value === "all") {
							statusColumn?.setFilterValue(undefined);
						} else {
							statusColumn?.setFilterValue([value]);
						}
					}}
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="PENDING">Pending</SelectItem>
						<SelectItem value="APPROVED">Approved</SelectItem>
						<SelectItem value="REJECTED">Rejected</SelectItem>
					</SelectContent>
				</Select>
				<div className="text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} of{" "}
					{table.getCoreRowModel().rows.length} row(s)
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
