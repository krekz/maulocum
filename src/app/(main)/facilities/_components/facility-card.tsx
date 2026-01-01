import { Briefcase, Building2, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface FacilityCardProps {
	id: string;
	name: string;
	address: string;
	profileImage?: string | null;
	openJobs: number;
	avgRating: number;
}

export function FacilityCard({
	id,
	name,
	address,
	profileImage,
	openJobs,
	avgRating,
}: FacilityCardProps) {
	const facilityType = name.toLowerCase().includes("hospital")
		? "Hospital"
		: name.toLowerCase().includes("medical center") ||
				name.toLowerCase().includes("centre")
			? "Medical Center"
			: "Clinic";

	const extractLocation = (fullAddress: string) => {
		const addressParts = fullAddress.split(",");
		return addressParts.length > 1
			? `${addressParts[addressParts.length - 2]?.trim()}, ${addressParts[addressParts.length - 1]?.trim()}`
			: fullAddress;
	};

	return (
		<Card className="overflow-hidden hover:shadow-lg transition-shadow">
			<CardHeader className="pb-2 px-4 sm:px-5 pt-4 sm:pt-5">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="h-10 sm:h-12 w-10 sm:w-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
						{profileImage ? (
							<Image
								src={profileImage}
								alt={name}
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
							{name}
						</CardTitle>
						<Badge variant="outline" className="mt-1 text-xs sm:text-sm">
							{facilityType}
						</Badge>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pb-3 sm:pb-4 px-4 sm:px-5">
				<div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground mt-2">
					<MapPin className="h-3.5 sm:h-4 w-3.5 sm:w-4 shrink-0 mt-0.5" />
					<span className="line-clamp-1">{extractLocation(address)}</span>
				</div>

				<div className="flex items-center gap-2 text-xs sm:text-sm mt-3">
					<div className="flex items-center">
						<Star className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-yellow-500 fill-yellow-500" />
						<span className="ml-1 font-medium">{avgRating.toFixed(1)}</span>
					</div>
				</div>
			</CardContent>

			<CardFooter className="border-t pt-3 sm:pt-4 px-4 sm:px-5">
				<div className="flex items-center justify-between w-full">
					<Link
						href={`/facilities/${id}`}
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
							{openJobs} Open Job{openJobs !== 1 ? "s" : ""}
						</span>
					</Badge>
				</div>
			</CardFooter>
		</Card>
	);
}
