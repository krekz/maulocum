"use client";

import { Filter, Search } from "lucide-react";
import { debounce, parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { FilterCombobox } from "@/components/filter-combobox";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SPECIALIST_OPTIONS, STATE_OPTIONS } from "@/lib/constant";
import { useIsMobile } from "@/lib/hooks/use-mobile";

const JOB_TYPE_OPTIONS = [
	{ value: "all", label: "All Types" },
	{ value: "FULL_TIME", label: "Full Time" },
	{ value: "PART_TIME", label: "Part Time" },
	{ value: "LOCUM", label: "Locum" },
	{ value: "CONTRACT", label: "Contract" },
];

const PAY_BASIS_OPTIONS = [
	{ value: "all", label: "All Basis" },
	{ value: "HOURLY", label: "Hourly" },
	{ value: "DAILY", label: "Daily" },
	{ value: "WEEKLY", label: "Weekly" },
	{ value: "MONTHLY", label: "Monthly" },
];

function JobFilter() {
	const isMobile = useIsMobile();

	const [filters, setFilters] = useQueryStates(
		{
			search: parseAsString.withDefault(""),
			state: parseAsString.withDefault("all"),
			specialist: parseAsString.withDefault("all"),
			jobType: parseAsString.withDefault("all"),
			payBasis: parseAsString.withDefault("all"),
			minPayRate: parseAsInteger,
			maxPayRate: parseAsInteger,
		},
		{
			shallow: false, // Trigger server-side re-render
		},
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
	};

	const handleReset = () => {
		setFilters({
			search: "",
			state: "all",
			specialist: "all",
			jobType: "all",
			payBasis: "all",
			minPayRate: null,
			maxPayRate: null,
		});
	};

	const hasActiveFilters =
		filters.search ||
		filters.state !== "all" ||
		filters.specialist !== "all" ||
		filters.jobType !== "all" ||
		filters.payBasis !== "all" ||
		filters.minPayRate !== null ||
		filters.maxPayRate !== null;

	if (isMobile) {
		return (
			<div className="bg-accent py-6">
				<form onSubmit={handleSubmit} className="px-3 space-y-3">
					{/* Mobile Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search jobs..."
							value={filters.search}
							onChange={(e) =>
								setFilters(
									{ search: e.target.value },
									{
										limitUrlUpdates:
											e.target.value === "" ? undefined : debounce(500),
									},
								)
							}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									setFilters({ search: e.currentTarget.value });
								}
							}}
							className="pl-9"
						/>
					</div>

					{/* Mobile Filters Accordion */}
					<Accordion type="single" collapsible className="w-full">
						<AccordionItem value="filters" className="border-none">
							<AccordionTrigger className="bg-white rounded-lg px-4 py-2 hover:no-underline">
								<div className="flex items-center gap-2">
									<Filter className="h-4 w-4" />
									<span className="text-sm font-medium">Filters</span>
									{hasActiveFilters && (
										<span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
											Active
										</span>
									)}
								</div>
							</AccordionTrigger>
							<AccordionContent className="pt-3 space-y-3">
								<FilterCombobox
									options={STATE_OPTIONS}
									placeholder="Select State..."
									value={filters.state}
									onValueChange={(value) => setFilters({ state: value })}
									triggerClassName="w-full"
									contentClassName="w-full p-0"
								/>
								<FilterCombobox
									options={SPECIALIST_OPTIONS}
									placeholder="Select Specialist..."
									value={filters.specialist}
									onValueChange={(value) => setFilters({ specialist: value })}
									triggerClassName="w-full"
									contentClassName="w-full p-0"
								/>
								<FilterCombobox
									options={JOB_TYPE_OPTIONS}
									placeholder="Job Type..."
									value={filters.jobType}
									onValueChange={(value) => setFilters({ jobType: value })}
									triggerClassName="w-full"
									contentClassName="w-full p-0"
								/>
								<FilterCombobox
									options={PAY_BASIS_OPTIONS}
									placeholder="Pay Basis..."
									value={filters.payBasis}
									onValueChange={(value) => setFilters({ payBasis: value })}
									triggerClassName="w-full"
									contentClassName="w-full p-0"
								/>
								<div className="grid grid-cols-2 gap-3">
									<Input
										type="number"
										placeholder="Min Pay"
										value={filters.minPayRate ?? ""}
										onChange={(e) =>
											setFilters({
												minPayRate: e.target.value
													? Number(e.target.value)
													: null,
											})
										}
									/>
									<Input
										type="number"
										placeholder="Max Pay"
										value={filters.maxPayRate ?? ""}
										onChange={(e) =>
											setFilters({
												maxPayRate: e.target.value
													? Number(e.target.value)
													: null,
											})
										}
									/>
								</div>
								{hasActiveFilters && (
									<Button
										type="button"
										variant="outline"
										onClick={handleReset}
										className="w-full"
									>
										Clear All
									</Button>
								)}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</form>
			</div>
		);
	}

	// Desktop view
	return (
		<div className="bg-accent py-10">
			<form onSubmit={handleSubmit} className="px-3 lg:container space-y-4">
				{/* Primary Filters Row */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<div className="relative flex-1 sm:max-w-md">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search jobs, facilities, locations..."
							value={filters.search}
							onChange={(e) =>
								setFilters(
									{ search: e.target.value },
									{
										// Debounce search: immediate if clearing, 500ms otherwise
										limitUrlUpdates:
											e.target.value === "" ? undefined : debounce(500),
									},
								)
							}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									// Immediate update on Enter key
									setFilters({ search: e.currentTarget.value });
								}
							}}
							className="pl-9"
						/>
					</div>
					<FilterCombobox
						options={STATE_OPTIONS}
						placeholder="Select State..."
						value={filters.state}
						onValueChange={(value) => setFilters({ state: value })}
						triggerClassName="w-full sm:w-[200px]"
						contentClassName="w-full p-0 sm:w-[200px]"
					/>
					<FilterCombobox
						options={SPECIALIST_OPTIONS}
						placeholder="Select Specialist..."
						value={filters.specialist}
						onValueChange={(value) => setFilters({ specialist: value })}
						triggerClassName="w-full sm:w-[200px]"
						contentClassName="w-full p-0 sm:w-[200px]"
					/>
				</div>

				{/* Secondary Filters Row */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<FilterCombobox
						options={JOB_TYPE_OPTIONS}
						placeholder="Job Type..."
						value={filters.jobType}
						onValueChange={(value) => setFilters({ jobType: value })}
						triggerClassName="w-full sm:w-[180px]"
						contentClassName="w-full p-0 sm:w-[180px]"
					/>
					<FilterCombobox
						options={PAY_BASIS_OPTIONS}
						placeholder="Pay Basis..."
						value={filters.payBasis}
						onValueChange={(value) => setFilters({ payBasis: value })}
						triggerClassName="w-full sm:w-[180px]"
						contentClassName="w-full p-0 sm:w-[180px]"
					/>
					<Input
						type="number"
						placeholder="Min Pay Rate"
						value={filters.minPayRate ?? ""}
						onChange={(e) =>
							setFilters({
								minPayRate: e.target.value ? Number(e.target.value) : null,
							})
						}
						className="w-full sm:w-[150px]"
					/>
					<Input
						type="number"
						placeholder="Max Pay Rate"
						value={filters.maxPayRate ?? ""}
						onChange={(e) =>
							setFilters({
								maxPayRate: e.target.value ? Number(e.target.value) : null,
							})
						}
						className="w-full sm:w-[150px]"
					/>
					{hasActiveFilters && (
						<Button
							type="button"
							variant="outline"
							onClick={handleReset}
							className="w-full sm:w-auto"
						>
							Clear All
						</Button>
					)}
				</div>
			</form>
		</div>
	);
}

export default JobFilter;
