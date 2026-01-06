"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";
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

interface CompleteJobButtonProps {
	jobId: string;
	jobTitle: string;
}

export function CompleteJobButton({ jobId, jobTitle }: CompleteJobButtonProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();

	const completeJobMutation = useMutation({
		mutationFn: async () => {
			const res = await client.api.v2.facilities.jobs[":id"].complete.$patch({
				param: { id: jobId },
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to mark job as completed");
			}

			return res.json();
		},
		onSuccess: () => {
			toast.success("Job marked as completed");
			queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
			queryClient.invalidateQueries({ queryKey: ["job", jobId] });
			setIsDialogOpen(false);
			router.refresh();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to mark job as completed");
		},
	});

	const handleComplete = () => {
		completeJobMutation.mutate();
	};

	return (
		<>
			<Button
				type="button"
				variant="outline"
				className="w-full text-emerald-600 border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
				onClick={() => setIsDialogOpen(true)}
			>
				<CheckCircle className="size-4 mr-2" />
				Mark as Completed
			</Button>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Mark Job as Completed?</DialogTitle>
						<DialogDescription className="space-y-2">
							<p>
								Are you sure you want to mark{" "}
								<span className="font-semibold text-foreground">
									{jobTitle}
								</span>{" "}
								as completed?
							</p>
							<p className="text-sm">
								This will mark all confirmed doctors for this job as completed.
							</p>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsDialogOpen(false)}
							disabled={completeJobMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="button"
							className="bg-emerald-600 hover:bg-emerald-700"
							onClick={handleComplete}
							disabled={completeJobMutation.isPending}
						>
							{completeJobMutation.isPending
								? "Completing..."
								: "Yes, Mark as Completed"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
