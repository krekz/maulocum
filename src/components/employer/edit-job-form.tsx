"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notFound, useRouter } from "next/navigation";
import { toast } from "sonner";
import type { JobPostFormValues } from "@/app/api/types/jobs.types";
import { JobPostForm } from "@/components/jobs/job-post-form";
import { client, type JobDetailProps } from "@/lib/rpc";

export function EditJobForm({ job }: { job: JobDetailProps["data"] }) {
	if (!job) notFound();

	const router = useRouter();
	const queryClient = useQueryClient();

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
		updateJobMutation.mutate(data);
	};

	return (
		<JobPostForm mode="edit" initialData={job} onSubmitSuccess={handleSubmit} />
	);
}
