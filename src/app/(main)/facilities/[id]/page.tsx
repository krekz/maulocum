import {
	Building2,
	Calendar,
	Clock,
	ExternalLink,
	MapPin,
	Phone,
	Star,
} from "lucide-react";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { jobDetailsArray } from "@/lib/constant";
import ReviewsDialog from "../../profile/history/reviews-dialog";

interface FacilityDetailsProps {
	params: Promise<{
		id: string;
	}>;
}

async function FacilityDetails({ params }: FacilityDetailsProps) {
	const paramsData = await params;
	const facility = jobDetailsArray.find((job) => job.id === paramsData.id);

	if (!facility) {
		notFound();
	}

	// Mock review data
	const reviews = [
		{
			id: "r1",
			author: "Dr. Anonymous",
			rating: 5,
			date: "May 15, 2025",
			content:
				"Excellent facility with supportive staff. The equipment is modern and well-maintained. Would definitely recommend to other locums.",
			avatar: "/avatars/doctor-1.png",
		},
		{
			id: "r2",
			author: "Dr. Anonymous",
			rating: 4,
			date: "April 28, 2025",
			content:
				"Good working environment and fair compensation. The staff is helpful, though the location can be a bit challenging during peak hours.",
			avatar: "/avatars/doctor-2.png",
		},
		{
			id: "r3",
			author: "Dr. Anonymous",
			rating: 5,
			date: "April 10, 2025",
			content:
				"One of the best clinics I've worked with as a locum. Clear communication, timely payments, and excellent facilities.",
			avatar: "/avatars/doctor-3.png",
		},
	];

	// Calculate rating statistics
	const ratingCounts = [0, 0, 0, 0, 0]; // 1-5 stars
	for (const review of reviews) {
		ratingCounts[review.rating - 1]++;
	}

	const ratingPercentages = ratingCounts.map(
		(count) => (count / reviews.length) * 100,
	);

	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			{/* Rating Summary and Header */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-8">
				<div className="flex flex-col md:flex-row gap-6 items-start">
					{/* Facility Logo */}
					<div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
						<Building2 className="w-16 h-16 text-gray-400" />
						{/* If there was a logo: <Image src={facility.logo} alt={facility.clinicName} fill className="object-cover" /> */}
					</div>

					{/* Facility Name and Rating */}
					<div className="flex-1">
						<div className="flex items-center justify-between flex-wrap gap-4">
							<h1 className="text-3xl font-bold text-gray-900">
								{facility.clinicName}
							</h1>
							<ReviewsDialog
								jobId={facility.id} // TODO: change to jobid
								facilityName={facility.clinicName}
							/>
						</div>

						<div className="flex items-center mt-2">
							<div className="flex">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										className={`w-5 h-5 ${i < Math.round(facility.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
									/>
								))}
							</div>
							<span className="ml-2 text-lg font-semibold">
								{facility.rating.toFixed(1)}
							</span>
							<span className="ml-2 text-gray-600">
								({facility.reviewCount} reviews)
							</span>
						</div>

						<div className="mt-4 flex flex-wrap gap-3">
							<Badge
								variant="outline"
								className="flex items-center gap-1 text-sm"
							>
								<MapPin className="w-3.5 h-3.5" />
								{facility.address.split(",")[1]?.trim() || "Location"}
							</Badge>
							<Badge
								variant="outline"
								className="flex items-center gap-1 text-sm"
							>
								<Clock className="w-3.5 h-3.5" />
								{facility.workingHours}
							</Badge>
							<Badge
								variant="outline"
								className="flex items-center gap-1 text-sm"
							>
								<Calendar className="w-3.5 h-3.5" />
								Available from {facility.dateNeeded}
							</Badge>
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
							<CardTitle>About {facility.clinicName}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-700">{facility.description}</p>

							<h3 className="font-semibold mt-6 mb-2">Responsibilities:</h3>
							<ul className="list-disc pl-5 space-y-1">
								{facility.responsibilities.map((resp, index) => (
									<li key={index} className="text-gray-700">
										{resp}
									</li>
								))}
							</ul>

							<h3 className="font-semibold mt-6 mb-2">Facilities Available:</h3>
							<p className="text-gray-700">{facility.facilities}</p>

							<h3 className="font-semibold mt-6 mb-2">Payment Details:</h3>
							<p className="text-gray-700">{facility.payment}</p>
						</CardContent>
					</Card>

					{/* Reviews Section */}
					<Card id="reviews">
						<CardHeader>
							<CardTitle>Reviews</CardTitle>
							<CardDescription>
								What locum doctors say about this facility
							</CardDescription>
						</CardHeader>
						<CardContent>
							{/* Rating Distribution */}
							<div className="mb-6">
								<h3 className="font-semibold mb-4">Rating Distribution</h3>
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
												<AvatarFallback>
													{review.author
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
												<AvatarImage src={review.avatar} alt={review.author} />
											</Avatar>
											<div className="flex-1">
												<div className="flex justify-between items-start">
													<div>
														<h4 className="font-semibold">{review.author}</h4>
														<div className="flex items-center mt-1">
															{[...Array(5)].map((_, i) => (
																<Star
																	key={i}
																	className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
																/>
															))}
															<span className="ml-2 text-sm text-gray-500">
																{review.date}
															</span>
														</div>
													</div>
												</div>
												<p className="mt-2 text-gray-700">{review.content}</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
						<CardFooter>
							<Button variant="outline" className="w-full">
								See All Reviews
							</Button>
						</CardFooter>
					</Card>
				</div>

				{/* Right Column - Contact & Location */}
				<div className="space-y-8">
					{/* Contact Information */}
					<Card>
						<CardHeader>
							<CardTitle>Contact Information</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{facility.contacts.map((contact, index) => (
									<div
										key={index}
										className="pb-3 border-b border-gray-100 last:border-0 last:pb-0"
									>
										<h4 className="font-semibold">{contact.name}</h4>
										<p className="text-sm text-gray-500">{contact.role}</p>
										<div className="mt-2 flex items-center gap-2">
											<Phone className="w-4 h-4 text-gray-500" />
											<a
												href={`tel:${contact.phone}`}
												className="text-blue-600 hover:underline"
											>
												{contact.phone}
											</a>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

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
									href={facility.gmapLink}
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
								href={facility.gmapLink}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
							>
								<ExternalLink className="w-4 h-4" />
								Open in Google Maps
							</a>
						</CardContent>
					</Card>

					{/* Job Details */}
					<Card>
						<CardHeader>
							<CardTitle>Job Details</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-gray-600">Date Needed:</span>
									<span className="font-medium">{facility.dateNeeded}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Working Hours:</span>
									<span className="font-medium">{facility.workingHours}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Urgency:</span>
									<span className="font-medium">{facility.urgency}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Posted:</span>
									<span className="font-medium">{facility.createdAt}</span>
								</div>
							</div>

							<Button className="w-full mt-6">Apply for This Position</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

export default FacilityDetails;
