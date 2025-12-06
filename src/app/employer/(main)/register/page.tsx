"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PhoneVerificationStep } from "@/app/(main)/profile/_components/phone-verification-step";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/rpc";
import { FacilityRegistrationForm } from "./facility-registration-form";
import { FacilityVerificationStatus } from "./facility-verification-status";

export default function EmployerRegistrationPage() {
	const { data: session, isPending: isSessionPending } =
		authClient.useSession();
	const [isPhoneVerified, setIsPhoneVerified] = useState<boolean | null>(null);

	// Fetch verification status if user has a facility
	const { data: verificationData, isLoading: isVerificationLoading } = useQuery(
		{
			queryKey: ["facility-verification-status"],
			queryFn: async () => {
				const response =
					await client.api.v2.facilities["verification-status"].$get();
				if (!response.ok) {
					// 404 means no verification exists yet
					if (response.status === 404) return null;
					throw new Error("Failed to fetch verification status");
				}
				return response.json();
			},
			enabled: !!session?.user?.id,
		},
	);

	// Determine if phone is verified from session or local state
	const phoneVerified = isPhoneVerified ?? session?.user?.phoneNumberVerified;

	const isLoading = isSessionPending || isVerificationLoading;

	if (isLoading) {
		return (
			<div className="container w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
				<div className="flex items-center justify-center h-64">
					<div className="animate-pulse text-muted-foreground">Loading...</div>
				</div>
			</div>
		);
	}

	// If verification exists, show status component
	const verification = verificationData?.data;

	return (
		<div className="container w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
			<div className="mb-8 space-y-2">
				<h1 className="text-3xl font-bold">Facility Verification</h1>
				<p className="text-muted-foreground">
					Complete your facility verification to start posting job opportunities
				</p>
			</div>

			{!phoneVerified ? (
				<Card className="bg-white">
					<CardContent className="pt-6">
						<PhoneVerificationStep
							onVerified={() => setIsPhoneVerified(true)}
						/>
					</CardContent>
				</Card>
			) : verification ? (
				<FacilityVerificationStatus verification={verification} />
			) : (
				<FacilityRegistrationForm />
			)}
		</div>
	);
}
