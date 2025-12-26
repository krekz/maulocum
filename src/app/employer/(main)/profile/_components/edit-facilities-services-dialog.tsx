"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	type UpdateFacilitiesServicesInput,
	updateFacilitiesServicesSchema,
} from "@/app/api/types/facilities.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/rpc";

interface EditFacilitiesServicesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultValues: UpdateFacilitiesServicesInput;
}

export function EditFacilitiesServicesDialog({
	open,
	onOpenChange,
	defaultValues,
}: EditFacilitiesServicesDialogProps) {
	const queryClient = useQueryClient();
	const [inputValue, setInputValue] = useState("");

	const form = useForm<UpdateFacilitiesServicesInput>({
		resolver: zodResolver(updateFacilitiesServicesSchema),
		defaultValues,
	});

	const mutation = useMutation({
		mutationFn: async (data: UpdateFacilitiesServicesInput) => {
			const res = await client.api.v2.facilities.profile[
				"facilities-services"
			].$patch({
				json: data,
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(
					error.message || "Failed to update facilities & services",
				);
			}

			return res.json();
		},
		onSuccess: () => {
			toast.success("Facilities & services updated successfully");
			queryClient.invalidateQueries({ queryKey: ["my-facility"] });
			onOpenChange(false);
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const onSubmit = (data: UpdateFacilitiesServicesInput) => {
		mutation.mutate(data);
	};

	const addService = () => {
		const trimmed = inputValue.trim();
		if (!trimmed) return;

		const currentServices = form.getValues("facilitiesServices");
		if (currentServices.includes(trimmed)) {
			toast.error("This service already exists");
			return;
		}

		if (currentServices.length >= 50) {
			toast.error("Maximum 50 services allowed");
			return;
		}

		form.setValue("facilitiesServices", [...currentServices, trimmed]);
		setInputValue("");
	};

	const removeService = (index: number) => {
		const currentServices = form.getValues("facilitiesServices");
		form.setValue(
			"facilitiesServices",
			currentServices.filter((_, i) => i !== index),
		);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addService();
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[625px]">
				<DialogHeader>
					<DialogTitle>Edit Facilities & Services</DialogTitle>
					<DialogDescription>
						Add or remove services offered at your clinic.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="facilitiesServices"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Services</FormLabel>
									<div className="space-y-3">
										<div className="flex gap-2">
											<FormControl>
												<Input
													value={inputValue}
													onChange={(e) => setInputValue(e.target.value)}
													onKeyDown={handleKeyDown}
													placeholder="Type a service and press Enter"
												/>
											</FormControl>
											<Button type="button" onClick={addService}>
												Add
											</Button>
										</div>
										<div className="flex flex-wrap gap-2 min-h-[100px] p-3 border rounded-md">
											{!field.value || field.value.length === 0 ? (
												<p className="text-sm text-muted-foreground">
													No services added yet
												</p>
											) : (
												field.value.map((service, index) => (
													<Badge
														key={index}
														variant="secondary"
														className="flex items-center gap-1 px-3 py-1"
													>
														{service}
														<button
															type="button"
															onClick={() => removeService(index)}
															className="ml-1 hover:text-destructive"
														>
															<X className="h-3 w-3" />
														</button>
													</Badge>
												))
											)}
										</div>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={mutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
