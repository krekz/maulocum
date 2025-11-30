"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Columns3,
	Search,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function ApplicantsDataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = React.useState("");

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			globalFilter,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	return (
		<div className="flex flex-col gap-4">
			{/* Toolbar */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search applicants..."
						value={globalFilter ?? ""}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="pl-9"
					/>
				</div>
				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<Columns3 className="mr-2 size-4" />
								Columns
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							{table
								.getAllColumns()
								.filter(
									(column) =>
										typeof column.accessorFn !== "undefined" &&
										column.getCanHide(),
								)
								.map((column) => (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.id.replace(/([A-Z])/g, " $1").trim()}
									</DropdownMenuCheckboxItem>
								))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Table */}
			<div className="rounded-lg border bg-card">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id} colSpan={header.colSpan}>
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
									className="h-32 text-center"
								>
									<div className="flex flex-col items-center gap-2">
										<p className="text-muted-foreground">No applicants found</p>
										<p className="text-sm text-muted-foreground">
											Applications will appear here when doctors apply to your
											jobs.
										</p>
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="text-sm text-muted-foreground">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
					<div className="flex items-center gap-2">
						<Label
							htmlFor="rows-per-page"
							className="text-sm whitespace-nowrap"
						>
							Rows per page
						</Label>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}
						>
							<SelectTrigger size="sm" className="w-20" id="rows-per-page">
								<SelectValue
									placeholder={table.getState().pagination.pageSize}
								/>
							</SelectTrigger>
							<SelectContent side="top">
								{[10, 20, 30, 40, 50].map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-sm whitespace-nowrap">
							Page {table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount()}
						</span>
						<div className="flex items-center gap-1">
							<Button
								variant="outline"
								size="icon"
								className="size-8"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to first page</span>
								<ChevronsLeft className="size-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="size-8"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to previous page</span>
								<ChevronLeft className="size-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="size-8"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to next page</span>
								<ChevronRight className="size-4" />
							</Button>
							<Button
								variant="outline"
								size="icon"
								className="size-8"
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to last page</span>
								<ChevronsRight className="size-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
