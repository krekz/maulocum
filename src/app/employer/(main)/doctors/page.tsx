"use client";

import { MapPin, Search, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DOCTORS } from "@/lib/constant";

function DoctorsPage() {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredDoctors = DOCTORS.filter(
		(doctor) =>
			doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
			doctor.location.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="md:container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">Available Doctors</h1>

			<div className="relative mb-8">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
				<Input
					placeholder="Search doctors by name, specialty, or location..."
					className="pl-10"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredDoctors.map((doctor) => (
					<Card
						key={doctor.id}
						className="overflow-hidden hover:shadow-lg transition-shadow"
					>
						<CardHeader className="pb-2">
							<div className="flex items-center gap-4">
								<Avatar className="h-12 w-12">
									<AvatarImage src={doctor.image} alt={doctor.name} />
									<AvatarFallback>
										{doctor.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div>
									<CardTitle className="text-lg">{doctor.name}</CardTitle>
									<Badge variant="outline" className="mt-1">
										{doctor.specialty}
									</Badge>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex items-center text-sm">
									<Star className="h-4 w-4 text-yellow-500 mr-1" />
									<span>{doctor.rating} Rating</span>
								</div>
								<div className="flex items-center text-sm">
									<MapPin className="h-4 w-4 text-gray-500 mr-1" />
									<span>{doctor.location}</span>
								</div>
								<div className="flex items-center text-sm">
									<Badge variant="secondary" className="mt-1">
										{doctor.availability}
									</Badge>
								</div>
								<Link href={`/employer/doctors/${doctor.id}`}>
									<Button className="w-full mt-4">View Profile</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

export default DoctorsPage;
