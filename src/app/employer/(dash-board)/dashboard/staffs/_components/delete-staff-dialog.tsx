"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
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
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/rpc";

interface DeleteStaffDialogProps {
	staffId: string;
	staffName: string;
}

export function DeleteStaffDialog({
	staffId,
	staffName,
}: DeleteStaffDialogProps) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: async () => {
			const res = await client.api.v2.facilities.staffs[":id"].$delete({
				param: { id: staffId },
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to remove staff member");
			}

			return res.json();
		},
		onSuccess: () => {
			toast.success(`${staffName} has been removed from your facility.`);
			queryClient.invalidateQueries({
				queryKey: ["employer", "facility", "staffs"],
			});
			setOpen(false);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remove staff member");
		},
	});

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button variant="ghost" size="icon">
					<Trash2 className="h-4 w-4 text-destructive" />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to remove <strong>{staffName}</strong> from
						your facility? This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleteMutation.isPending}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							deleteMutation.mutate();
						}}
						disabled={deleteMutation.isPending}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{deleteMutation.isPending && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						Remove
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
