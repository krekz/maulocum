"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Phone, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
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
import { authClient } from "@/lib/auth-client";

const phoneSchema = z.object({
	phoneNumber: z
		.string()
		.min(10, "Valid phone number is required")
		.regex(/^0[1-9]\d{8,9}$/, "Phone number must start with 0 followed by 1-9")
		.refine((val) => !val.startsWith("06"), {
			message: "This format number is not allowed",
		}),
});

const otpSchema = z.object({
	code: z
		.string()
		.min(6, "Verification code must be 6 digits")
		.max(6, "Verification code must be 6 digits")
		.regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

interface PhoneVerificationStepProps {
	onVerified: (phoneNumber: string) => void;
}

export function PhoneVerificationStep({
	onVerified,
}: PhoneVerificationStepProps) {
	const [step, setStep] = useState<"phone" | "otp">("phone");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [pendingPhoneNumber, setPendingPhoneNumber] = useState("");

	const phoneForm = useForm<z.infer<typeof phoneSchema>>({
		resolver: zodResolver(phoneSchema),
		defaultValues: {
			phoneNumber: "",
		},
	});

	const otpForm = useForm<z.infer<typeof otpSchema>>({
		resolver: zodResolver(otpSchema),
		mode: "onChange",
		defaultValues: {
			code: "",
		},
	});

	const sendOTP = async (phone: string) => {
		setIsLoading(true);
		try {
			// Use Better Auth phone number OTP
			const result = await authClient.phoneNumber.sendOtp({
				phoneNumber: phone,
			});

			if (result.error) {
				throw new Error(result.error.message || "Failed to send OTP");
			}

			toast.success("Verification code sent to your phone!");
			setPhoneNumber(phone);
			setStep("otp");
			// startResendTimer();
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to send verification code";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const onPhoneSubmit = async (data: z.infer<typeof phoneSchema>) => {
		setPendingPhoneNumber(data.phoneNumber);
		setShowConfirmDialog(true);
	};

	const handleConfirmSendOTP = async () => {
		setShowConfirmDialog(false);
		await sendOTP(pendingPhoneNumber);
	};

	const onOTPSubmit = async (data: z.infer<typeof otpSchema>) => {
		setIsLoading(true);
		try {
			// Use Better Auth phone number verification
			const result = await authClient.phoneNumber.verify({
				phoneNumber: phoneNumber,
				code: data.code,
				disableSession: true, // Don't create session yet, just verify
				updatePhoneNumber: true,
			});

			if (result.error) {
				throw new Error(result.error.message || "Invalid verification code");
			}

			toast.success("Phone number verified successfully!");
			onVerified(phoneNumber);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Invalid verification code";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	if (step === "otp") {
		return (
			<div className="space-y-6">
				<div className="text-center space-y-2">
					<div className="flex justify-center">
						<div className="rounded-full bg-primary/10 p-3">
							<ShieldCheck className="h-8 w-8 text-primary" />
						</div>
					</div>
					<h3 className="text-xl font-semibold">Verify Your Phone Number</h3>
					<p className="text-sm text-muted-foreground">
						We've sent a 6-digit code to <strong>{phoneNumber}</strong>
					</p>
				</div>

				<Form {...otpForm}>
					<form
						onSubmit={otpForm.handleSubmit(onOTPSubmit)}
						className="space-y-6"
					>
						<Controller
							control={otpForm.control}
							name="code"
							render={({ field, fieldState }) => (
								<div className="space-y-2">
									<label
										htmlFor="otp-code"
										className="text-sm font-medium leading-none"
									>
										Verification Code
									</label>
									<Input
										id="otp-code"
										placeholder="123456"
										maxLength={6}
										type="text"
										inputMode="numeric"
										autoComplete="one-time-code"
										className="text-center text-2xl font-semibold tracking-widest"
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										name={field.name}
									/>
									<p className="text-sm text-muted-foreground text-center">
										Enter the 6-digit code sent to your phone
									</p>
									{fieldState.error && (
										<p className="text-sm font-medium text-destructive">
											{fieldState.error.message}
										</p>
									)}
								</div>
							)}
						/>

						<div className="space-y-3">
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Verifying...
									</>
								) : (
									"Verify Code"
								)}
							</Button>

							<div className="text-center space-y-2">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => setStep("phone")}
									disabled={isLoading}
								>
									Change phone number
								</Button>
							</div>
						</div>
					</form>
				</Form>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="text-center space-y-2">
				<div className="flex justify-center">
					<div className="rounded-full bg-primary/10 p-3">
						<Phone className="h-8 w-8 text-primary" />
					</div>
				</div>
				<h3 className="text-xl font-semibold">Verify Your Phone Number</h3>
				<p className="text-sm text-muted-foreground">
					To prevent spam and ensure security, please verify your phone number
					before proceeding.
				</p>
			</div>

			<Form {...phoneForm}>
				<form
					onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
					className="space-y-6"
				>
					<FormField
						control={phoneForm.control}
						name="phoneNumber"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Phone Number</FormLabel>
								<FormControl>
									<Input
										placeholder="0123456789"
										{...field}
										disabled={isLoading}
									/>
								</FormControl>
								<FormDescription>
									We'll send a verification code to this number
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Sending code...
							</>
						) : (
							"Send Verification Code"
						)}
					</Button>
				</form>
			</Form>

			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Phone Number</AlertDialogTitle>
						<AlertDialogDescription className="space-y-2">
							<p>OTP notification will be sent to WhatsApp via:</p>
							<p className="text-lg font-semibold text-foreground">
								+6{pendingPhoneNumber}
							</p>
							<p className="text-sm">
								Please make sure this number is correct before proceeding.
							</p>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmSendOTP}>
							Send OTP
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
