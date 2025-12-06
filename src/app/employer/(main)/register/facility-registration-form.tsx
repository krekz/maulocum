"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import {
	type FacilityRegistrationInput,
	facilityRegistrationSchema,
} from "@/app/api/types/facilities.types";
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

export function FacilityRegistrationForm() {
	const form = useForm<FacilityRegistrationInput>({
		resolver: zodResolver(facilityRegistrationSchema),
		defaultValues: {
			companyName: "",
			address: "",
			companyEmail: "",
			companyPhone: "",
		},
	});

	// Register facility mutation with file uploads
	const mutation = useMutation({
		mutationFn: async (data: FacilityRegistrationInput) => {
			const response = await client.api.v2.facilities.$post({
				form: {
					companyName: data.companyName,
					address: data.address,
					companyEmail: data.companyEmail,
					companyPhone: data.companyPhone,
					ssmDocument: new File([data.ssmDocument], data.ssmDocument.name, {
						type: data.ssmDocument.type,
					}),
					clinicLicense: new File(
						[data.clinicLicense],
						data.clinicLicense.name,
						{
							type: data.clinicLicense.type,
						},
					),
				},
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to register facility");
			}

			return response.json();
		},
		onSuccess: () => {
			window.location.reload();
		},
	});

	async function onSubmit(values: FacilityRegistrationInput) {
		mutation.mutate(values);
	}

	return (
		<Card className="bg-white g-10">
			<CardHeader>
				<CardTitle>Facility Information</CardTitle>
				<CardDescription>
					Please provide accurate details about your healthcare facility
				</CardDescription>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{mutation.error && (
							<div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
								{mutation.error.message}
							</div>
						)}

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

						<FormField
							control={form.control}
							name="ssmDocument"
							render={({ field: { value, onChange, ...fieldProps } }) => (
								<FormItem>
									<FormLabel>SSM Registration Document</FormLabel>
									<FormControl>
										<div className="flex items-center justify-center w-full">
											<label
												htmlFor="ssmDocument"
												className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
											>
												<div className="flex flex-col items-center justify-center pt-5 pb-6">
													<Upload className="w-8 h-8 mb-2 text-gray-500" />
													<p className="mb-2 text-sm text-gray-500">
														{value?.name || "Click to upload SSM document"}
													</p>
													<p className="text-xs text-gray-500">
														PDF or Image (MAX. 5MB)
													</p>
												</div>
												<Input
													id="ssmDocument"
													type="file"
													className="hidden"
													accept=".pdf,.jpg,.jpeg,.png"
													onChange={(e) => {
														const file = e.target.files?.[0];
														if (file) onChange(file);
													}}
													{...fieldProps}
												/>
											</label>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="clinicLicense"
							render={({ field: { value, onChange, ...fieldProps } }) => (
								<FormItem>
									<FormLabel>Clinic/Hospital License (KPJKS)</FormLabel>
									<FormControl>
										<div className="flex items-center justify-center w-full">
											<label
												htmlFor="clinicLicense"
												className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
											>
												<div className="flex flex-col items-center justify-center pt-5 pb-6">
													<Upload className="w-8 h-8 mb-2 text-gray-500" />
													<p className="mb-2 text-sm text-gray-500">
														{value?.name || "Click to upload KPJKS license"}
													</p>
													<p className="text-xs text-gray-500">
														PDF or Image (MAX. 5MB)
													</p>
												</div>
												<Input
													id="clinicLicense"
													type="file"
													className="hidden"
													accept=".pdf,.jpg,.jpeg,.png"
													onChange={(e) => {
														const file = e.target.files?.[0];
														if (file) onChange(file);
													}}
													{...fieldProps}
												/>
											</label>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<CardFooter className="px-0 pt-6">
							<Button
								type="submit"
								className="w-full"
								disabled={mutation.isPending}
							>
								{mutation.isPending
									? "Submitting..."
									: "Submit for Verification"}
							</Button>
						</CardFooter>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
