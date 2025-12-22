"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
	Briefcase,
	CalendarIcon,
	Check,
	ChevronsUpDown,
	Clock,
	Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	type JobPostFormValues,
	jobPostSchema,
} from "@/app/api/types/jobs.types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SPECIALIST_OPTIONS } from "@/lib/constant";
import { usePostJob } from "@/lib/hooks/useEmployerJobs";
import type { JobDetailProps } from "@/lib/rpc";
import { cn } from "@/lib/utils";

interface JobPostFormProps {
	mode?: "create" | "edit";
	initialData?: JobDetailProps["data"];
	onSubmitSuccess?: (data: JobPostFormValues) => void;
}

export function JobPostForm({
	mode = "create",
	initialData,
	onSubmitSuccess,
}: JobPostFormProps) {
	const router = useRouter();
	const [isSpecialistsOpen, setIsSpecialistsOpen] = useState(false);
	const postJobMutation = usePostJob();

	const form = useForm<JobPostFormValues>({
		resolver: zodResolver(jobPostSchema),
		defaultValues: {
			title: initialData?.title || "",
			description: initialData?.description || "",
			location: initialData?.location || "",
			payRate: initialData?.payRate || "",
			payBasis: initialData?.payBasis || "HOURLY",
			startTime: initialData?.startTime || "",
			endTime: initialData?.endTime || "",
			jobType: initialData?.jobType || "LOCUM",
			urgency: initialData?.urgency || "MEDIUM",
			requiredSpecialists: initialData?.requiredSpecialists || [],
			startDate: initialData?.startDate
				? new Date(initialData?.startDate)
				: undefined,
			endDate: initialData?.endDate
				? new Date(initialData?.endDate)
				: undefined,
		},
	});

	const onSubmit = async (data: JobPostFormValues) => {
		try {
			if (mode === "edit" && initialData?.id) {
				// Edit mode will be handled by parent component
				onSubmitSuccess?.(data);
			} else {
				// Create mode
				await postJobMutation.mutateAsync(data);
				toast.success("Job posted successfully!");
				router.push("/employer/dashboard/jobs");
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to post job",
			);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				{/* Job Details Section */}
				<div className="bg-card p-4 rounded-lg border shadow-sm space-y-4">
					<h2 className="text-base font-semibold flex items-center gap-2">
						<Briefcase className="size-4" />
						Job Details
					</h2>

					<div className="space-y-3">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Job Title</FormLabel>
									<FormControl>
										<Input
											className="h-9"
											placeholder="e.g. General Practitioner Locum"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="location"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Location</FormLabel>
									<FormControl>
										<Input
											className="h-9"
											placeholder="e.g. Petaling Jaya, Selangor"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Job Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Provide a detailed description of the role and requirements"
											rows={3}
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Optional: Describe the position, responsibilities, and
										requirements
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="jobType"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Job Type <span className="text-red-500">*</span>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="h-9">
													<SelectValue placeholder="Select job type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="LOCUM">Locum</SelectItem>
												<SelectItem value="FULL_TIME">Full Time</SelectItem>
												<SelectItem value="PART_TIME">Part Time</SelectItem>
												<SelectItem value="CONTRACT">Contract</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="urgency"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Urgency Level <span className="text-red-500">*</span>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="h-9">
													<SelectValue placeholder="Select urgency" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="LOW">Low</SelectItem>
												<SelectItem value="MEDIUM">Medium</SelectItem>
												<SelectItem value="HIGH">High</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="requiredSpecialists"
							render={({ field }) => {
								const values = field.value ?? [];
								const labels = values
									.map(
										(v) => SPECIALIST_OPTIONS.find((o) => o.value === v)?.label,
									)
									.filter(Boolean);

								return (
									<FormItem>
										<FormLabel>
											Required Specialists{" "}
											<span className="text-red-500">*</span>
										</FormLabel>
										<Popover
											open={isSpecialistsOpen}
											onOpenChange={setIsSpecialistsOpen}
										>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														role="combobox"
														aria-expanded={isSpecialistsOpen}
														className={cn(
															"h-9 w-full justify-between text-left font-normal",
															values.length === 0 && "text-muted-foreground",
														)}
													>
														<span className="truncate">
															{labels.length > 0
																? labels.join(", ")
																: "Select specialists"}
														</span>
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-[--radix-popover-trigger-width] p-0"
												align="start"
											>
												<Command>
													<CommandInput placeholder="Search specialists..." />
													<CommandList>
														<CommandEmpty>No specialist found.</CommandEmpty>
														<CommandGroup>
															{SPECIALIST_OPTIONS.filter(
																(opt) => opt.value !== "all",
															).map((option) => {
																const isSelected = values.includes(
																	option.value,
																);
																return (
																	<CommandItem
																		key={option.value}
																		value={option.label}
																		onSelect={() => {
																			const next = isSelected
																				? values.filter(
																						(v) => v !== option.value,
																					)
																				: [...values, option.value];
																			field.onChange(next);
																		}}
																	>
																		<Check
																			className={cn(
																				"mr-2 h-4 w-4",
																				isSelected
																					? "opacity-100"
																					: "opacity-0",
																			)}
																		/>
																		{option.label}
																	</CommandItem>
																);
															})}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
										<FormDescription>
											Select all specialties that are suitable for this position
										</FormDescription>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
					</div>
				</div>

				{/* Schedule & Compensation Section */}
				<div className="bg-card p-4 rounded-lg border shadow-sm space-y-4">
					<h2 className="text-base font-semibold flex items-center gap-2">
						<Clock className="size-4" />
						Schedule & Compensation
					</h2>

					<div className="space-y-3">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="startDate"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>
											Start Date <span className="text-red-500">*</span>
										</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														className={cn(
															"h-9 w-full justify-start text-left font-normal",
															!field.value && "text-muted-foreground",
														)}
													>
														<CalendarIcon className="mr-2 h-4 w-4" />
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>Pick a date</span>
														)}
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date < new Date(new Date().setHours(0, 0, 0, 0))
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="endDate"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>
											End Date <span className="text-red-500">*</span>
										</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														className={cn(
															"h-9 w-full justify-start text-left font-normal",
															!field.value && "text-muted-foreground",
														)}
													>
														<CalendarIcon className="mr-2 h-4 w-4" />
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>Pick a date</span>
														)}
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value}
													onSelect={field.onChange}
													disabled={(date) =>
														date < new Date(new Date().setHours(0, 0, 0, 0))
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="startTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Start Time <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input
												className="h-9"
												type="time"
												placeholder="09:00"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="endTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											End Time <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input
												className="h-9"
												type="time"
												placeholder="17:00"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="payRate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Pay Rate <span className="text-red-500">*</span>
										</FormLabel>
										<FormControl>
											<Input className="h-9" placeholder="e.g. 40" {...field} />
										</FormControl>
										<FormDescription>
											Enter the amount (e.g., 40 for RM40)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="payBasis"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Pay Basis <span className="text-red-500">*</span>
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="h-9">
													<SelectValue placeholder="Select pay basis" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="HOURLY">Per Hour</SelectItem>
												<SelectItem value="DAILY">Per Day</SelectItem>
												<SelectItem value="WEEKLY">Per Week</SelectItem>
												<SelectItem value="MONTHLY">Per Month</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				</div>

				{/* Form Actions */}
				<div className="flex justify-end gap-2">
					<Button
						variant="outline"
						type="button"
						onClick={() => router.back()}
						disabled={postJobMutation.isPending}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={postJobMutation.isPending}>
						{postJobMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{mode === "edit" ? "Updating..." : "Posting..."}
							</>
						) : mode === "edit" ? (
							"Update Job"
						) : (
							"Post Job"
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
}
