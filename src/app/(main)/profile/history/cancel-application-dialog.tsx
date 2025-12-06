"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
import type { $Enums } from "../../../../../prisma/generated/prisma/client";

const cancellationSchema = z.object({
	cancellationReason: z
		.string()
		.min(10, "Please provide at least 10 characters")
		.max(500, "Reason must be less than 500 characters"),
});

type CancellationFormValues = z.infer<typeof cancellationSchema>;

interface CancelApplicationDialogProps {
	applicationId: string;
	jobTitle: string;
	status: $Enums.JobApplicationStatus;
}

export function CancelApplicationDialog({
	applicationId,
	jobTitle,
	status,
}: CancelApplicationDialogProps) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const requiresReason = status === "DOCTOR_CONFIRMED";

	const form = useForm<CancellationFormValues>({
		resolver: zodResolver(cancellationSchema),
		defaultValues: {
			cancellationReason: "",
		},
	});

	const cancelMutation = useMutation({
		mutationFn: async (data?: CancellationFormValues) => {
			const response = await client.api.v2.doctors.applications[
				":applicationId"
			].cancel.$post({
				param: { applicationId },
				json: { cancellationReason: data?.cancellationReason },
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to cancel application");
			}

			return response.json();
		},
		onSuccess: (data) => {
			toast.success(data.message || "Application cancelled successfully");
			setOpen(false);
			form.reset();
			// Invalidate and refetch applications
			queryClient.invalidateQueries({ queryKey: ["doctor-applications"] });
			// Force page refresh for server component
			window.location.reload();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to cancel application");
		},
	});

	const onSubmit = (data: CancellationFormValues) => {
		cancelMutation.mutate(data);
	};

	const handleCancelWithoutReason = () => {
		cancelMutation.mutate(undefined);
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="text-red-600 hover:text-red-700 hover:bg-red-50"
				>
					<X className="w-3.5 h-3.5 mr-1" />
					Cancel
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="sm:max-w-md">
				<AlertDialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
							<AlertTriangle className="h-5 w-5 text-red-600" />
						</div>
						<div>
							<AlertDialogTitle>Cancel Application</AlertDialogTitle>
							<AlertDialogDescription className="text-left">
								{requiresReason
									? "You have already confirmed this job. Are you sure you want to cancel?"
									: "Are you sure you want to cancel this application?"}
							</AlertDialogDescription>
						</div>
					</div>
				</AlertDialogHeader>

				<div className="py-4">
					<div className="rounded-lg bg-slate-50 p-3 mb-4">
						<p className="text-sm font-medium text-slate-900">{jobTitle}</p>
						{requiresReason && (
							<p className="text-xs text-amber-600 mt-1">
								⚠️ The employer will be notified of your cancellation
							</p>
						)}
					</div>

					{requiresReason ? (
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4"
							>
								<FormField
									control={form.control}
									name="cancellationReason"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Reason for cancellation{" "}
												<span className="text-red-500">*</span>
											</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Please explain why you need to cancel this application..."
													className="min-h-[100px] resize-none"
													{...field}
												/>
											</FormControl>
											<FormMessage />
											<p className="text-xs text-slate-500">
												This will be shared with the employer
											</p>
										</FormItem>
									)}
								/>
								<AlertDialogFooter>
									<AlertDialogCancel
										type="button"
										disabled={cancelMutation.isPending}
									>
										Keep Application
									</AlertDialogCancel>
									<Button
										type="submit"
										disabled={cancelMutation.isPending}
										className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
									>
										{cancelMutation.isPending ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Cancelling...
											</>
										) : (
											"Yes, Cancel Application"
										)}
									</Button>
								</AlertDialogFooter>
							</form>
						</Form>
					) : (
						<AlertDialogFooter>
							<AlertDialogCancel disabled={cancelMutation.isPending}>
								Keep Application
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={(e) => {
									e.preventDefault();
									handleCancelWithoutReason();
								}}
								disabled={cancelMutation.isPending}
								className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
							>
								{cancelMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Cancelling...
									</>
								) : (
									"Yes, Cancel Application"
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					)}
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
