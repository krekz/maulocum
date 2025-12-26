"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	type UpdateClinicInfoInput,
	updateClinicInfoSchema,
} from "@/app/api/types/facilities.types";
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
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/rpc";

interface EditClinicInfoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultValues: UpdateClinicInfoInput;
}

export function EditClinicInfoDialog({
	open,
	onOpenChange,
	defaultValues,
}: EditClinicInfoDialogProps) {
	const queryClient = useQueryClient();

	const form = useForm<UpdateClinicInfoInput>({
		resolver: zodResolver(updateClinicInfoSchema),
		defaultValues,
	});

	const mutation = useMutation({
		mutationFn: async (data: UpdateClinicInfoInput) => {
			const res = await client.api.v2.facilities.profile["clinic-info"].$patch({
				json: data,
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to update clinic information");
			}

			return res.json();
		},
		onSuccess: () => {
			toast.success("Clinic information updated successfully");
			queryClient.invalidateQueries({ queryKey: ["my-facility"] });
			onOpenChange(false);
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const onSubmit = (data: UpdateClinicInfoInput) => {
		mutation.mutate(data);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle>Edit Clinic Information</DialogTitle>
					<DialogDescription>
						Update your clinic's contact and location details.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Address</FormLabel>
									<FormControl>
										<Textarea {...field} rows={3} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="contactPhone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone</FormLabel>
									<FormControl>
										<Input {...field} placeholder="+60 123456789" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="contactEmail"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input {...field} type="email" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="website"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Website (Optional)</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="url"
											placeholder="https://example.com"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="operatingHours"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Operating Hours (Optional)</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											rows={3}
											placeholder="Mon-Fri: 9:00 AM - 6:00 PM&#10;Sat: 9:00 AM - 1:00 PM&#10;Sun: Closed"
										/>
									</FormControl>
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
