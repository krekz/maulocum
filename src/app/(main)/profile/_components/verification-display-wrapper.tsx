"use client";

import {
	Award,
	Briefcase,
	ExternalLink,
	FileText,
	Mail,
	MapPin,
	Pencil,
	Phone,
	User,
} from "lucide-react";
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
		allowAppeal: boolean;
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

	const canEdit =
		(verification.verificationStatus === "REJECTED" &&
			verification.allowAppeal) ||
		verification.verificationStatus === "PENDING";

	const InfoItem = ({
		icon: Icon,
		label,
		value,
	}: {
		icon: React.ElementType;
		label: string;
		value: string | number;
	}) => (
		<div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
			<div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
				<Icon className="w-4 h-4 text-slate-600" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-[10px] text-slate-500 uppercase tracking-wide">
					{label}
				</p>
				<p className="text-sm font-medium text-slate-900 truncate">{value}</p>
			</div>
		</div>
	);

	return (
		<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
			{/* Header */}
			<div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
				<h3 className="font-semibold text-slate-900 text-sm">
					Professional Information
				</h3>
				{canEdit && (
					<button
						type="button"
						onClick={() => setIsEditing(true)}
						className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
					>
						<Pencil className="w-3 h-3" />
						Edit
					</button>
				)}
			</div>

			{/* Content */}
			<div className="p-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<InfoItem
						icon={User}
						label="Full Name"
						value={verification.fullName}
					/>
					<InfoItem icon={Mail} label="Email" value={userEmail} />
					<InfoItem
						icon={Phone}
						label="Phone"
						value={verification.phoneNumber}
					/>
					<InfoItem
						icon={MapPin}
						label="Location"
						value={verification.location}
					/>

					{verification.specialty && (
						<InfoItem
							icon={Briefcase}
							label="Specialty"
							value={verification.specialty}
						/>
					)}

					<InfoItem
						icon={Award}
						label="Experience"
						value={`${verification.yearsOfExperience} years`}
					/>

					{verification.provisionalId && (
						<InfoItem
							icon={FileText}
							label="Provisional ID"
							value={verification.provisionalId}
						/>
					)}

					{verification.fullId && (
						<InfoItem
							icon={FileText}
							label="Full Registration ID"
							value={verification.fullId}
						/>
					)}

					<InfoItem
						icon={FileText}
						label="APC Number"
						value={verification.apcNumber}
					/>

					{/* APC Document Link */}
					<div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
						<div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
							<FileText className="w-4 h-4 text-slate-600" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-[10px] text-slate-500 uppercase tracking-wide">
								APC Document
							</p>
							<a
								href={verification.apcDocumentUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
							>
								View Document
								<ExternalLink className="w-3 h-3" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
