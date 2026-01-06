import { hc } from "hono/client";
import {
	AlertCircle,
	Briefcase,
	Clock,
	Mail,
	MapPin,
	ShieldCheck,
	Stethoscope,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { APIType } from "@/app/api/[...route]/route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth";
import { DoctorVerificationWizard } from "./_components/doctor-verification-wizard";
import { RejectionAlert } from "./_components/rejection-alert";
import { VerificationDisplayWrapper } from "./_components/verification-display-wrapper";

export default async function ProfilePage() {
	const client = hc<APIType>(process.env.BETTER_AUTH_URL as string);

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	const res = await client.api.v2.profile.user[":userId"].$get({
		param: {
			userId: session.user.id,
		},
	});

	if (!res.ok) {
		switch (res.status) {
			case 401:
			case 403:
			case 404:
				return notFound();
			default:
				return (
					<div className="min-h-[50vh] flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 px-6 py-10 text-center">
						<p className="text-sm text-muted-foreground">
							Something went wrong. Please try again later.
						</p>
					</div>
				);
		}
	}

	const data = await res.json();
	const user = data.data;

	if (!user) {
		throw new Error("User not found");
	}

	const needsVerification =
		(user?.roles?.includes("USER") || user?.roles?.includes("EMPLOYER")) &&
		!user?.doctorProfile;
	const verification = user?.doctorProfile?.doctorVerification;
	const verificationPending = verification?.verificationStatus === "PENDING";
	const verificationRejected = verification?.verificationStatus === "REJECTED";
	const isVerified = user?.roles?.includes("DOCTOR");

	return (
		<div className="space-y-4">
			{/* Status Alerts */}
			{needsVerification && (
				<div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
					<div className="flex items-start gap-3">
						<div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
							<AlertCircle className="w-4 h-4 text-blue-600" />
						</div>
						<div>
							<h3 className="font-medium text-blue-900 text-sm">
								Complete Your Profile
							</h3>
							<p className="text-xs text-blue-700 mt-0.5">
								Verify your credentials to browse and apply for locum jobs.
							</p>
						</div>
					</div>
				</div>
			)}

			{verificationPending && (
				<div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
					<div className="flex items-start gap-3">
						<div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
							<Clock className="w-4 h-4 text-amber-600" />
						</div>
						<div>
							<h3 className="font-medium text-amber-900 text-sm">
								Verification Pending
							</h3>
							<p className="text-xs text-amber-700 mt-0.5">
								Your verification is being reviewed. You&apos;ll be notified
								once approved.
							</p>
						</div>
					</div>
				</div>
			)}

			{verificationRejected && verification && (
				<RejectionAlert
					rejectionReason={verification.rejectionReason}
					allowAppeal={verification.allowAppeal}
				/>
			)}
			{/* Employer Account Badge */}
			{session.user.isEmployer && (
				<Link
					href="/employer/profile"
					// className="w-full text-left p-4 bg-emerald-50 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors"
				>
					<div className="flex p-4 items-start gap-3 bg-emerald-50 rounded-xl border border-emerald-100">
						<div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
							<Briefcase className="w-4 h-4 text-emerald-700" />
						</div>
						<div>
							<h3 className="font-medium text-emerald-900 text-sm">
								Employer Account Active
							</h3>
							<p className="text-xs text-emerald-800 mt-0.5">
								Manage your facility details and job postings in your employer
								dashboard.
							</p>
							<p className="text-xs text-emerald-800 mt-0.5">
								Click here to navigate
							</p>
						</div>
					</div>
				</Link>
			)}

			<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
				{/* Header */}
				<div className="px-4 py-3 border-b border-slate-100">
					<h3 className="font-semibold text-slate-900 text-sm">My Profile</h3>
				</div>

				{/* Profile Info */}
				<div className="p-4">
					<div className="flex items-start gap-4">
						{/* Avatar */}
						<Avatar className="h-16 w-16 border-2 border-slate-100 shadow-sm shrink-0">
							<AvatarImage
								src={user?.image || "/placeholder-avatar.jpg"}
								alt={user.name}
							/>
							<AvatarFallback className="bg-slate-100 text-slate-600 text-lg font-medium">
								{user.name?.charAt(0).toUpperCase() || "U"}
							</AvatarFallback>
						</Avatar>

						{/* Info */}
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 mb-1">
								<h2 className="font-semibold text-slate-900 text-base truncate">
									{verification?.fullName || user.name}
								</h2>
								{isVerified && (
									<span className="shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
										<ShieldCheck className="w-3 h-3" />
										Verified
									</span>
								)}
							</div>

							{/* Meta Info */}
							<div className="space-y-1">
								{verification?.specialty && (
									<div className="flex items-center gap-1.5 text-xs text-slate-500">
										<Stethoscope className="w-3 h-3" />
										<span>{verification.specialty}</span>
									</div>
								)}
								<div className="flex items-center gap-1.5 text-xs text-slate-500">
									<Mail className="w-3 h-3" />
									<span className="truncate">{user.email}</span>
								</div>
								{verification?.location && (
									<div className="flex items-center gap-1.5 text-xs text-slate-500">
										<MapPin className="w-3 h-3" />
										<span>{verification.location}</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Verification Wizard for new users */}
			{needsVerification && (
				<DoctorVerificationWizard
					userId={user.id}
					phoneNumber={user.phoneNumber}
					phoneNumberVerified={user.phoneNumberVerified}
				/>
			)}

			{/* Profile Card - Only show if verified or has verification */}

			{/* Professional Information */}
			{verification && (
				<VerificationDisplayWrapper
					verification={verification}
					userEmail={user.email}
					phoneNumber={user.phoneNumber as string}
				/>
			)}
		</div>
	);
}
