"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle,
	Clock,
	Edit2,
	Loader2,
	Upload,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	type FacilityVerificationEditInput,
	facilityVerificationEditSchema,
} from "@/app/api/types/facilities.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { client } from "@/lib/rpc";
import type { $Enums } from "../../../../../prisma/generated/prisma/client";

interface FacilityVerification {
	id: string;
	facilityId: string;
	verificationStatus: $Enums.VerificationStatus;
	rejectionReason: string | null;
	allowAppeal: boolean;
	canEdit: boolean;
	businessDocumentUrl: string;
	licenseDocumentUrl: string | null;
	facility: {
		name: string;
		address: string;
		contactEmail: string;
		contactPhone: string;
	};
}

interface FacilityVerificationStatusProps {
	verification: FacilityVerification;
}

export function FacilityVerificationStatus({
	verification,
}: FacilityVerificationStatusProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);

	const [ssmFile, setSsmFile] = useState<File | null>(null);
	const [licenseFile, setLicenseFile] = useState<File | null>(null);

	const form = useForm<FacilityVerificationEditInput>({
		resolver: zodResolver(facilityVerificationEditSchema),
		defaultValues: {
			companyName: verification.facility.name,
			address: verification.facility.address,
			companyEmail: verification.facility.contactEmail,
			companyPhone: verification.facility.contactPhone,
		},
	});

	// Single mutation for updating verification with optional file uploads
	const updateMutation = useMutation({
		mutationFn: async (data: FacilityVerificationEditInput) => {
			const response = await client.api.v2.facilities.verification.$patch({
				form: {
					companyName: data.companyName,
					address: data.address,
					companyEmail: data.companyEmail,
					companyPhone: data.companyPhone,
					...(ssmFile && { ssmDocument: ssmFile }),
					...(licenseFile && { clinicLicense: licenseFile }),
				},
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to update verification");
			}
			return response.json();
		},
		onSuccess: () => {
			toast.success("Verification updated successfully");
			queryClient.invalidateQueries({
				queryKey: ["facility-verification-status"],
			});
			setIsEditing(false);
			setSsmFile(null);
			setLicenseFile(null);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleFileChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		type: "ssm" | "license",
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (type === "ssm") {
			setSsmFile(file);
		} else {
			setLicenseFile(file);
		}
	};

	const onSubmit = (data: FacilityVerificationEditInput) => {
		updateMutation.mutate(data);
	};

	const getStatusConfig = () => {
		switch (verification.verificationStatus) {
			case "APPROVED":
				return {
					icon: CheckCircle,
					color: "text-green-600",
					bgColor: "bg-green-100",
					badge: "bg-green-100 text-green-800",
					title: "Verification Approved",
					description:
						"Your facility has been verified. You can now post job opportunities.",
				};
			case "REJECTED":
				return {
					icon: XCircle,
					color: "text-red-600",
					bgColor: "bg-red-100",
					badge: "bg-red-100 text-red-800",
					title: "Verification Rejected",
					description: verification.allowAppeal
						? "Your verification was rejected. You can update your information and resubmit."
						: "Your verification was rejected and cannot be appealed.",
				};
			default:
				return {
					icon: Clock,
					color: "text-yellow-600",
					bgColor: "bg-yellow-100",
					badge: "bg-yellow-100 text-yellow-800",
					title: "Verification Pending",
					description:
						"Your verification is being reviewed. This usually takes 3-5 business days.",
				};
		}
	};

	const statusConfig = getStatusConfig();
	const StatusIcon = statusConfig.icon;

	// Approved state - show success and redirect option
	if (verification.verificationStatus === "APPROVED") {
		return (
			<Card className="bg-white text-center">
				<CardHeader>
					<div
						className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${statusConfig.bgColor}`}
					>
						<StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
					</div>
					<CardTitle className="text-2xl">{statusConfig.title}</CardTitle>
					<CardDescription className="text-lg">
						{statusConfig.description}
					</CardDescription>
				</CardHeader>
				<CardFooter className="justify-center">
					<Button onClick={() => router.push("/employer/dashboard")}>
						Go to Dashboard
					</Button>
				</CardFooter>
			</Card>
		);
	}

	// Editing mode
	if (isEditing && verification.canEdit) {
		return (
			<Card className="bg-white">
				<CardHeader>
					<CardTitle>Edit Facility Information</CardTitle>
					<CardDescription>
						Update your facility details and resubmit for verification
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="companyName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Company Name</FormLabel>
										<FormControl>
											<Input placeholder="ABC Medical Centre" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Facility Address</FormLabel>
										<FormControl>
											<Input
												placeholder="Complete address of your facility"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="companyEmail"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Company Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="contact@facility.com"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Official email address for your facility
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="companyPhone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Company Phone</FormLabel>
										<FormControl>
											<Input placeholder="+60 12-345 6789" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Separator className="my-4" />

							{/* Document replacement section */}
							<div className="space-y-4">
								<h4 className="font-medium">Replace Documents (Optional)</h4>

								<div className="grid gap-4 md:grid-cols-2">
									{/* SSM Document */}
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">SSM Document</span>
											{verification.businessDocumentUrl && (
												<Link
													href={verification.businessDocumentUrl}
													target="_blank"
													className="text-xs text-blue-600 hover:underline"
												>
													View current
												</Link>
											)}
										</div>
										<div className="flex items-center justify-center w-full">
											<label
												htmlFor="replace-ssm"
												className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer ${ssmFile ? "border-green-500 bg-green-50" : "bg-gray-50 hover:bg-gray-100"}`}
											>
												<div className="flex flex-col items-center justify-center py-2">
													{ssmFile ? (
														<CheckCircle className="w-6 h-6 text-green-500" />
													) : (
														<Upload className="w-6 h-6 text-gray-500" />
													)}
													<p className="text-xs text-gray-500 mt-1 text-center px-2 truncate max-w-full">
														{ssmFile ? ssmFile.name : "Click to upload new"}
													</p>
												</div>
												<input
													id="replace-ssm"
													type="file"
													className="hidden"
													accept=".pdf,.jpg,.jpeg,.png"
													onChange={(e) => handleFileChange(e, "ssm")}
													disabled={updateMutation.isPending}
												/>
											</label>
										</div>
									</div>

									{/* License Document */}
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">
												Clinic License (KPJKS)
											</span>
											{verification.licenseDocumentUrl && (
												<Link
													href={verification.licenseDocumentUrl}
													target="_blank"
													className="text-xs text-blue-600 hover:underline"
												>
													View current
												</Link>
											)}
										</div>
										<div className="flex items-center justify-center w-full">
											<label
												htmlFor="replace-license"
												className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer ${licenseFile ? "border-green-500 bg-green-50" : "bg-gray-50 hover:bg-gray-100"}`}
											>
												<div className="flex flex-col items-center justify-center py-2">
													{licenseFile ? (
														<CheckCircle className="w-6 h-6 text-green-500" />
													) : (
														<Upload className="w-6 h-6 text-gray-500" />
													)}
													<p className="text-xs text-gray-500 mt-1 text-center px-2 truncate max-w-full">
														{licenseFile
															? licenseFile.name
															: "Click to upload new"}
													</p>
												</div>
												<input
													id="replace-license"
													type="file"
													className="hidden"
													accept=".pdf,.jpg,.jpeg,.png"
													onChange={(e) => handleFileChange(e, "license")}
													disabled={updateMutation.isPending}
												/>
											</label>
										</div>
									</div>
								</div>
							</div>

							<CardFooter className="px-0 pt-6 flex gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsEditing(false)}
									disabled={updateMutation.isPending}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="flex-1"
									disabled={updateMutation.isPending}
								>
									{updateMutation.isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Updating...
										</>
									) : (
										"Update"
									)}
								</Button>
							</CardFooter>
						</form>
					</Form>
				</CardContent>
			</Card>
		);
	}

	// Status view (PENDING or REJECTED)
	return (
		<Card className="bg-white">
			<CardHeader className="text-center">
				<div
					className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${statusConfig.bgColor}`}
				>
					<StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
				</div>
				<div className="flex items-center justify-center gap-2">
					<CardTitle className="text-2xl">{statusConfig.title}</CardTitle>
					<Badge className={statusConfig.badge}>
						{verification.verificationStatus}
					</Badge>
				</div>
				<CardDescription className="text-base">
					{statusConfig.description}
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* Rejection reason alert */}
				{verification.verificationStatus === "REJECTED" &&
					verification.rejectionReason && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Rejection Reason</AlertTitle>
							<AlertDescription>
								{verification.rejectionReason}
							</AlertDescription>
						</Alert>
					)}

				{/* Facility details */}
				<div className="space-y-4">
					<h4 className="font-medium">Submitted Information</h4>
					<div className="grid gap-3 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Company Name</span>
							<span className="font-medium">{verification.facility.name}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Address</span>
							<span className="font-medium text-right max-w-[60%]">
								{verification.facility.address}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Email</span>
							<span className="font-medium">
								{verification.facility.contactEmail}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Phone</span>
							<span className="font-medium">
								{verification.facility.contactPhone}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">SSM Document</span>
							<Link
								href={verification.businessDocumentUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="font-medium text-primary underline underline-offset-4 break-all"
							>
								View SSM Document
							</Link>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Company License Document
							</span>
							{verification.licenseDocumentUrl ? (
								<Link
									href={verification.licenseDocumentUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="font-medium text-primary underline underline-offset-4 break-all"
								>
									View License Document
								</Link>
							) : (
								<span className="font-medium text-muted-foreground">
									Not uploaded
								</span>
							)}
						</div>
					</div>
				</div>
			</CardContent>

			{/* {verification.canEdit && ( */}
			{verification.canEdit && (
				<CardFooter>
					<Button
						onClick={() => setIsEditing(true)}
						className="w-full"
						variant="outline"
					>
						<Edit2 className="mr-2 h-4 w-4" />
						Edit Information
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}
