"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, FileText, Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	type DoctorVerificationFormData,
	doctorVerificationFormSchema,
} from "@/lib/schemas/doctor-verification.schema";
import { useEditVerificationStore } from "@/lib/store/useEditVerificationStore";

type FormData = DoctorVerificationFormData;

interface EditVerificationFormProps {
	verification: {
		id: string;
		fullName: string;
		location: string;
		specialty?: string | null;
		yearsOfExperience: number;
		provisionalId?: string | null;
		fullId?: string | null;
		apcNumber: string;
		apcDocumentUrl: string;
	};
}

export function EditVerificationForm({
	verification,
}: EditVerificationFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const { setIsEditing } = useEditVerificationStore();
	const router = useRouter();

	const form = useForm<FormData>({
		resolver: zodResolver(doctorVerificationFormSchema),
		defaultValues: {
			fullName: verification.fullName,
			location: verification.location,
			specialty: verification.specialty || "",
			yearsOfExperience: verification.yearsOfExperience,
			provisionalId: verification.provisionalId || "",
			fullId: verification.fullId || "",
			apcNumber: verification.apcNumber,
		},
	});

	async function onSubmit(data: FormData) {
		setIsSubmitting(true);

		try {
			// Step 1: Upload new file if selected (replaces old file)
			if (selectedFile) {
				toast.loading("Uploading document...");
				const formData = new FormData();
				formData.append("file", selectedFile);

				const uploadResponse = await fetch(
					`/api/v2/profile/verification/${verification.id}/replace-document`,
					{
						method: "POST",
						body: formData,
					},
				);

				if (!uploadResponse.ok) {
					throw new Error("Failed to upload document");
				}
				toast.dismiss();
			}

			// Step 2: Update verification details
			toast.loading("Saving changes...");
			const response = await fetch(
				`/api/v2/profile/verification/${verification.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to update verification");
			}

			toast.dismiss();
			toast.success("Verification updated successfully!");
			setIsEditing(false); // Close edit mode
			router.refresh();
		} catch (error) {
			toast.dismiss();
			console.error("Error updating verification:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to update verification";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Card className="p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-bold">Edit Your Verification Details</h2>
				<p className="text-muted-foreground mt-2">
					You can update your information while your verification is pending.
				</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Full Name */}
						<FormField
							control={form.control}
							name="fullName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name *</FormLabel>
									<FormControl>
										<Input placeholder="Dr. John Doe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Location */}
						<FormField
							control={form.control}
							name="location"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Location *</FormLabel>
									<FormControl>
										<Input placeholder="Kuala Lumpur, Malaysia" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{/* Specialty */}
						<FormField
							control={form.control}
							name="specialty"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Specialty (Optional)</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select specialty" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="general">General Practice</SelectItem>
											<SelectItem value="emergency">
												Emergency Medicine
											</SelectItem>
											<SelectItem value="pediatrics">Pediatrics</SelectItem>
											<SelectItem value="surgery">Surgery</SelectItem>
											<SelectItem value="internal">
												Internal Medicine
											</SelectItem>
											<SelectItem value="other">Other</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Years of Experience */}
						<FormField
							control={form.control}
							name="yearsOfExperience"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Years of Experience *</FormLabel>
									<FormControl>
										<Input
											type="number"
											min="0"
											placeholder="5"
											{...field}
											onChange={(e) => field.onChange(Number(e.target.value))}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Provisional ID */}
						<FormField
							control={form.control}
							name="provisionalId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Provisional Registration ID</FormLabel>
									<FormControl>
										<Input placeholder="PRO-12345" {...field} />
									</FormControl>
									<FormDescription>
										Provide either Provisional or Full ID
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Full ID */}
						<FormField
							control={form.control}
							name="fullId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Registration ID</FormLabel>
									<FormControl>
										<Input placeholder="FULL-12345" {...field} />
									</FormControl>
									<FormDescription>
										Provide either Provisional or Full ID
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* APC Number */}
						<FormField
							control={form.control}
							name="apcNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Annual Practicing Certificate (APC) Number *
									</FormLabel>
									<FormControl>
										<Input placeholder="APC-12345-2024" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* APC Document Upload/Replace */}
					<div>
						<FormLabel>APC Document</FormLabel>
						<div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors mt-2">
							<input
								type="file"
								accept=".pdf"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										setSelectedFile(file);
									}
								}}
								className="hidden"
								id="apc-upload-edit"
								disabled={isSubmitting}
							/>
							<label
								htmlFor="apc-upload-edit"
								className="cursor-pointer flex flex-col items-center gap-2"
							>
								{selectedFile ? (
									<>
										<CheckCircle2 className="h-10 w-10 text-green-600" />
										<p className="text-sm font-medium">{selectedFile.name}</p>
										<p className="text-xs text-muted-foreground">
											New file selected. Click "Save Changes" to upload.
										</p>
									</>
								) : (
									<>
										<FileText className="h-10 w-10 text-blue-600" />
										<p className="text-sm font-medium">
											Current document uploaded
										</p>
										<p className="text-xs text-muted-foreground">
											Click to select new PDF (Max 1MB)
										</p>
										<Button
											type="button"
											variant="link"
											size="sm"
											asChild
											className="mt-2"
										>
											<a
												href={verification.apcDocumentUrl}
												target="_blank"
												rel="noopener noreferrer"
												onClick={(e) => e.stopPropagation()}
											>
												View Current Document
											</a>
										</Button>
									</>
								)}
							</label>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{selectedFile
								? "Click 'Save Changes' to upload and replace the old document"
								: "Uploading a new document will replace the old one"}
						</p>
					</div>

					<div className="flex flex-row gap-4 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsEditing(false)}
							disabled={isSubmitting}
							className="flex-1"
						>
							<X className="h-4 w-4 mr-2" />
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting} className="flex-1">
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									Save Changes
								</>
							)}
						</Button>
					</div>
				</form>
			</Form>
		</Card>
	);
}
