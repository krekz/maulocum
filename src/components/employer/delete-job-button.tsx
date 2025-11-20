"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { client } from "@/lib/rpc";

interface DeleteJobButtonProps {
	jobId: string;
	jobTitle: string;
}

export function DeleteJobButton({ jobId, jobTitle }: DeleteJobButtonProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();

	const deleteJobMutation = useMutation({
		mutationFn: async () => {
			const res = await client.api.v2.facilities.jobs[":id"].$delete({
				param: { id: jobId },
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to delete job");
			}

			return res.json();
		},
		onSuccess: () => {
			toast.success("Job deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
			setIsDialogOpen(false);
			// Redirect to jobs list after deletion
			router.push("/employer/dashboard/jobs");
			router.refresh();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete job");
		},
	});

	const handleDelete = () => {
		deleteJobMutation.mutate();
	};

	return (
		<>
			<Button
				type="button"
				variant="outline"
				className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
				onClick={() => setIsDialogOpen(true)}
			>
				Delete Job
			</Button>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
								<AlertTriangle className="h-5 w-5 text-red-600" />
							</div>
							<DialogTitle>Delete Job Posting?</DialogTitle>
						</div>
						<DialogDescription className="space-y-3 pt-4">
							<p>
								Are you sure you want to permanently delete{" "}
								<span className="font-semibold text-foreground">
									{jobTitle}
								</span>
								?
							</p>
							<div className="rounded-lg bg-red-50 border border-red-200 p-3">
								<p className="text-sm text-red-800 font-medium">
									⚠️ Warning: This action cannot be undone
								</p>
								<ul className="mt-2 text-sm text-red-700 space-y-1 list-disc list-inside">
									<li>All job data will be permanently deleted</li>
									<li>This action is irreversible</li>
									<li>
										Jobs with applicants cannot be deleted (close them instead)
									</li>
								</ul>
							</div>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsDialogOpen(false)}
							disabled={deleteJobMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleDelete}
							disabled={deleteJobMutation.isPending}
						>
							{deleteJobMutation.isPending
								? "Deleting..."
								: "Yes, Delete Permanently"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
