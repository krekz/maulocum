"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	AlertCircle,
	Building2,
	Calendar,
	CheckCircle2,
	Clock,
	Loader2,
	MapPin,
	Timer,
	XCircle,
} from "lucide-react";
import * as motion from "motion/react-client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { client } from "@/lib/rpc";

export default function ConfirmJobPage() {
	const params = useParams();
	const router = useRouter();
	const token = params.token as string;

	// Fetch application details using the token (GET request)
	const {
		data: applicationData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["job-confirmation", token],
		queryFn: async () => {
			const response = await client.api.v2.jobs.applications.confirm[
				":token"
			].$get({
				param: { token },
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Invalid confirmation link");
			}

			return response.json();
		},
		retry: false,
	});

	// Confirm mutation
	const confirmMutation = useMutation({
		mutationFn: async () => {
			const response = await client.api.v2.jobs.applications.confirm[
				":token"
			].$post({
				param: { token },
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to confirm job");
			}

			return response.json();
		},
		onSuccess: () => {
			// Redirect to success or jobs page after confirmation
		},
	});

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3 }}
				>
					<Card className="w-full max-w-md bg-transparent border-0">
						<CardContent className="pt-6">
							<div className="flex flex-col items-center justify-center py-8">
								<Loader2 className="size-12 text-primary animate-spin mb-4" />
								<p className="text-slate-600">
									Validating confirmation link...
								</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		);
	}

	// Error state - invalid or expired token
	if (error) {
		return (
			<div className="min-h-screen bg-linear-to-b from-red-50 to-white flex items-center justify-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="w-full max-w-lg"
				>
					<Card className="w-full max-w-md border-red-200">
						<CardHeader className="text-center">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
								className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4"
							>
								<XCircle className="size-8 text-red-600" />
							</motion.div>
							<CardTitle className="text-xl text-red-600">
								Invalid or Expired Link
							</CardTitle>
							<CardDescription>
								{(error as Error).message ||
									"This confirmation link is no longer valid. It may have already been used or has expired."}
							</CardDescription>
						</CardHeader>
						<CardFooter className="flex justify-center">
							<Button variant="outline" onClick={() => router.push("/jobs")}>
								Browse Jobs
							</Button>
						</CardFooter>
					</Card>
				</motion.div>
			</div>
		);
	}

	// Success state - confirmed
	if (confirmMutation.isSuccess) {
		return (
			<div className="min-h-screen bg-linear-to-b from-emerald-50 to-white flex items-center justify-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, type: "spring" }}
				>
					<Card className="w-full max-w-md border-emerald-200 shadow-lg shadow-emerald-100">
						<CardHeader className="text-center">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
								className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4"
							>
								<CheckCircle2 className="size-10 text-emerald-600" />
							</motion.div>
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
							>
								<CardTitle className="text-2xl text-emerald-700">
									Booking Confirmed!
								</CardTitle>
								<CardDescription className="text-base mt-2">
									You have successfully confirmed your job booking. The facility
									has been notified.
								</CardDescription>
							</motion.div>
						</CardHeader>
						<CardContent>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.4 }}
								className="bg-emerald-50 rounded-lg p-4 text-center"
							>
								<p className="text-sm text-emerald-700">
									You will receive further details about the job via WhatsApp or
									email.
								</p>
							</motion.div>
						</CardContent>
						<CardFooter className="flex flex-col gap-3">
							<Button
								className="w-full bg-emerald-600 hover:bg-emerald-700"
								onClick={() => router.push("/profile/history")}
							>
								View My Bookings
							</Button>
							<Button
								variant="outline"
								className="w-full"
								onClick={() => router.push("/jobs")}
							>
								Browse More Jobs
							</Button>
						</CardFooter>
					</Card>
				</motion.div>
			</div>
		);
	}

	// Main confirmation UI
	const application = applicationData?.data;
	const remainingTime = application?.remainingTime;

	return (
		<div className="min-h-screen bg-linear-to-b from-orange-50 to-white flex items-center justify-center">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-lg"
			>
				<Card className="border-orange-200 shadow-lg shadow-orange-100/50">
					<CardHeader className="text-center pb-2">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
							className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4"
						>
							<AlertCircle className="size-8 text-orange-600" />
						</motion.div>
						<CardTitle className="text-2xl">Confirm Your Booking</CardTitle>
						<CardDescription className="text-base">
							You have been approved for this job. Please confirm to finalize
							your booking.
						</CardDescription>
						{/* Expiry Timer */}
						{remainingTime && (
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.15 }}
								className="mt-3 inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-sm text-red-700"
							>
								<Timer className="size-4 animate-pulse" />
								<span>
									Expires in{" "}
									<strong>
										{remainingTime.hours}h {remainingTime.minutes}m
									</strong>
								</span>
							</motion.div>
						)}
					</CardHeader>

					<CardContent className="space-y-4">
						{/* Job Details Card */}
						<motion.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.3 }}
							className="bg-slate-50 rounded-xl p-4 space-y-3"
						>
							<div className="flex items-start gap-3">
								<div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
									{application?.job?.facility?.name
										?.slice(0, 3)
										.toUpperCase() || "FAC"}
								</div>
								<div>
									<h3 className="font-semibold text-slate-900">
										{application?.job?.title || "Job Position"}
									</h3>
									<p className="text-sm text-slate-600 flex items-center gap-1">
										<Building2 className="size-3.5" />
										{application?.job?.facility?.name || "Healthcare Facility"}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
								<div className="flex items-center gap-2 text-sm text-slate-600 pt-2">
									<Calendar className="size-4 text-orange-500" />
									<span>
										{application?.job?.startDate
											? format(
													new Date(application.job.startDate),
													"dd MMM yyyy",
												)
											: "TBD"}
									</span>
								</div>
								<div className="flex items-center gap-2 text-sm text-slate-600 pt-2">
									<Clock className="size-4 text-orange-500" />
									<span>
										{application?.job?.startTime || "9:00 AM"} -{" "}
										{application?.job?.endTime || "5:00 PM"}
									</span>
								</div>
								{(application?.job?.location ||
									application?.job?.facility?.address) && (
									<div className="col-span-2 flex items-center gap-2 text-sm text-slate-600">
										<MapPin className="size-4 text-orange-500 shrink-0" />
										<span className="truncate">
											{application?.job?.location ||
												application?.job?.facility?.address}
										</span>
									</div>
								)}
							</div>
						</motion.div>

						{/* Important Notice */}
						<motion.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.4 }}
							className="bg-amber-50 border border-amber-200 rounded-lg p-3"
						>
							<p className="text-sm text-amber-800">
								<strong>Important:</strong> By confirming, you commit to
								attending this job. Failure to show up may affect your profile
								rating.
							</p>
						</motion.div>
					</CardContent>

					<CardFooter className="flex flex-col gap-3 pt-2">
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
							className="w-full"
						>
							<Button
								className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base shadow-md shadow-emerald-200"
								onClick={() => confirmMutation.mutate()}
								disabled={confirmMutation.isPending}
							>
								{confirmMutation.isPending ? (
									<>
										<Loader2 className="mr-2 size-5 animate-spin" />
										Confirming...
									</>
								) : (
									<>
										<CheckCircle2 className="mr-2 size-5" />
										Confirm Booking
									</>
								)}
							</Button>
						</motion.div>

						{confirmMutation.isError && (
							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="text-sm text-red-600 text-center"
							>
								{confirmMutation.error.message}
							</motion.p>
						)}

						<p className="text-xs text-slate-500 text-center">
							Having issues? Contact support at{" "}
							<a
								href="mailto:support@maulocum.com"
								className="text-primary hover:underline"
							>
								support@maulocum.com
							</a>
						</p>
					</CardFooter>
				</Card>
			</motion.div>
		</div>
	);
}
