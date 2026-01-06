"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { notFound, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { JobPostFormValues } from "@/app/api/types/jobs.types";
import { JobPostForm } from "@/components/jobs/job-post-form";
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
import { client, type JobDetailProps } from "@/lib/rpc";

interface EditJobFormProps {
	job: JobDetailProps["data"];
	acceptedDoctorsCount?: number;
}

export function EditJobForm({
	job,
	acceptedDoctorsCount = 0,
}: EditJobFormProps) {
	if (!job) notFound();

	const router = useRouter();
	const queryClient = useQueryClient();
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [pendingData, setPendingData] = useState<JobPostFormValues | null>(
		null,
	);
	const [doctorsToRemove, setDoctorsToRemove] = useState(0);

	const updateJobMutation = useMutation({
		mutationFn: async (data: JobPostFormValues) => {
			const res = await client.api.v2.facilities.jobs[":id"].$patch({
				param: { id: job.id },
				json: {
					...data,
					// Http only accept string as date
					startDate: data.startDate.toISOString(),
					endDate: data.endDate.toISOString(),
				},
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message, {
					cause: res.status,
				});
			}

			return res.json();
		},
		onSuccess: () => {
			toast.success("Job updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
			queryClient.invalidateQueries({ queryKey: ["job", job.id] });
			router.push(`/employer/dashboard/jobs/${job.id}`);
			router.refresh();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update job");
		},
	});

	const handleSubmit = (data: JobPostFormValues) => {
		const currentDoctorsNeeded = job.doctorsNeeded || 1;
		const newDoctorsNeeded = data.doctorsNeeded ?? 1;

		// Check if doctors needed is being decreased and there are accepted doctors that would be affected
		if (
			newDoctorsNeeded < currentDoctorsNeeded &&
			acceptedDoctorsCount > newDoctorsNeeded
		) {
			const toRemove = acceptedDoctorsCount - newDoctorsNeeded;
			setDoctorsToRemove(toRemove);
			setPendingData(data);
			setShowConfirmDialog(true);
			return;
		}

		updateJobMutation.mutate(data);
	};

	const handleConfirmDecrease = () => {
		if (pendingData) {
			updateJobMutation.mutate(pendingData);
		}
		setShowConfirmDialog(false);
		setPendingData(null);
	};

	return (
		<>
			<JobPostForm
				mode="edit"
				initialData={job}
				onSubmitSuccess={handleSubmit}
			/>

			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-amber-500" />
							Confirm Doctor Removal
						</AlertDialogTitle>
						<AlertDialogDescription className="space-y-2">
							<p>
								You are decreasing the number of doctors needed for this job.
								This will result in <strong>{doctorsToRemove} doctor(s)</strong>{" "}
								being removed from this job.
							</p>
							<p className="text-amber-600 font-medium">
								The most recently accepted doctors will be removed, and their
								job applications will be cancelled.
							</p>
							<p>Are you sure you want to proceed?</p>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setPendingData(null)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmDecrease}
							className="bg-amber-600 hover:bg-amber-700"
						>
							Yes, Remove Doctors
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
