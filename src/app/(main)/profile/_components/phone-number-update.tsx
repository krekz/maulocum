"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2, Phone, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
		if (data.phoneNumber === currentPhoneNumber) {
			toast.error("This is already your current phone number");
			return;
		}
		setNewPhoneNumber(data.phoneNumber);
		await sendEmailOTP();
	};

	const onPhoneOTPSubmit = async (data: z.infer<typeof otpSchema>) => {
		setIsLoading(true);
		try {
			const result = await authClient.phoneNumber.verify({
				phoneNumber: newPhoneNumber,
				code: data.code,
				updatePhoneNumber: true,
			});

			if (result.error) {
				throw new Error(result.error.message || "Invalid verification code");
			}

			toast.success("Phone number updated successfully!");
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
		<div className="space-y-4">
			{/* Current Phone Number Display */}
			<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center">
						<Phone className="w-4 h-4 text-slate-600" />
					</div>
					<div>
						<p className="text-xs text-slate-500">Phone Number</p>
						<p className="text-sm font-medium text-slate-900">
							{currentPhoneNumber || "Not set"}
						</p>
					</div>
				</div>
				{currentPhoneNumber && (
					<span
						className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${
							phoneNumberVerified
								? "bg-emerald-50 text-emerald-700"
								: "bg-amber-50 text-amber-700"
						}`}
					>
						{phoneNumberVerified ? (
							<>
								<ShieldCheck className="w-3 h-3" />
								Verified
							</>
						) : (
							"Not Verified"
						)}
					</span>
				)}
			</div>

			{/* Step: Input Phone Number */}
			{step === "input" && (
				<form
					onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
					className="space-y-3"
				>
					<div>
						<label
							htmlFor="phone-number"
							className="text-xs font-medium text-slate-700 mb-1.5 block"
						>
							{currentPhoneNumber ? "New Phone Number" : "Phone Number"}
						</label>
						<Controller
							control={phoneForm.control}
							name="phoneNumber"
							render={({ field, fieldState }) => (
								<div className="space-y-1">
									<Input
										id="phone-number"
										placeholder="0123456789"
										type="tel"
										disabled={isLoading}
										className="h-9 text-sm"
										{...field}
									/>
									{fieldState.error && (
										<p className="text-xs text-destructive">
											{fieldState.error.message}
										</p>
									)}
								</div>
							)}
						/>
						<p className="text-[10px] text-slate-400 mt-1">
							Malaysian phone number starting with 01
						</p>
					</div>

					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={isLoading}
							size="sm"
							className="h-8 text-xs"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
									Sending...
								</>
							) : (
								"Update Phone"
							)}
						</Button>
					</div>
				</form>
			)}

			{/* Step: Verify Email */}
			{step === "verify-email" && (
				<div className="space-y-3">
					<div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
						<p className="text-xs text-blue-800">
							For security, we&apos;ve sent a 6-digit code to{" "}
							<span className="font-medium">{userEmail}</span>
						</p>
					</div>

					<form
						onSubmit={emailOtpForm.handleSubmit(verifyEmailOTP)}
						className="space-y-3"
					>
						<div>
							<label
								htmlFor="email-otp-code"
								className="text-xs font-medium text-slate-700 mb-1.5 block"
							>
								Email Verification Code
							</label>
							<Controller
								control={emailOtpForm.control}
								name="code"
								render={({ field, fieldState }) => (
									<div className="space-y-1">
										<Input
											id="email-otp-code"
											placeholder="123456"
											maxLength={6}
											type="text"
											inputMode="numeric"
											autoComplete="one-time-code"
											className="h-10 text-center text-lg font-semibold tracking-[0.3em]"
											value={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											name={field.name}
										/>
										{fieldState.error && (
											<p className="text-xs text-destructive text-center">
												{fieldState.error.message}
											</p>
										)}
									</div>
								)}
							/>
						</div>

						<div className="flex gap-2 justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
								disabled={isLoading}
								size="sm"
								className="h-8 text-xs"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
								size="sm"
								className="h-8 text-xs"
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
										Verifying...
									</>
								) : (
									"Verify Email"
								)}
							</Button>
						</div>
					</form>
				</div>
			)}

			{/* Step: Verify Phone */}
			{step === "verify-phone" && (
				<div className="space-y-3">
					<div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-2">
						<CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
						<p className="text-xs text-emerald-800">
							Email verified! Now verify your new phone number.
						</p>
					</div>

					<div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
						<p className="text-xs text-blue-800">
							We&apos;ve sent a 6-digit code to{" "}
							<span className="font-medium">{newPhoneNumber}</span>
						</p>
					</div>

					<form
						onSubmit={phoneOtpForm.handleSubmit(onPhoneOTPSubmit)}
						className="space-y-3"
					>
						<div>
							<label
								htmlFor="phone-otp-code"
								className="text-xs font-medium text-slate-700 mb-1.5 block"
							>
								Phone Verification Code
							</label>
							<Controller
								control={phoneOtpForm.control}
								name="code"
								render={({ field, fieldState }) => (
									<div className="space-y-1">
										<Input
											id="phone-otp-code"
											placeholder="123456"
											maxLength={6}
											type="text"
											inputMode="numeric"
											autoComplete="one-time-code"
											className="h-10 text-center text-lg font-semibold tracking-[0.3em]"
											value={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											name={field.name}
										/>
										{fieldState.error && (
											<p className="text-xs text-destructive text-center">
												{fieldState.error.message}
											</p>
										)}
									</div>
								)}
							/>
						</div>

						<div className="flex gap-2 justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={handleCancel}
								disabled={isLoading}
								size="sm"
								className="h-8 text-xs"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
								size="sm"
								className="h-8 text-xs"
							>
								{isLoading ? (
									<>
										<Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
										Updating...
									</>
								) : (
									"Update Phone"
								)}
							</Button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}
