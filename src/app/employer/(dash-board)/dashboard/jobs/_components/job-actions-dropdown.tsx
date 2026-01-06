"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Eye, MoreHorizontal, Pencil, Users } from "lucide-react";
import Link from "next/link";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { client } from "@/lib/rpc";

interface JobActionsDropdownProps {
	job: {
		id: string;
		title: string | null;
		status: "OPEN" | "FILLED" | "CLOSED";
		_count: {
			applicants: number;
		};
	};
}

export function JobActionsDropdown({ job }: JobActionsDropdownProps) {
	const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();

	const completeJobMutation = useMutation({
		mutationFn: async () => {
			const res = await client.api.v2.facilities.jobs[":id"].complete.$patch({
				param: { id: job.id },
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
			setIsCompleteDialogOpen(false);
			router.refresh();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to mark job as completed");
		},
	});

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<Link href={`/employer/dashboard/jobs/${job.id}`}>
							<Eye className="mr-2 h-4 w-4" />
							View Details
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href={`/employer/dashboard/jobs/${job.id}/edit`}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit Job
						</Link>
					</DropdownMenuItem>
					{job._count.applicants > 0 && (
						<DropdownMenuItem asChild>
							<Link
								href={`/employer/dashboard/jobs/applicants?jobId=${job.id}`}
							>
								<Users className="mr-2 h-4 w-4" />
								View Applicants ({job._count.applicants})
							</Link>
						</DropdownMenuItem>
					)}
					{job.status === "OPEN" && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => setIsCompleteDialogOpen(true)}
								className="text-emerald-600 focus:text-emerald-600"
							>
								<CheckCircle className="mr-2 h-4 w-4" />
								Mark as Completed
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<Dialog
				open={isCompleteDialogOpen}
				onOpenChange={setIsCompleteDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Mark Job as Completed?</DialogTitle>
						<DialogDescription className="space-y-2">
							<p>
								Are you sure you want to mark{" "}
								<span className="font-semibold text-foreground">
									{job.title || "Untitled Position"}
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
							onClick={() => setIsCompleteDialogOpen(false)}
							disabled={completeJobMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="button"
							className="bg-emerald-600 hover:bg-emerald-700"
							onClick={() => completeJobMutation.mutate()}
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
