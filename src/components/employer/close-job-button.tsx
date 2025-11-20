"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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

interface CloseJobButtonProps {
	jobId: string;
	jobTitle: string;
}

export function CloseJobButton({ jobId, jobTitle }: CloseJobButtonProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();

	const closeJobMutation = useMutation({
		mutationFn: async () => {
			const res = await client.api.v2.facilities.jobs[":id"].close.$patch({
				param: { id: jobId },
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to close job");
			}

			return res.json();
		},
		onSuccess: () => {
			toast.success("Job closed successfully");
			queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
			queryClient.invalidateQueries({ queryKey: ["job", jobId] });
			setIsDialogOpen(false);
			router.refresh();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to close job");
		},
	});

	const handleClose = () => {
		closeJobMutation.mutate();
	};

	return (
		<>
			<Button
				type="button"
				variant="outline"
				className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
				onClick={() => setIsDialogOpen(true)}
			>
				Close Job
			</Button>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Close Job Posting?</DialogTitle>
						<DialogDescription className="space-y-2">
							<p>
								Are you sure you want to close{" "}
								<span className="font-semibold text-foreground">
									{jobTitle}
								</span>
								?
							</p>
							<p className="text-sm">
								This will prevent new applicants from applying. You can reopen
								this job later if needed.
							</p>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsDialogOpen(false)}
							disabled={closeJobMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleClose}
							disabled={closeJobMutation.isPending}
						>
							{closeJobMutation.isPending ? "Closing..." : "Yes, Close Job"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
