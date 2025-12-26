"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	type UpdateAboutInput,
	updateAboutSchema,
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
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/rpc";

interface EditAboutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultValues: UpdateAboutInput;
}

export function EditAboutDialog({
	open,
	onOpenChange,
	defaultValues,
}: EditAboutDialogProps) {
	const queryClient = useQueryClient();

	const form = useForm<UpdateAboutInput>({
		resolver: zodResolver(updateAboutSchema),
		defaultValues,
	});

	const mutation = useMutation({
		mutationFn: async (data: UpdateAboutInput) => {
			const res = await client.api.v2.facilities.profile.about.$patch({
				json: data,
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to update about section");
			}

			return res.json();
		},
		onSuccess: () => {
			toast.success("About section updated successfully");
			queryClient.invalidateQueries({ queryKey: ["my-facility"] });
			onOpenChange(false);
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	const onSubmit = (data: UpdateAboutInput) => {
		mutation.mutate(data);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[625px]">
				<DialogHeader>
					<DialogTitle>Edit About Section</DialogTitle>
					<DialogDescription>
						Tell visitors about your clinic's history, mission, and services.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											rows={10}
											placeholder="Describe your clinic, services, and what makes you unique..."
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
