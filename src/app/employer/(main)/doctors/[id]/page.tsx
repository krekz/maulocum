"use client";

import { format } from "date-fns";
import {
	ArrowLeft,
	Briefcase,
	CheckCircle,
	Lock,
	MapPin,
	MessageSquare,
	Star,
} from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorById } from "../_hooks/use-doctors";

interface DoctorPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default function DoctorDetailsPage({ params }: DoctorPageProps) {
	const { id } = use(params);
	const { data: doctor, isLoading } = useDoctorById(id);

	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="mb-6">
					<Skeleton className="h-10 w-40 mb-4" />
					<Skeleton className="h-8 w-48" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card>
						<CardContent className="pt-6">
							<div className="flex flex-col items-center">
								<Skeleton className="h-32 w-32 rounded-full mb-4" />
								<Skeleton className="h-6 w-40 mb-2" />
								<Skeleton className="h-5 w-24 mb-4" />
								<Skeleton className="h-10 w-full mt-4" />
							</div>
						</CardContent>
					</Card>
					<div className="col-span-1 md:col-span-2">
						<Card>
							<CardHeader>
								<Skeleton className="h-6 w-32" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-40 w-full" />
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	if (!doctor) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center py-12">
					<h2 className="text-2xl font-bold mb-2">Doctor Not Found</h2>
					<p className="text-muted-foreground mb-4">
						The doctor profile you're looking for doesn't exist.
					</p>
					<Button asChild>
						<Link href="/employer/doctors">Back to Doctors</Link>
					</Button>
				</div>
			</div>
		);
	}

	const totalReviews = doctor.reviewCount;
	const ratingDistribution = doctor.ratingDistribution as Record<
		number,
		number
	>;

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6">
				<Button variant="ghost" asChild className="mb-4">
					<Link href="/employer/doctors">
						<ArrowLeft className="mr-2 h-4 w-4" /> Back to Doctors
					</Link>
				</Button>
				<h1 className="text-3xl font-bold">Doctor Profile</h1>
			</div>

			{doctor.isLocked && (
				<div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
					<Lock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
					<div>
						<p className="font-medium text-amber-800">Limited Profile View</p>
						<p className="text-sm text-amber-700">
							Your facility needs to be verified to view full doctor details
							including name, contact information, and reviews.
						</p>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Left Column - Doctor Info */}
				<div className="col-span-1">
					<Card>
						<CardContent className="pt-6">
							<div className="flex flex-col items-center text-center">
								{doctor.isLocked ? (
									<div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center mb-4">
										<Lock className="h-12 w-12 text-muted-foreground" />
									</div>
								) : (
									<Avatar className="h-32 w-32 mb-4">
										<AvatarImage
											src={doctor.image || undefined}
											alt={doctor.name || "Doctor"}
										/>
										<AvatarFallback>
											{doctor.name
												?.split(" ")
												.map((n) => n[0])
												.join("") || "DR"}
										</AvatarFallback>
									</Avatar>
								)}

								<h2 className="text-2xl font-bold mb-1">
									{doctor.isLocked ? (
										<span className="text-muted-foreground">
											Locked Profile
										</span>
									) : (
										doctor.name
									)}
								</h2>

								<div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
									<Badge variant="secondary" className="text-sm">
										{doctor.specialty}
									</Badge>
									<Badge
										variant="outline"
										className="bg-green-50 text-green-700 flex items-center gap-1 border-green-200"
									>
										<CheckCircle className="h-3 w-3" /> Verified
									</Badge>
								</div>

								{doctor.rating !== null && (
									<div className="flex items-center text-amber-500 mb-2">
										{[...Array(5)].map((_, i) => (
											<Star
												key={i}
												className={`h-5 w-5 ${i < Math.round(doctor.rating ?? 0) ? "fill-current" : "fill-none"}`}
											/>
										))}
										<span className="ml-2 text-gray-700 font-medium">
											{doctor.rating?.toFixed(1)}
										</span>
									</div>
								)}

								<div className="flex flex-col gap-3 w-full mt-4">
									{doctor.location && (
										<div className="flex items-center text-gray-600">
											<MapPin className="h-5 w-5 mr-2 text-gray-400" />
											<span>{doctor.location}</span>
										</div>
									)}

									{doctor.yearsOfExperience && (
										<div className="flex items-center text-gray-600">
											<Briefcase className="h-5 w-5 mr-2 text-gray-400" />
											<span>{doctor.yearsOfExperience} years experience</span>
										</div>
									)}

									{doctor.completedJobs !== undefined && (
										<div className="flex items-center text-gray-600">
											<CheckCircle className="h-5 w-5 mr-2 text-gray-400" />
											<span>{doctor.completedJobs} jobs completed</span>
										</div>
									)}
								</div>

								{!doctor.isLocked && (
									<div className="mt-6 w-full">
										<Button className="w-full">Contact Doctor</Button>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Reviews */}
				<div className="col-span-1 md:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<MessageSquare className="mr-2 h-5 w-5" /> Reviews
								<span className="ml-2 text-sm font-normal text-gray-500">
									({totalReviews})
								</span>
							</CardTitle>
							<CardDescription>
								{doctor.isLocked
									? "Verify your facility to view reviews"
									: `Feedback from clinics where ${doctor.name} has worked`}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{/* Rating Distribution */}
							<div className="mb-6 p-4 bg-gray-50 rounded-lg">
								<h3 className="text-lg font-medium mb-3">
									Rating Distribution
								</h3>
								<div className="space-y-2">
									{[5, 4, 3, 2, 1].map((rating) => (
										<div key={rating} className="flex items-center">
											<div className="flex items-center w-16">
												<span className="text-sm font-medium mr-2">
													{rating}
												</span>
												<Star className="h-4 w-4 fill-amber-400 text-amber-400" />
											</div>
											<div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
												<div
													className="bg-amber-400 h-2.5 rounded-full"
													style={{
														width: `${totalReviews ? ((ratingDistribution[rating] || 0) / totalReviews) * 100 : 0}%`,
													}}
												/>
											</div>
											<span className="text-sm text-gray-500 w-8">
												{ratingDistribution[rating] || 0}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Reviews List */}
							{doctor.isLocked ? (
								<div className="text-center py-8">
									<Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-medium mb-2">Reviews Locked</h3>
									<p className="text-muted-foreground">
										Verify your facility to view detailed reviews from other
										clinics.
									</p>
								</div>
							) : doctor.reviews && doctor.reviews.length > 0 ? (
								<div className="space-y-4">
									{doctor.reviews.map((review) => (
										<div
											key={review.id}
											className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
										>
											<div className="flex justify-between items-start mb-2">
												<div>
													<h4 className="font-medium">Anonymous Clinic</h4>
													<p className="text-sm text-gray-500">
														{format(new Date(review.date), "MMM d, yyyy")}
													</p>
												</div>
												<div className="flex text-amber-500">
													{[...Array(5)].map((_, i) => (
														<Star
															key={i}
															className={`h-4 w-4 ${i < review.rating ? "fill-current" : "fill-none"}`}
														/>
													))}
												</div>
											</div>
											{review.comment && (
												<p className="text-gray-700">"{review.comment}"</p>
											)}
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8">
									<MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
									<p className="text-muted-foreground">
										This doctor hasn't received any reviews yet.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
