"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ExternalLink, Loader2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import SelectState from "@/components/select-state";
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
import { useUpdateDoctorVerification } from "@/lib/hooks/useDoctorSubmitVerification";
import {
	type DoctorVerificationSchema,
	doctorVerificationEditSchema,
} from "@/lib/schemas/doctor-verification.schema";
import { useEditVerificationStore } from "@/lib/store/useEditVerificationStore";

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
	const { setIsEditing } = useEditVerificationStore();
	const updateMutation = useUpdateDoctorVerification();

	type EditFormValues = Omit<DoctorVerificationSchema, "apcDocument"> & {
		apcDocument?: File;
	};

	const form = useForm<EditFormValues>({
		resolver: zodResolver(doctorVerificationEditSchema),
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

	const selectedFile = form.watch("apcDocument");

	async function onSubmit(data: EditFormValues) {
		try {
			toast.promise(
				updateMutation.mutateAsync({
					verificationId: verification.id,
					fullName: data.fullName,
					location: data.location,
					specialty: data.specialty || undefined,
					yearsOfExperience: data.yearsOfExperience,
					provisionalId: data.provisionalId || undefined,
					fullId: data.fullId || undefined,
					apcNumber: data.apcNumber,
					apcDocument: data.apcDocument,
				}),
				{
					loading: "Saving changes...",
					success: "Verification updated successfully!",
					error: "Failed to update verification",
				},
			);
		} catch (error) {
			toast.dismiss();
			console.error("Error updating verification:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to update verification";
			toast.error(errorMessage);
		}
	}

	return (
		<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
			<div className="px-4 py-3 border-b border-slate-100">
				<h3 className="font-semibold text-slate-900 text-sm">
					Edit Verification Details
				</h3>
				<p className="text-xs text-muted-foreground mt-0.5">
					Update your information while verification is pending
				</p>
			</div>

			<div className="p-4">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="flex items-center justify-between">
							<a
								href={verification.apcDocumentUrl}
								target="_blank"
								rel="noreferrer"
								className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
							>
								<ExternalLink className="h-3.5 w-3.5" />
								Download current document
							</a>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="fullName"
								render={({ field }) => (
									<FormItem>
										<label
											htmlFor="fullName"
											className="text-xs font-medium text-slate-700 mb-1.5 block"
										>
											Full Name <span className="text-red-500">*</span>
										</label>
										<FormControl>
											<Input
												id="fullName"
												placeholder="Dr. John Doe"
												className="h-9 text-sm"
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							<SelectState form={form} />

							<FormField
								control={form.control}
								name="specialty"
								render={({ field }) => (
									<FormItem>
										<label
											htmlFor="specialty"
											className="text-xs font-medium text-slate-700 mb-1.5 block"
										>
											Specialty
										</label>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger className="h-9 text-sm">
													<SelectValue placeholder="Select specialty" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="general">
													General Practice
												</SelectItem>
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
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="yearsOfExperience"
								render={({ field }) => (
									<FormItem>
										<label
											htmlFor="yearsOfExperience"
											className="text-xs font-medium text-slate-700 mb-1.5 block"
										>
											Years of Experience{" "}
											<span className="text-red-500">*</span>
										</label>
										<FormControl>
											<Input
												id="yearsOfExperience"
												type="number"
												min="0"
												placeholder="5"
												className="h-9 text-sm"
												{...field}
												value={
													typeof field.value === "number" ? field.value : 0
												}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="apcNumber"
								render={({ field }) => (
									<FormItem>
										<label
											htmlFor="apcNumber"
											className="text-xs font-medium text-slate-700 mb-1.5 block"
										>
											APC Number <span className="text-red-500">*</span>
										</label>
										<FormControl>
											<Input
												id="apcNumber"
												placeholder="APC-12345-2024"
												className="h-9 text-sm"
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="provisionalId"
								render={({ field }) => (
									<FormItem>
										<label
											htmlFor="provisionalId"
											className="text-xs font-medium text-slate-700 mb-1.5 block"
										>
											Provisional Registration ID
										</label>
										<FormControl>
											<Input
												id="provisionalId"
												placeholder="PRO-12345"
												className="h-9 text-sm"
												{...field}
											/>
										</FormControl>
										<p className="text-[10px] text-slate-400 mt-1">
											Provide either Provisional or Full ID
										</p>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="fullId"
								render={({ field }) => (
									<FormItem>
										<label
											htmlFor="fullId"
											className="text-xs font-medium text-slate-700 mb-1.5 block"
										>
											Full Registration ID
										</label>
										<FormControl>
											<Input
												id="fullId"
												placeholder="FULL-12345"
												className="h-9 text-sm"
												{...field}
											/>
										</FormControl>
										<p className="text-[10px] text-slate-400 mt-1">
											Provide either Provisional or Full ID
										</p>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="apcDocument"
							render={() => (
								<FormItem>
									<FormLabel>Upload New APC Document (Optional)</FormLabel>
									<FormControl>
										<div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
											<input
												type="file"
												accept=".pdf"
												onChange={(e) => {
													const file = e.target.files?.[0];
													if (file) {
														form.setValue("apcDocument", file);
													}
												}}
												className="hidden"
												id="apc-upload-edit"
											/>
											<label
												htmlFor="apc-upload-edit"
												className="cursor-pointer flex flex-col items-center gap-2"
											>
												{selectedFile ? (
													<>
														<CheckCircle2 className="h-8 w-8 text-green-600" />
														<p className="text-sm font-medium">
															{selectedFile.name}
														</p>
														<p className="text-xs text-muted-foreground">
															New file selected. Click "Save" to upload.
														</p>
													</>
												) : (
													<>
														<Upload className="h-8 w-8 text-muted-foreground" />
														<p className="text-sm font-medium">
															Click to select a new document
														</p>
														<p className="text-xs text-muted-foreground">
															PDF only (Max 1MB)
														</p>
													</>
												)}
											</label>
										</div>
									</FormControl>
									<FormDescription>
										Leave empty if you don’t want to change the current
										document.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex gap-2 pt-2">
							<button
								type="button"
								onClick={() => setIsEditing(false)}
								disabled={updateMutation.isPending}
								className="flex-1 h-9 px-4 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={updateMutation.isPending}
								className="flex-1 h-9 px-4 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
							>
								{updateMutation.isPending ? (
									<>
										<Loader2 className="w-3.5 h-3.5 animate-spin" />
										Saving...
									</>
								) : (
									"Save"
								)}
							</button>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}
