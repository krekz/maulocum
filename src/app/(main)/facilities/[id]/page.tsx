import {
	Building2,
	Clock,
	ExternalLink,
	Globe,
	Lock,
	MapPin,
	Phone,
	ShieldAlert,
	Star,
} from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { backendApi } from "@/lib/rpc";
import ReviewsDialog from "../../profile/history/reviews-dialog";

interface FacilityDetailsProps {
	params: Promise<{
		id: string;
	}>;
}

async function FacilityDetails({ params }: FacilityDetailsProps) {
	const paramsData = await params;
	const headersList = await headers();
	const cookie = headersList.get("cookie");

	// Fetch facility data from API
	const response = await backendApi.api.v2.facilities[":id"].$get(
		{ param: { id: paramsData.id } },
		{ headers: { cookie: cookie || "" } },
	);

	if (!response.ok) {
		notFound();
	}

	const { data: facility } = await response.json();

	if (!facility) {
		notFound();
	}

	// Calculate rating statistics from real reviews (only for verified doctors)
	const reviews = facility.facilityReviews || [];
	const ratingCounts = [0, 0, 0, 0, 0]; // 1-5 stars
	for (const review of reviews) {
		if (review.rating >= 1 && review.rating <= 5) {
			ratingCounts[review.rating - 1]++;
		}
	}

	const totalReviews = reviews.length;
	const ratingPercentages = ratingCounts.map((count) =>
		totalReviews > 0 ? (count / totalReviews) * 100 : 0,
	);

	// Format date helper
	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString("en-MY", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			{/* Rating Summary and Header */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-8">
				<div className="flex flex-col md:flex-row gap-6 items-start">
					{/* Facility Logo */}
					<div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
						{facility.profileImage ? (
							<Image
								src={facility.profileImage}
								alt={facility.name}
								fill
								className="object-cover"
							/>
						) : (
							<Building2 className="w-16 h-16 text-gray-400" />
						)}
					</div>

					{/* Facility Name and Rating */}
					<div className="flex-1">
						<div className="flex items-center justify-between flex-wrap gap-4">
							<div>
								<h1 className="text-3xl font-bold text-gray-900">
									{facility.name}
								</h1>
								{facility.facilityVerification?.verificationStatus ===
									"APPROVED" && (
									<Badge className="mt-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
										Verified Facility
									</Badge>
								)}
							</div>
							{facility.isVerifiedDoctor && (
								<ReviewsDialog
									jobId={facility.id}
									facilityName={facility.name}
								/>
							)}
						</div>

						{/* Rating - Only show for verified doctors */}
						{facility.isVerifiedDoctor ? (
							<div className="flex items-center mt-3">
								<div className="flex">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className={`w-5 h-5 ${i < Math.round(facility.averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
										/>
									))}
								</div>
								<span className="ml-2 text-lg font-semibold">
									{facility.averageRating.toFixed(1)}
								</span>
								<span className="ml-2 text-gray-600">
									({facility.reviewCount} reviews)
								</span>
							</div>
						) : (
							<div className="flex items-center mt-3 text-gray-500">
								<Lock className="w-4 h-4 mr-2" />
								<span className="text-sm">
									Ratings visible to verified doctors only
								</span>
							</div>
						)}

						<div className="mt-4 flex flex-wrap gap-3">
							<Badge
								variant="outline"
								className="flex items-center gap-1 text-sm"
							>
								<MapPin className="w-3.5 h-3.5" />
								{facility.address.split(",")[0]?.trim() || facility.address}
							</Badge>
							{facility.operatingHours && (
								<Badge
									variant="outline"
									className="flex items-center gap-1 text-sm"
								>
									<Clock className="w-3.5 h-3.5" />
									{facility.operatingHours}
								</Badge>
							)}
							{facility.website && (
								<Badge
									variant="outline"
									className="flex items-center gap-1 text-sm"
								>
									<Globe className="w-3.5 h-3.5" />
									<a
										href={facility.website}
										target="_blank"
										rel="noopener noreferrer"
										className="hover:underline"
									>
										Website
									</a>
								</Badge>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Left Column - About & Details */}
				<div className="lg:col-span-2 space-y-8">
					{/* About Section */}
					<Card>
						<CardHeader>
							<CardTitle>About {facility.name}</CardTitle>
						</CardHeader>
						<CardContent>
							{facility.description ? (
								<p className="text-gray-700">{facility.description}</p>
							) : (
								<p className="text-gray-500 italic">
									No description available.
								</p>
							)}

							{facility.facilitiesServices &&
								facility.facilitiesServices.length > 0 && (
									<>
										<h3 className="font-semibold mt-6 mb-2">
											Facilities & Services:
										</h3>
										<div className="flex flex-wrap gap-2">
											{facility.facilitiesServices.map((service, index) => (
												<Badge key={index} variant="secondary">
													{service}
												</Badge>
											))}
										</div>
									</>
								)}
						</CardContent>
					</Card>

					{/* Reviews Section - Only for verified doctors */}
					{facility.isVerifiedDoctor ? (
						<Card id="reviews">
							<CardHeader>
								<CardTitle>Reviews</CardTitle>
								<CardDescription>
									What locum doctors say about this facility
								</CardDescription>
							</CardHeader>
							<CardContent>
								{reviews.length > 0 ? (
									<>
										{/* Rating Distribution */}
										<div className="mb-6">
											<h3 className="font-semibold mb-4">
												Rating Distribution
											</h3>
											<div className="space-y-2">
												{[5, 4, 3, 2, 1].map((star) => (
													<div key={star} className="flex items-center">
														<span className="w-12 text-sm">{star} star</span>
														<Progress
															value={ratingPercentages[star - 1]}
															className="h-2 flex-1 mx-3"
														/>
														<span className="w-12 text-sm text-right">
															{ratingCounts[star - 1]} (
															{Math.round(ratingPercentages[star - 1])}%)
														</span>
													</div>
												))}
											</div>
										</div>

										<Separator className="my-6" />

										{/* Review List */}
										<div className="space-y-6">
											{reviews.map((review) => (
												<div
													key={review.id}
													className="pb-6 border-b border-gray-200 last:border-0 last:pb-0"
												>
													<div className="flex items-start gap-4">
														<Avatar>
															<AvatarFallback>DR</AvatarFallback>
														</Avatar>
														<div className="flex-1">
															<div className="flex justify-between items-start">
																<div>
																	<h4 className="font-semibold">
																		Anonymous Doctor
																	</h4>
																	<div className="flex items-center mt-1">
																		{[...Array(5)].map((_, i) => (
																			<Star
																				key={i}
																				className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
																			/>
																		))}
																		<span className="ml-2 text-sm text-gray-500">
																			{formatDate(review.createdAt)}
																		</span>
																	</div>
																</div>
															</div>
															{review.comment && (
																<p className="mt-2 text-gray-700">
																	{review.comment}
																</p>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									</>
								) : (
									<p className="text-gray-500 text-center py-8">
										No reviews yet. Be the first to review this facility!
									</p>
								)}
							</CardContent>
						</Card>
					) : (
						<Card id="reviews">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Lock className="w-5 h-5" />
									Reviews
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8">
									<ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<h3 className="font-semibold text-gray-900 mb-2">
										Verification Required
									</h3>
									<p className="text-gray-500 mb-4">
										Reviews and ratings are only visible to verified doctors.
										Complete your verification to access this information.
									</p>
									<Button asChild>
										<Link href="/profile">Complete Verification</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Open Jobs Section - Only for verified doctors */}
					{facility.isVerifiedDoctor ? (
						facility.jobs &&
						facility.jobs.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle>Open Positions</CardTitle>
									<CardDescription>
										Current job openings at this facility
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{facility.jobs.map((job) => (
											<Link
												key={job.id}
												href={`/jobs?id=${job.id}`}
												className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
											>
												<div className="flex justify-between items-start">
													<div>
														<h4 className="font-semibold">
															{job.title || "Locum Position"}
														</h4>
														<p className="text-sm text-gray-500 mt-1">
															{job.location || facility.address}
														</p>
													</div>
													<Badge
														variant={
															job.urgency === "HIGH"
																? "destructive"
																: job.urgency === "MEDIUM"
																	? "default"
																	: "secondary"
														}
													>
														{job.urgency}
													</Badge>
												</div>
												<div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
													<span>
														RM {job.payRate}/{job.payBasis.toLowerCase()}
													</span>
													<span>•</span>
													<span>{job.jobType.replace("_", " ")}</span>
													<span>•</span>
													<span>{formatDate(job.startDate)}</span>
												</div>
											</Link>
										))}
									</div>
								</CardContent>
							</Card>
						)
					) : (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Lock className="w-5 h-5" />
									Job Openings
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8">
									<ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<h3 className="font-semibold text-gray-900 mb-2">
										Verification Required
									</h3>
									<p className="text-gray-500 mb-4">
										Job listings are only visible to verified doctors. Complete
										your verification to view and apply for positions.
									</p>
									<Button asChild>
										<Link href="/profile">Complete Verification</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Right Column - Contact & Location */}
				<div className="space-y-8">
					{/* Contact Information - Only for verified doctors */}
					{facility.isVerifiedDoctor ? (
						<Card>
							<CardHeader>
								<CardTitle>Contact Information</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{/* Main facility contact */}
									<div className="pb-3 border-b border-gray-100">
										<h4 className="font-semibold">{facility.name}</h4>
										<div className="mt-2 space-y-2">
											<div className="flex items-center gap-2">
												<Phone className="w-4 h-4 text-gray-500" />
												<a
													href={`tel:${facility.contactPhone}`}
													className="text-blue-600 hover:underline"
												>
													{facility.contactPhone}
												</a>
											</div>
											<div className="flex items-center gap-2">
												<MapPin className="w-4 h-4 text-gray-500" />
												<span className="text-sm text-gray-600">
													{facility.contactEmail}
												</span>
											</div>
										</div>
									</div>

									{/* Additional contacts */}
									{facility.contactInfo?.map((contact) => (
										<div
											key={contact.id}
											className="pb-3 border-b border-gray-100 last:border-0 last:pb-0"
										>
											<h4 className="font-semibold">{contact.name}</h4>
											<p className="text-sm text-gray-500">
												{contact.position}
											</p>
											<div className="mt-2 flex items-center gap-2">
												<Phone className="w-4 h-4 text-gray-500" />
												<a
													href={`tel:${contact.contact}`}
													className="text-blue-600 hover:underline"
												>
													{contact.contact}
												</a>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Lock className="w-5 h-5" />
									Contact Information
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center py-8">
									<ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<h3 className="font-semibold text-gray-900 mb-2">
										Verification Required
									</h3>
									<p className="text-gray-500 mb-4">
										Contact details are only visible to verified doctors.
										Complete your verification to access this information.
									</p>
									<Button asChild>
										<Link href="/profile">Complete Verification</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Location */}
					<Card>
						<CardHeader>
							<CardTitle>Location</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-700 mb-4">{facility.address}</p>

							{/* Map Placeholder */}
							<div className="aspect-video bg-gray-100 rounded-md overflow-hidden relative mb-4">
								<a
									href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.address)}`}
									target="_blank"
									rel="noopener noreferrer"
									className="absolute inset-0 flex items-center justify-center"
								>
									<div className="text-center">
										<MapPin className="w-8 h-8 text-gray-400 mx-auto" />
										<span className="block mt-2 text-sm text-gray-500">
											View on Google Maps
										</span>
									</div>
								</a>
							</div>

							<a
								href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.address)}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
							>
								<ExternalLink className="w-4 h-4" />
								Open in Google Maps
							</a>
						</CardContent>
					</Card>

					{/* Facility Stats */}
					<Card>
						<CardHeader>
							<CardTitle>Facility Stats</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-gray-600">Total Jobs Posted:</span>
									<span className="font-medium">{facility._count.jobs}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Total Reviews:</span>
									<span className="font-medium">
										{facility._count.facilityReviews}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Member Since:</span>
									<span className="font-medium">
										{formatDate(facility.createdAt)}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default FacilityDetails;
