"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
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
		<Card className="p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-bold">Complete Your Doctor Profile</h2>
				<p className="text-muted-foreground mt-2">
					{step === "phone"
						? "First, verify your phone number to proceed"
						: "Please provide your professional information"}
				</p>
			</div>

			{step === "phone" ? (
				<PhoneVerificationStep onVerified={handlePhoneVerified} />
			) : (
				<DoctorDetailsForm userId={userId} phoneNumber={verifiedPhone} />
			)}
		</Card>
	);
}
