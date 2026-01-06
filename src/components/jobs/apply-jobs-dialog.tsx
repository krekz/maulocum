"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { FileText, Upload } from "lucide-react";
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
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/rpc";

function ApplyJobDialog({
	trigger,
	jobTitle = "This Position",
	jobId,
}: {
	trigger?: React.ReactNode;
	jobTitle?: string | null;
	jobId: string;
}) {
	const [open, setOpen] = useState(false);
	const [coverLetter, setCoverLetter] = useState("");
	// const [file, setFile] = useState<File | null>(null);
	const queryClient = useQueryClient();

	const applyMutation = useMutation({
		mutationFn: async (data: { jobId: string; coverLetter?: string }) => {
			const response = await client.api.v2.doctors.applications.$post({
				json: data,
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to submit application");
			}

			return response.json();
		},
		onSuccess: () => {
			toast.success("Application submitted successfully!");
			queryClient.invalidateQueries({ queryKey: ["doctor-applications"] });
			setOpen(false);
			setCoverLetter("");
			// setFile(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to submit application");
		},
	});

	// const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	if (e.target.files?.[0]) {
	// 		setFile(e.target.files[0]);
	// 	}
	// };

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		applyMutation.mutate({
			jobId,
			coverLetter: coverLetter.trim() || undefined,
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || <Button>Apply Now</Button>}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Apply for {jobTitle}</DialogTitle>
					<DialogDescription>
						Add any additional information that might help your application.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="cover-note">Additional Notes (Optional)</Label>
						<Textarea
							id="cover-note"
							value={coverLetter}
							onChange={(e) => setCoverLetter(e.target.value)}
							placeholder="Share any relevant experience or availability information..."
							className="min-h-[100px]"
							maxLength={1000}
						/>
					</div>

					{/* <div className="space-y-2">
						<Label htmlFor="document">Upload Document (Optional)</Label>
						<div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
							<input
								id="document"
								type="file"
								className="hidden"
								onChange={handleFileChange}
								accept=".pdf,.doc,.docx"
							/>
							<Label
								htmlFor="document"
								className="cursor-pointer w-full h-full flex flex-col items-center gap-2"
							>
								<Upload className="h-8 w-8 text-muted-foreground" />
								<span className="text-sm font-medium">
									{file ? file.name : "Click to upload or drag and drop"}
								</span>
								<span className="text-xs text-muted-foreground">
									PDF, DOC, DOCX (Max 5MB)
								</span>
							</Label>
						</div>
						{file && (
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<FileText className="h-4 w-4" />
								<span className="truncate">{file.name}</span>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => setFile(null)}
								>
									Remove
								</Button>
							</div>
						)}
					</div> */}

					<DialogFooter className="pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={applyMutation.isPending}>
							{applyMutation.isPending ? "Applying..." : "Apply Now"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default ApplyJobDialog;
