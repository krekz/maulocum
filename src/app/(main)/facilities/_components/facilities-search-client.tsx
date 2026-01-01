"use client";

import { Search } from "lucide-react";
import { debounce, parseAsString, useQueryStates } from "nuqs";
import { FilterCombobox } from "@/components/filter-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATE_OPTIONS } from "@/lib/constant";

export function FacilitiesSearchClient() {
	const [filters, setFilters] = useQueryStates(
		{
			search: parseAsString.withDefault(""),
			location: parseAsString.withDefault("all"),
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
			location: "all",
		});
	};

	const hasActiveFilters = filters.search || filters.location !== "all";

	return (
		<div className="bg-accent py-10">
			<form onSubmit={handleSubmit} className="px-3 lg:container space-y-4">
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<div className="relative flex-1 sm:max-w-md">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search facilities..."
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
						value={filters.location}
						onValueChange={(value) => setFilters({ location: value })}
						triggerClassName="w-full sm:w-[200px]"
						contentClassName="w-full p-0 sm:w-[200px]"
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
