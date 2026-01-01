import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { STATE_OPTIONS } from "@/lib/constant";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

interface SelectStateProps<T extends FieldValues> {
	form: UseFormReturn<T>;
	name?: Path<T>;
}

function SelectState<T extends FieldValues>({
	form,
	name = "location" as Path<T>,
}: SelectStateProps<T>) {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>Location</FormLabel>
					<Select onValueChange={field.onChange} defaultValue={field.value}>
						<FormControl>
							<SelectTrigger className="h-9">
								<SelectValue placeholder="Select state" />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{STATE_OPTIONS.filter((opt) => opt.value !== "all").map(
								(state) => (
									<SelectItem key={state.value} value={state.value}>
										{state.label}
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

export default SelectState;
