"use client";

import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobApplicants } from "@/lib/hooks/useJobApplicants";
import { ApplicantsDataTable } from "../../applicants/_components/applicants-data-table";
import { singleJobColumns } from "../../applicants/_components/single-job-columns";

interface JobApplicantsSectionProps {
	jobId: string;
}

export function JobApplicantsSection({ jobId }: JobApplicantsSectionProps) {
	const { data: applicants, isLoading, error } = useJobApplicants(jobId);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Users className="size-5 text-primary" />
						Applicants
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
						<span className="ml-3 text-muted-foreground">
							Loading applicants...
						</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Users className="size-5 text-primary" />
						Applicants
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-destructive text-center py-8">
						Failed to load applicants
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Users className="size-5 text-primary" />
					Applicants ({applicants?.length ?? 0})
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ApplicantsDataTable
					columns={singleJobColumns}
					data={applicants ?? []}
				/>
			</CardContent>
		</Card>
	);
}
