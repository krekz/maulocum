import { Briefcase, Building2, MapPin, Search, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { jobDetailsArray } from "@/lib/constant";

function FacilitiesPage() {
	// Map jobDetailsArray to facilities format
	const facilities = jobDetailsArray.map((job) => {
		// Extract city and state from address
		const addressParts = job.address.split(",");
		const location =
			addressParts.length > 1
				? `${addressParts[addressParts.length - 2]?.trim()}, ${addressParts[addressParts.length - 1]?.trim()}`
				: job.address;

		// Determine facility type based on clinic name
		let type = "Clinic";
		if (job.clinicName.toLowerCase().includes("hospital")) {
			type = "Hospital";
		} else if (
			job.clinicName.toLowerCase().includes("medical center") ||
			job.clinicName.toLowerCase().includes("centre")
		) {
			type = "Medical Center";
		}

		return {
			id: job.id,
			name: job.clinicName,
			type,
			location,
			rating: job.rating,
			openJobs: 1, // Assuming each job entry represents one open position
			// Using placeholder images based on facility type
			logoUrl:
				type === "Hospital"
					? "https://images.unsplash.com/photo-1746150361967-7c20603d25cd?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxNHx8fGVufDB8fHx8fA%3D%3D"
					: type === "Medical Center"
						? "https://plus.unsplash.com/premium_photo-1678189496886-0e568e51601b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxOXx8fGVufDB8fHx8fA%3D%3D"
						: "https://images.unsplash.com/photo-1726066012714-261f6d8c07bc?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMXx8fGVufDB8fHx8fA%3D%3D",
		};
	});

	return (
		<div className="relative w-full">
			<div className="absolute inset-0 h-48 sm:h-56 md:h-64 overflow-hidden">
				<Image
					src="https://plus.unsplash.com/premium_photo-1665657351119-b7283189656c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDE3fGJvOGpRS1RhRTBZfHxlbnwwfHx8fHw%3D"
					alt="Medical facilities banner"
					width={1600}
					height={480}
					className="w-full h-full object-cover brightness-20"
				/>
			</div>

			<div className="container relative z-10 pt-10 sm:pt-12 md:pt-16 pb-5 px-4 sm:px-6 lg:px-8">
				<div className="max-w-3xl mx-auto text-center mb-6 sm:mb-8 md:mb-10">
					<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">
						Medical Facilities
					</h1>
					<p className="text-white/80 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
						Browse through clinics, hospitals and medical centers looking for
						locum doctors
					</p>
				</div>
			</div>

			<div className="container pb-8 sm:pb-10 md:pb-12 pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8">
				<div className="relative w-full max-w-xl sm:max-w-2xl mx-auto text-primary-foreground my-6">
					<div className="flex items-center relative">
						<Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground pointer-events-none" />
						<input
							type="text"
							placeholder="Search facilities..."
							className="border border-stone-300 w-full h-10 sm:h-12 md:h-14 pl-10 sm:pl-12 pr-16 sm:pr-20 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm sm:text-base bg-white text-foreground"
						/>
						<Button
							className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 sm:h-8 md:h-10 text-xs sm:text-sm"
							size="sm"
						>
							Search
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
					{facilities.map((facility) => (
						<Card
							key={facility.id}
							className="overflow-hidden hover:shadow-lg transition-shadow"
						>
							<CardHeader className="pb-2 px-4 sm:px-5 pt-4 sm:pt-5">
								<div className="flex items-center gap-2 sm:gap-3">
									<div className="h-10 sm:h-12 w-10 sm:w-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
										{facility.logoUrl ? (
											<Image
												src={facility.logoUrl}
												alt={facility.name}
												width={40}
												height={40}
												className="h-7 sm:h-8 w-7 sm:w-8 object-contain"
											/>
										) : (
											<Building2 className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
										)}
									</div>
									<div className="min-w-0">
										<CardTitle className="text-lg sm:text-xl truncate">
											{facility.name}
										</CardTitle>
										<Badge
											variant="outline"
											className="mt-1 text-xs sm:text-sm"
										>
											{facility.type}
										</Badge>
									</div>
								</div>
							</CardHeader>

							<CardContent className="pb-3 sm:pb-4 px-4 sm:px-5">
								<div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground mt-2">
									<MapPin className="h-3.5 sm:h-4 w-3.5 sm:w-4 shrink-0 mt-0.5" />
									<span className="line-clamp-1">{facility.location}</span>
								</div>

								<div className="flex items-center gap-2 text-xs sm:text-sm mt-3">
									<div className="flex items-center">
										<Star className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-yellow-500 fill-yellow-500" />
										<span className="ml-1 font-medium">
											{facility.rating.toFixed(1)}
										</span>
									</div>
								</div>
							</CardContent>

							<CardFooter className="border-t pt-3 sm:pt-4 px-4 sm:px-5">
								<div className="flex items-center justify-between w-full">
									<Link
										href={`/facilities/${facility.id}`}
										className="text-xs sm:text-sm text-primary hover:underline"
									>
										View Details
									</Link>
									<Badge
										variant="secondary"
										className="flex items-center gap-1 text-xs"
									>
										<Briefcase className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
										<span>
											{facility.openJobs} Open Job
											{facility.openJobs !== 1 ? "s" : ""}
										</span>
									</Badge>
								</div>
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}

export default FacilitiesPage;
