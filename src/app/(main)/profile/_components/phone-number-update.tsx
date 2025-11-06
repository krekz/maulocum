"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Phone, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const phoneSchema = z.object({
	phoneNumber: z
		.string()
		.min(10, "Valid phone number is required")
		.regex(/^01\d{8,9}$/, "Invalid phone number format"),
});

const otpSchema = z.object({
	code: z
		.string()
		.min(6, "Verification code must be 6 digits")
		.max(6, "Verification code must be 6 digits")
		.regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

interface PhoneNumberUpdateProps {
	currentPhoneNumber?: string | null;
	phoneNumberVerified?: boolean;
	userEmail: string;
}

export function PhoneNumberUpdate({
	currentPhoneNumber,
	phoneNumberVerified,
	userEmail,
}: PhoneNumberUpdateProps) {
	const [step, setStep] = useState<"input" | "verify-email" | "verify-phone">(
		"input",
	);
	const [newPhoneNumber, setNewPhoneNumber] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const phoneForm = useForm<z.infer<typeof phoneSchema>>({
		resolver: zodResolver(phoneSchema),
		defaultValues: {
			phoneNumber: "",
		},
	});

	const emailOtpForm = useForm<z.infer<typeof otpSchema>>({
		resolver: zodResolver(otpSchema),
		mode: "onChange",
		defaultValues: {
			code: "",
		},
	});

	const phoneOtpForm = useForm<z.infer<typeof otpSchema>>({
		resolver: zodResolver(otpSchema),
		mode: "onChange",
		defaultValues: {
			code: "",
		},
	});

	const sendEmailOTP = async () => {
		setIsLoading(true);
		try {
			const result = await authClient.emailOtp.sendVerificationOtp({
				email: userEmail,
				type: "email-verification",
			});

			if (result.error) {
				throw new Error(
					result.error.message || "Failed to send email verification code",
				);
			}

			toast.success("Verification code sent to your email!");
			setStep("verify-email");
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

	const verifyEmailOTP = async (data: z.infer<typeof otpSchema>) => {
		setIsLoading(true);
		try {
			const result = await authClient.emailOtp.verifyEmail({
				email: userEmail,
				otp: data.code,
			});

			if (result.error) {
				throw new Error(result.error.message || "Invalid verification code");
			}

			toast.success("Email verified! Now verify your new phone number.");
			// Send OTP to new phone number
			await sendPhoneOTP(newPhoneNumber);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Invalid verification code";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const sendPhoneOTP = async (phoneNumber: string) => {
		setIsLoading(true);
		try {
			const result = await authClient.phoneNumber.sendOtp({
				phoneNumber: phoneNumber,
			});

			if (result.error) {
				throw new Error(result.error.message || "Failed to send OTP");
			}

			toast.success("Verification code sent to your phone!");
			setStep("verify-phone");
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
		// Check if the new number is the same as current
		if (data.phoneNumber === currentPhoneNumber) {
			toast.error("This is already your current phone number");
			return;
		}
		setNewPhoneNumber(data.phoneNumber);
		// First verify email
		await sendEmailOTP();
	};

	const onPhoneOTPSubmit = async (data: z.infer<typeof otpSchema>) => {
		setIsLoading(true);
		try {
			const result = await authClient.phoneNumber.verify({
				phoneNumber: newPhoneNumber,
				code: data.code,
				updatePhoneNumber: true, // This updates the phone number in the session
			});

			if (result.error) {
				throw new Error(result.error.message || "Invalid verification code");
			}

			toast.success("Phone number updated successfully!");
			// Refresh the page to show updated phone number
			window.location.reload();
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Invalid verification code";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setStep("input");
		setNewPhoneNumber("");
		phoneForm.reset();
		emailOtpForm.reset();
		phoneOtpForm.reset();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold mb-2">Phone Number</h3>
					<p className="text-sm text-muted-foreground">
						Update your phone number for account security
					</p>
				</div>
				{currentPhoneNumber && (
					<Badge
						variant={phoneNumberVerified ? "default" : "secondary"}
						className="flex items-center gap-1"
					>
						{phoneNumberVerified ? (
							<>
								<ShieldCheck className="h-3 w-3" />
								Verified
							</>
						) : (
							"Not Verified"
						)}
					</Badge>
				)}
			</div>

			{currentPhoneNumber && (
				<div className="flex items-center gap-2 text-sm">
					<Phone className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium">Current: {currentPhoneNumber}</span>
				</div>
			)}

			{step === "input" && (
				<form
					onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="phone-number">
							{currentPhoneNumber ? "New Phone Number" : "Phone Number"}
						</Label>
						<Controller
							control={phoneForm.control}
							name="phoneNumber"
							render={({ field, fieldState }) => (
								<div className="space-y-2">
									<Input
										id="phone-number"
										placeholder="0123456789"
										type="tel"
										disabled={isLoading}
										{...field}
									/>
									{fieldState.error && (
										<p className="text-sm text-destructive">
											{fieldState.error.message}
										</p>
									)}
								</div>
							)}
						/>
						<p className="text-xs text-muted-foreground">
							Enter your Malaysian phone number (must start with 01)
						</p>
					</div>

					<div className="flex justify-end">
						<Button type="submit" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Verifying Email...
								</>
							) : (
								"Continue"
							)}
						</Button>
					</div>
				</form>
			)}

			{step === "verify-email" && (
				<div className="space-y-4">
					<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
						<p className="text-sm text-blue-900 dark:text-blue-100">
							For security, we've sent a 6-digit code to{" "}
							<strong>{userEmail}</strong>
						</p>
					</div>

					<form
						onSubmit={emailOtpForm.handleSubmit(verifyEmailOTP)}
						className="space-y-4"
					>
						<div className="space-y-2">
							<Label htmlFor="email-otp-code">Email Verification Code</Label>
							<Controller
								control={emailOtpForm.control}
								name="code"
								render={({ field, fieldState }) => (
									<div className="space-y-2">
										<Input
											id="email-otp-code"
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
										{fieldState.error && (
											<p className="text-sm text-destructive">
												{fieldState.error.message}
											</p>
										)}
									</div>
								)}
							/>
							<p className="text-xs text-muted-foreground text-center">
								Enter the 6-digit code sent to your email
							</p>
						</div>

						<div className="flex gap-2 justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Verifying Email...
									</>
								) : (
									"Verify Email"
								)}
							</Button>
						</div>
					</form>
				</div>
			)}

			{step === "verify-phone" && (
				<div className="space-y-4">
					<div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
						<p className="text-sm text-green-900 dark:text-green-100">
							✓ Email verified! Now verify your new phone number.
						</p>
					</div>

					<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
						<p className="text-sm text-blue-900 dark:text-blue-100">
							We've sent a 6-digit code to <strong>{newPhoneNumber}</strong>
						</p>
					</div>

					<form
						onSubmit={phoneOtpForm.handleSubmit(onPhoneOTPSubmit)}
						className="space-y-4"
					>
						<div className="space-y-2">
							<Label htmlFor="phone-otp-code">Phone Verification Code</Label>
							<Controller
								control={phoneOtpForm.control}
								name="code"
								render={({ field, fieldState }) => (
									<div className="space-y-2">
										<Input
											id="phone-otp-code"
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
										{fieldState.error && (
											<p className="text-sm text-destructive">
												{fieldState.error.message}
											</p>
										)}
									</div>
								)}
							/>
							<p className="text-xs text-muted-foreground text-center">
								Enter the 6-digit code sent to your phone
							</p>
						</div>

						<div className="flex gap-2 justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Updating...
									</>
								) : (
									"Update Phone Number"
								)}
							</Button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}
