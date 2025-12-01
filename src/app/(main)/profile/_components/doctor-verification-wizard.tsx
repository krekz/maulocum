"use client";

import { CheckCircle, Phone, UserCheck } from "lucide-react";
import { useState } from "react";
import { DoctorDetailsForm } from "./doctor-create-verification-form";
import { PhoneVerificationStep } from "./phone-verification-step";

interface DoctorVerificationWizardProps {
	userId: string;
	phoneNumber?: string | null;
	phoneNumberVerified?: boolean;
}

export function DoctorVerificationWizard({
	userId,
	phoneNumber,
	phoneNumberVerified,
}: DoctorVerificationWizardProps) {
	const initialStep = phoneNumberVerified ? "details" : "phone";
	const [step, setStep] = useState<"phone" | "details">(initialStep);
	const [verifiedPhone, setVerifiedPhone] = useState(phoneNumber || "");

	const handlePhoneVerified = (phoneNumber: string) => {
		setVerifiedPhone(phoneNumber);
		setStep("details");
	};

	return (
		<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
			{/* Header */}
			<div className="px-4 py-3 border-b border-slate-100">
				<h3 className="font-semibold text-slate-900 text-sm">
					Doctor Verification
				</h3>
				<p className="text-xs text-muted-foreground mt-0.5">
					{step === "phone"
						? "Verify your phone number to proceed"
						: "Provide your professional information"}
				</p>
			</div>

			{/* Progress Steps */}
			<div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
				<div className="flex items-center gap-3">
					{/* Step 1 */}
					<div className="flex items-center gap-2">
						<div
							className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
								step === "details"
									? "bg-emerald-100 text-emerald-700"
									: "bg-primary text-primary-foreground"
							}`}
						>
							{step === "details" ? (
								<CheckCircle className="w-3.5 h-3.5" />
							) : (
								<Phone className="w-3 h-3" />
							)}
						</div>
						<span
							className={`text-xs font-medium ${
								step === "phone" ? "text-slate-900" : "text-emerald-700"
							}`}
						>
							Phone
						</span>
					</div>

					{/* Connector */}
					<div
						className={`flex-1 h-0.5 ${
							step === "details" ? "bg-emerald-200" : "bg-slate-200"
						}`}
					/>

					{/* Step 2 */}
					<div className="flex items-center gap-2">
						<div
							className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
								step === "details"
									? "bg-primary text-primary-foreground"
									: "bg-slate-200 text-slate-500"
							}`}
						>
							<UserCheck className="w-3 h-3" />
						</div>
						<span
							className={`text-xs font-medium ${
								step === "details" ? "text-slate-900" : "text-slate-500"
							}`}
						>
							Details
						</span>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-4">
				{step === "phone" ? (
					<PhoneVerificationStep onVerified={handlePhoneVerified} />
				) : (
					<DoctorDetailsForm userId={userId} phoneNumber={verifiedPhone} />
				)}
			</div>
		</div>
	);
}
