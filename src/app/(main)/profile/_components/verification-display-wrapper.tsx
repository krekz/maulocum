"use client";

import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEditVerificationStore } from "@/lib/store/useEditVerificationStore";
import { EditVerificationForm } from "./doctor-edit-verification-form";

interface VerificationDisplayWrapperProps {
	verification: {
		id: string;
		fullName: string;
		phoneNumber: string;
		location: string;
		specialty?: string | null;
		yearsOfExperience: number;
		provisionalId?: string | null;
		fullId?: string | null;
		apcNumber: string;
		apcDocumentUrl: string;
		verificationStatus: string;
	};
	userEmail: string;
}

export function VerificationDisplayWrapper({
	verification,
	userEmail,
}: VerificationDisplayWrapperProps) {
	const { isEditing, setIsEditing } = useEditVerificationStore();

	if (isEditing) {
		return <EditVerificationForm verification={verification} />;
	}

	// Only allow editing if status is REJECTED or not yet submitted
	const canEdit =
		verification.verificationStatus === "REJECTED" ||
		verification.verificationStatus === "PENDING";

	return (
		<Card className="p-4 sm:p-6">
			<div className="flex items-center justify-between mb-3 sm:mb-4">
				<h3 className="text-lg sm:text-xl font-semibold">
					Professional Information
				</h3>
				{canEdit && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsEditing(true)}
					>
						<Edit className="h-4 w-4 mr-2" />
						Edit
					</Button>
				)}
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
				<div>
					<p className="text-xs sm:text-sm text-muted-foreground mb-1">
						Full Name
					</p>
					<p className="font-medium text-sm sm:text-base">
						{verification.fullName}
					</p>
				</div>
				<div>
					<p className="text-xs sm:text-sm text-muted-foreground mb-1">Email</p>
					<p className="font-medium text-sm sm:text-base break-all">
						{userEmail}
					</p>
				</div>
				<div>
					<p className="text-xs sm:text-sm text-muted-foreground mb-1">Phone</p>
					<p className="font-medium text-sm sm:text-base">
						{verification.phoneNumber}
					</p>
				</div>
				<div>
					<p className="text-xs sm:text-sm text-muted-foreground mb-1">
						Location
					</p>
					<p className="font-medium text-sm sm:text-base">
						{verification.location}
					</p>
				</div>
				{verification.specialty && (
					<div>
						<p className="text-xs sm:text-sm text-muted-foreground mb-1">
							Specialty
						</p>
						<p className="font-medium text-sm sm:text-base">
							{verification.specialty}
						</p>
					</div>
				)}
				<div>
					<p className="text-xs sm:text-sm text-muted-foreground mb-1">
						Years of Experience
					</p>
					<p className="font-medium text-sm sm:text-base">
						{verification.yearsOfExperience} years
					</p>
				</div>
				{verification.provisionalId && (
					<div>
						<p className="text-xs sm:text-sm text-muted-foreground mb-1">
							Provisional Registration ID
						</p>
						<p className="font-medium text-sm sm:text-base">
							{verification.provisionalId}
						</p>
					</div>
				)}
				{verification.fullId && (
					<div>
						<p className="text-xs sm:text-sm text-muted-foreground mb-1">
							Full Registration ID
						</p>
						<p className="font-medium text-sm sm:text-base">
							{verification.fullId}
						</p>
					</div>
				)}
				<div>
					<p className="text-xs sm:text-sm text-muted-foreground mb-1">
						APC Number
					</p>
					<p className="font-medium text-sm sm:text-base">
						{verification.apcNumber}
					</p>
				</div>
				<div>
					<p className="text-xs sm:text-sm text-muted-foreground mb-1">
						APC Document
					</p>
					<Button
						variant="link"
						size="sm"
						className="h-auto p-0 text-xs sm:text-sm"
						asChild
					>
						<a
							href={verification.apcDocumentUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							View Document
						</a>
					</Button>
				</div>
			</div>
		</Card>
	);
}
