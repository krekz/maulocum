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

interface ReopenJobButtonProps {
	jobId: string;
	jobTitle: string;
}

export function ReopenJobButton({ jobId, jobTitle }: ReopenJobButtonProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();

	const reopenJobMutation = useMutation({
		mutationFn: async () => {
			const res = await client.api.v2.facilities.jobs[":id"].reopen.$patch({
				param: { id: jobId },
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to reopen job");
			}

			return res.json();
		},
		onSuccess: () => {
			toast.success("Job reopened successfully");
			queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
			queryClient.invalidateQueries({ queryKey: ["job", jobId] });
			setIsDialogOpen(false);
			router.refresh();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to reopen job");
		},
	});

	const handleReopen = () => {
		reopenJobMutation.mutate();
	};

	return (
		<>
			<Button
				type="button"
				variant="default"
				className="w-full bg-green-600 hover:bg-green-700 text-white"
				onClick={() => setIsDialogOpen(true)}
			>
				Reopen Job
			</Button>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reopen Job Posting?</DialogTitle>
						<DialogDescription className="space-y-2">
							<p>
								Are you sure you want to reopen{" "}
								<span className="font-semibold text-foreground">
									{jobTitle}
								</span>
								?
							</p>
							<p className="text-sm">
								This will make the job visible to applicants again and allow new
								applications to be submitted.
							</p>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsDialogOpen(false)}
							disabled={reopenJobMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleReopen}
							disabled={reopenJobMutation.isPending}
							className="bg-green-600 hover:bg-green-700"
						>
							{reopenJobMutation.isPending ? "Reopening..." : "Yes, Reopen Job"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
