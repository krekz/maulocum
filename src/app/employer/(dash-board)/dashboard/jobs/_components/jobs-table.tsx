"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns, type JobColumn } from "./columns";

interface JobsTableProps {
	data: JobColumn[];
}

export function JobsTable({ data }: JobsTableProps) {
	return (
		<DataTable
			columns={columns}
			data={data}
			searchKey="title"
			searchPlaceholder="Search jobs..."
		/>
	);
}
