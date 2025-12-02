"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, MoreHorizontal, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import type { TJobApplicant } from "@/lib/rpc";
import { client } from "@/lib/rpc";

interface ApplicationActionsProps {
	application: TJobApplicant;
}

export function ApplicationActions({ application }: ApplicationActionsProps) {
	const queryClient = useQueryClient();
	const [showApproveDialog, setShowApproveDialog] = useState(false);
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");

	const isPending = application.status === "PENDING";
	const isAwaitingConfirmation = application.status === "EMPLOYER_APPROVED";

	// Approve mutation
	const approveMutation = useMutation({
		mutationFn: async () => {
			const response = await client.api.v2.admin.applications[
				":applicationId"
			].approve.$post({
				param: { applicationId: application.id },
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to approve application");
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success("Application approved successfully", {
				description:
					"Confirmation link has been sent to the doctor via WhatsApp.",
			});
			// Invalidate queries to refresh the list
			queryClient.invalidateQueries({ queryKey: ["job-applicants"] });
			setShowApproveDialog(false);
		},
		onError: (error) => {
			toast.error("Failed to approve application", {
				description: error.message,
			});
		},
	});

	// Reject mutation
	const rejectMutation = useMutation({
		mutationFn: async () => {
			const response = await client.api.v2.admin.applications[
				":applicationId"
			].reject.$post({
				param: { applicationId: application.id },
				json: { reason: rejectionReason || undefined },
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to reject application");
			}

			return response.json();
		},
		onSuccess: () => {
			toast("Application rejected successfully", {
				description: "The application has been rejected.",
			});
			queryClient.invalidateQueries({ queryKey: ["job-applicants"] });
			setShowRejectDialog(false);
			setRejectionReason("");
		},
		onError: (error) => {
			toast.error("Failed to reject application", {
				description: error.message,
			});
		},
	});

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="size-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem>View Application</DropdownMenuItem>
					<DropdownMenuItem>View Doctor Profile</DropdownMenuItem>
					<DropdownMenuSeparator />

					{isPending && (
						<>
							<DropdownMenuItem
								className="text-green-600 focus:text-green-600 focus:bg-green-50"
								onClick={() => setShowApproveDialog(true)}
							>
								<Check className="mr-2 size-4" />
								Approve Application
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-red-600 focus:text-red-600 focus:bg-red-50"
								onClick={() => setShowRejectDialog(true)}
							>
								<X className="mr-2 size-4" />
								Reject Application
							</DropdownMenuItem>
						</>
					)}

					{isAwaitingConfirmation && (
						<DropdownMenuItem disabled className="text-orange-600">
							Awaiting Doctor Confirmation
						</DropdownMenuItem>
					)}

					{!isPending && !isAwaitingConfirmation && (
						<DropdownMenuItem>View Cover Letter</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Approve Confirmation Dialog */}
			<AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Approve Application</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to approve{" "}
							<span className="font-semibold">
								{application.DoctorProfile?.user.name}
							</span>
							's application for{" "}
							<span className="font-semibold">{application.job.title}</span>?
							<br />
							<br />A WhatsApp message with a confirmation link will be sent to
							the doctor. The booking will only be finalized once the doctor
							confirms.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={approveMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								approveMutation.mutate();
							}}
							disabled={approveMutation.isPending}
							className="bg-green-600 hover:bg-green-700"
						>
							{approveMutation.isPending && (
								<Loader2 className="mr-2 size-4 animate-spin" />
							)}
							Approve & Send Link
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Reject Confirmation Dialog */}
			<AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Reject Application</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to reject{" "}
							<span className="font-semibold">
								{application.DoctorProfile?.user.name}
							</span>
							's application?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="py-4">
						<label
							htmlFor="rejection-reason"
							className="text-sm font-medium text-slate-700"
						>
							Reason (optional)
						</label>
						<Textarea
							id="rejection-reason"
							placeholder="Enter a reason for rejection..."
							value={rejectionReason}
							onChange={(e) => setRejectionReason(e.target.value)}
							className="mt-2"
						/>
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={rejectMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault();
								rejectMutation.mutate();
							}}
							disabled={rejectMutation.isPending}
							className="bg-red-600 hover:bg-red-700"
						>
							{rejectMutation.isPending && (
								<Loader2 className="mr-2 size-4 animate-spin" />
							)}
							Reject Application
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
