"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ExternalLink, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
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
import { client } from "@/lib/rpc";
import {
	type DoctorVerificationEditData,
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
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const { setIsEditing } = useEditVerificationStore();
	const router = useRouter();

	const form = useForm<DoctorVerificationEditData>({
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

	async function onSubmit(data: DoctorVerificationEditData) {
		setIsSubmitting(true);

		try {
			if (selectedFile) {
				toast.loading("Uploading document...");

				const uploadResponse = await client.api.v2.profile.verification[
					":verificationId"
				]["replace-document"].$post({
					param: {
						verificationId: verification.id,
					},
					form: {
						file: new File([selectedFile], selectedFile.name, {
							type: selectedFile.type,
						}),
					},
				});

				if (!uploadResponse.ok) {
					const error = await uploadResponse.json();
					throw new Error(error.message, {
						cause: uploadResponse.status,
					});
				}
				toast.dismiss();
			}

			toast.loading("Saving changes...");

			const submitFormResponse = await client.api.v2.profile.verification[
				":verificationId"
			].$patch({
				param: {
					verificationId: verification.id,
				},
				json: {
					...data,
				},
			});

			if (!submitFormResponse.ok) {
				const error = await submitFormResponse.json();
				throw new Error(error.message, {
					cause: submitFormResponse.status,
				});
			}

			toast.dismiss();
			toast.success("Verification updated successfully!");
			setIsEditing(false);
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
		<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
			{/* Header */}
			<div className="px-4 py-3 border-b border-slate-100">
				<h3 className="font-semibold text-slate-900 text-sm">
					Edit Verification Details
				</h3>
				<p className="text-xs text-muted-foreground mt-0.5">
					Update your information while verification is pending
				</p>
			</div>

			{/* Form */}
			<div className="p-4">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{/* Full Name */}
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

							{/* Location */}
							<FormField
								control={form.control}
								name="location"
								render={({ field }) => (
									<FormItem>
										<label
											htmlFor="location"
											className="text-xs font-medium text-slate-700 mb-1.5 block"
										>
											Location <span className="text-red-500">*</span>
										</label>
										<FormControl>
											<Input
												id="location"
												placeholder="Kuala Lumpur, Malaysia"
												className="h-9 text-sm"
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							{/* Specialty */}
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

							{/* Years of Experience */}
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
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							{/* Provisional ID */}
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

							{/* Full ID */}
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

							{/* APC Number */}
							<FormField
								control={form.control}
								name="apcNumber"
								render={({ field }) => (
									<FormItem className="sm:col-span-2">
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
						</div>

						{/* APC Document Upload */}
						<div>
							<span className="text-xs font-medium text-slate-700 mb-1.5 block">
								APC Document
							</span>
							<div className="border border-dashed border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors bg-slate-50">
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
											<div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
												<CheckCircle2 className="w-5 h-5 text-emerald-600" />
											</div>
											<p className="text-sm font-medium text-slate-900">
												{selectedFile.name}
											</p>
											<p className="text-[10px] text-slate-500">
												New file selected. Click &quot;Save&quot; to upload.
											</p>
										</>
									) : (
										<>
											<div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
												<Upload className="w-5 h-5 text-slate-600" />
											</div>
											<p className="text-sm font-medium text-slate-700">
												Replace document
											</p>
											<p className="text-[10px] text-slate-500">
												Click to select new PDF (Max 1MB)
											</p>
											<a
												href={verification.apcDocumentUrl}
												target="_blank"
												rel="noopener noreferrer"
												onClick={(e) => e.stopPropagation()}
												className="mt-1 text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
											>
												View Current
												<ExternalLink className="w-3 h-3" />
											</a>
										</>
									)}
								</label>
							</div>
						</div>

						{/* Actions */}
						<div className="flex gap-2 pt-2">
							<button
								type="button"
								onClick={() => setIsEditing(false)}
								disabled={isSubmitting}
								className="flex-1 h-9 px-4 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
							>
								<X className="w-3.5 h-3.5" />
								Cancel
							</button>
							<button
								type="submit"
								disabled={isSubmitting}
								className="flex-1 h-9 px-4 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
							>
								{isSubmitting ? (
									<>
										<Loader2 className="w-3.5 h-3.5 animate-spin" />
										Saving...
									</>
								) : (
									"Save Changes"
								)}
							</button>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}
