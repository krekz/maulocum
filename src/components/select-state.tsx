import { STATE_OPTIONS } from "@/lib/constant";
import { FormControl, FormItem, FormLabel, FormMessage } from "./ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

interface SelectStateProps {
	value?: string;
	onChange: (value: string) => void;
}

function SelectState({ value, onChange }: SelectStateProps) {
	return (
		<FormItem>
			<FormLabel>Location</FormLabel>
			<Select onValueChange={onChange} defaultValue={value}>
				<FormControl>
					<SelectTrigger className="h-9">
						<SelectValue placeholder="Select state" />
					</SelectTrigger>
				</FormControl>
				<SelectContent>
					{STATE_OPTIONS.filter((opt) => opt.value !== "all").map((state) => (
						<SelectItem key={state.value} value={state.value}>
							{state.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<FormMessage />
		</FormItem>
	);
}

export default SelectState;
