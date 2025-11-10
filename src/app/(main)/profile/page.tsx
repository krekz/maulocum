import { hc } from "hono/client";
import { AlertCircle, Check, Clock, XCircle } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { APIType } from "@/app/api/[...route]/route";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { DoctorVerificationWizard } from "./_components/doctor-verification-wizard";
import { VerificationDisplayWrapper } from "./_components/verification-display-wrapper";

export default async function ProfilePage() {
	const client = hc<APIType>(process.env.BETTER_AUTH_URL as string);

	// Get session using Better Auth
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

	const data = await res.json();

	const user = data.data;

	const needsVerification = user?.role === "USER" && !user?.doctorProfile;
	const verificationPending =
		user?.doctorProfile?.verificationStatus === "PENDING";
	const verificationRejected =
		user?.doctorProfile?.verificationStatus === "REJECTED";
	const isVerified = user?.role === "DOCTOR";

	return (
		<div className="sm:container px-4 mx-auto py-4 sm:py-6 lg:py-8">
			{/* Mobile navigation */}
			<div className="md:hidden mb-6 flex items-center justify-between">
				<h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
				<div className="md:hidden">
					<ProfileSidebar />
				</div>
			</div>

			<div className="flex flex-col md:flex-row gap-6 lg:gap-8">
				{/* Sidebar */}
				<div className="hidden md:block w-64 shrink-0">
					<div className="sticky top-20">
						<ProfileSidebar />
					</div>
				</div>

				{/* Main content */}
				<div className="flex-1 space-y-6 lg:space-y-8">
					<div className="hidden md:flex items-center justify-between">
						<h1 className="text-3xl font-bold">My Profile</h1>
					</div>

					{/* Show verification prompt for normal users */}
					{needsVerification && (
						<Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 p-6">
							<div className="flex items-start gap-4">
								<AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
								<div>
									<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
										Complete Your Profile to Access Jobs
									</h3>
									<p className="text-sm text-blue-700 dark:text-blue-300">
										As a doctor, you need to verify your credentials to browse
										and apply for locum jobs. Please complete the form below.
									</p>
								</div>
							</div>
						</Card>
					)}

					{/* Show pending status */}
					{verificationPending && (
						<Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 p-6">
							<div className="flex items-start gap-4">
								<Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-1" />
								<div>
									<h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
										Verification Pending
									</h3>
									<p className="text-sm text-yellow-700 dark:text-yellow-300">
										Your doctor verification is being reviewed. You'll be
										notified once it's approved.
									</p>
								</div>
							</div>
						</Card>
					)}

					{/* Show rejection status */}
					{verificationRejected && (
						<Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 p-6">
							<div className="flex items-start gap-4">
								<XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mt-1" />
								<div>
									<h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
										Verification Rejected
									</h3>
									<p className="text-sm text-red-700 dark:text-red-300 mb-2">
										{user.doctorProfile?.rejectionReason ||
											"Your verification was rejected. Please contact support."}
									</p>
								</div>
							</div>
						</Card>
					)}

					{/* Show verification form for normal users */}
					{needsVerification && (
						<DoctorVerificationWizard
							userId={user.id}
							phoneNumber={user.phoneNumber}
							phoneNumberVerified={user.phoneNumberVerified}
						/>
					)}

					{/* Profile header card - Only show if verified or has verification */}
					{(isVerified || user?.doctorProfile) && (
						<>
							<Card className="overflow-hidden">
								<div className="p-4 sm:p-6 pt-0 relative">
									<Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background absolute ">
										<AvatarImage
											src={user?.image || "/placeholder-avatar.jpg"}
											alt={user.name}
										/>
										<AvatarFallback>
											{user.name?.charAt(0).toUpperCase() || "U"}
										</AvatarFallback>
									</Avatar>

									<div className="ml-24 sm:ml-28 pt-1 sm:pt-2 flex flex-col justify-between gap-3 sm:gap-4">
										<div>
											<h2 className="text-xl sm:text-2xl font-semibold">
												{user.doctorProfile?.fullName || user.name}
											</h2>
											<p className="text-sm sm:text-base text-muted-foreground">
												{user.doctorProfile?.specialty || "Doctor"}
											</p>
											<p className="text-sm italic sm:text-base text-muted-foreground">
												{user.email}
											</p>
										</div>

										<div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
											{isVerified && (
												<Badge
													variant="outline"
													className="flex items-center gap-1 px-2 py-1 text-xs sm:text-sm border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
												>
													<Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
													<span>Verified Doctor</span>
												</Badge>
											)}
										</div>
									</div>
								</div>
							</Card>

							{/* Professional Information with Edit Toggle */}
							{user.doctorProfile && (
								<VerificationDisplayWrapper
									verification={user.doctorProfile}
									userEmail={user.email}
								/>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
