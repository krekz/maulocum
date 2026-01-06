"use client";

import { Lock, MapPin, Search, Star, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctors } from "./_hooks/use-doctors";

function DoctorsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const { data, isLoading } = useDoctors(searchQuery);

	const doctors = data?.doctors || [];
	const isVerified = data?.isVerified ?? false;

	return (
		<div className="md:container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">Available Doctors</h1>

			{!isVerified && !isLoading && (
				<div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
					<Lock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
					<div>
						<p className="font-medium text-amber-800">
							Facility Verification Required
						</p>
						<p className="text-sm text-amber-700">
							Your facility needs to be verified to view full doctor profiles.
							You can still browse available doctors.
						</p>
					</div>
				</div>
			)}

			<div className="relative mb-8">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
				<Input
					placeholder="Search doctors by name, specialty, or location..."
					className="pl-10"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, i) => (
						<Card key={i} className="overflow-hidden">
							<CardHeader className="pb-2">
								<div className="flex items-center gap-4">
									<Skeleton className="h-12 w-12 rounded-full" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-4 w-20" />
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-10 w-full mt-4" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : doctors.length === 0 ? (
				<div className="text-center py-12">
					<User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-medium">No doctors found</h3>
					<p className="text-muted-foreground">
						Try adjusting your search criteria
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{doctors.map((doctor) => (
						<Card
							key={doctor.id}
							className="overflow-hidden hover:shadow-lg transition-shadow"
						>
							<CardHeader className="pb-2">
								<div className="flex items-center gap-4">
									{doctor.isLocked ? (
										<div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
											<Lock className="h-5 w-5 text-muted-foreground" />
										</div>
									) : (
										<Avatar className="h-12 w-12">
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
									<div>
										<CardTitle className="text-lg">
											{doctor.isLocked ? (
												<span className="text-muted-foreground">
													Locked Profile
												</span>
											) : (
												doctor.name
											)}
										</CardTitle>
										<Badge variant="outline" className="mt-1">
											{doctor.specialty}
										</Badge>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{doctor.rating && (
										<div className="flex items-center text-sm">
											<Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
											<span>
												{doctor.rating} ({doctor.reviewCount} reviews)
											</span>
										</div>
									)}
									{doctor.location && (
										<div className="flex items-center text-sm">
											<MapPin className="h-4 w-4 text-gray-500 mr-1" />
											<span>{doctor.location}</span>
										</div>
									)}
									{doctor.yearsOfExperience && (
										<Badge variant="secondary" className="mt-1">
											{doctor.yearsOfExperience} years exp.
										</Badge>
									)}
									<Link href={`/employer/doctors/${doctor.id}`}>
										<Button
											className="w-full mt-4"
											variant={doctor.isLocked ? "outline" : "default"}
										>
											{doctor.isLocked ? (
												<>
													<Lock className="h-4 w-4 mr-2" />
													View Limited Profile
												</>
											) : (
												"View Profile"
											)}
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

export default DoctorsPage;
