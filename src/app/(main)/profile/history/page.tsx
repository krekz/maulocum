"use client";

import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import ReviewsDialog from "./reviews-dialog";

function HistoryPage() {
	const [statusFilter, setStatusFilter] = React.useState<string>("all");

	const appliedLocums = [
		{
			id: 1,
			clinicName: "KL City Medical Center",
			location: "Kuala Lumpur",
			specialist: "Emergency Medicine",
			date: "15 May 2023",
			time: "8:00 AM - 4:00 PM",
			rate: "RM 150/hour",
			status: "completed",
		},
		{
			id: 2,
			clinicName: "Selangor Family Clinic",
			location: "Petaling Jaya, Selangor",
			specialist: "General Practice",
			date: "22 May 2023",
			time: "9:00 AM - 6:00 PM",
			rate: "RM 120/hour",
			status: "pending",
		},
		{
			id: 3,
			clinicName: "Penang General Hospital",
			location: "Georgetown, Penang",
			specialist: "Paediatrics",
			date: "30 May 2023",
			time: "7:00 AM - 3:00 PM",
			rate: "RM 140/hour",
			status: "cancelled",
		},
		{
			id: 4,
			clinicName: "Johor Specialist Center",
			location: "Johor Bahru",
			specialist: "Cardiology",
			date: "5 June 2023",
			time: "10:00 AM - 6:00 PM",
			rate: "RM 180/hour",
			status: "completed",
		},
		{
			id: 5,
			clinicName: "Sarawak Medical Hub",
			location: "Kuching, Sarawak",
			specialist: "Orthopaedics",
			date: "12 June 2023",
			time: "8:00 AM - 5:00 PM",
			rate: "RM 160/hour",
			status: "pending",
		},
		{
			id: 6,
			clinicName: "Sabah Community Clinic",
			location: "Kota Kinabalu, Sabah",
			specialist: "General Practice",
			date: "18 June 2023",
			time: "9:00 AM - 5:00 PM",
			rate: "RM 110/hour",
			status: "completed",
		},
		{
			id: 7,
			clinicName: "Melaka Healthcare Center",
			location: "Melaka",
			specialist: "Emergency Medicine",
			date: "25 June 2023",
			time: "7:00 PM - 7:00 AM",
			rate: "RM 170/hour",
			status: "pending",
		},
		{
			id: 8,
			clinicName: "Perak Medical Institute",
			location: "Ipoh, Perak",
			specialist: "Psychiatry",
			date: "2 July 2023",
			time: "10:00 AM - 4:00 PM",
			rate: "RM 145/hour",
			status: "cancelled",
		},
		{
			id: 9,
			clinicName: "Kedah Rural Clinic",
			location: "Alor Setar, Kedah",
			specialist: "General Practice",
			date: "10 July 2023",
			time: "8:00 AM - 5:00 PM",
			rate: "RM 115/hour",
			status: "completed",
		},
		{
			id: 10,
			clinicName: "Terengganu Health Center",
			location: "Kuala Terengganu",
			specialist: "Radiology",
			date: "15 July 2023",
			time: "9:00 AM - 3:00 PM",
			rate: "RM 155/hour",
			status: "pending",
		},
	];

	const filteredLocums =
		statusFilter === "all"
			? appliedLocums
			: appliedLocums.filter((locum) => locum.status === statusFilter);

	const getStatusBadgeColor = (status: string) => {
		switch (status) {
			case "completed":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<>
			<div className="flex items-center justify-between">
				<h1 className="hidden md:flex text-3xl font-bold">My Applied Locums</h1>
				{/* Filter Buttons */}
				<div className="flex flex-wrap gap-2">
					<button
						onClick={() => setStatusFilter("all")}
						className={`px-4 py-2 rounded-md ${statusFilter === "all" ? "bg-primary text-white" : "bg-gray-100"}`}
					>
						All
					</button>
					<button
						onClick={() => setStatusFilter("completed")}
						className={`px-4 py-2 rounded-md ${statusFilter === "completed" ? "bg-green-600 text-white" : "bg-gray-100"}`}
					>
						Completed
					</button>
					<button
						onClick={() => setStatusFilter("pending")}
						className={`px-4 py-2 rounded-md ${statusFilter === "pending" ? "bg-yellow-600 text-white" : "bg-gray-100"}`}
					>
						Pending
					</button>
					<button
						onClick={() => setStatusFilter("cancelled")}
						className={`px-4 py-2 rounded-md ${statusFilter === "cancelled" ? "bg-red-600 text-white" : "bg-gray-100"}`}
					>
						Cancelled
					</button>
				</div>
			</div>

			{/* Applied Locums List */}
			{filteredLocums.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						You haven't applied for any locum jobs yet.
					</p>
					<Button className="mt-4" variant="outline" asChild>
						<Link href="/jobs">Browse Jobs</Link>
					</Button>
				</div>
			) : (
				<div className="grid gap-4">
					{filteredLocums.map((locum) => (
						<div
							key={locum.id}
							className="border rounded-lg p-4 bg-card shadow-sm hover:shadow-md transition-shadow"
						>
							{/* Header */}
							<div className="flex justify-between items-start">
								<div>
									<h2 className="text-xl font-semibold">{locum.clinicName}</h2>
									<p className="text-muted-foreground">{locum.location}</p>
								</div>
								<span
									className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
										locum.status,
									)}`}
								>
									{locum.status.charAt(0).toUpperCase() + locum.status.slice(1)}
								</span>
							</div>

							{/* Details */}
							<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
								<div>
									<p className="text-sm text-muted-foreground">Specialty</p>
									<p className="font-medium">{locum.specialist}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Date</p>
									<p className="font-medium">{locum.date}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Time</p>
									<p className="font-medium">{locum.time}</p>
								</div>
							</div>

							{/* Footer */}
							<div className="mt-4 flex justify-between items-center">
								<p className="font-semibold text-primary">{locum.rate}</p>
								<div className="flex gap-2">
									<Link
										href={`/jobs/${locum.id}`}
										className="px-4 py-2 bg-accent rounded-md hover:bg-accent/80 transition-colors"
									>
										View Details
									</Link>
									<ReviewsDialog
										facilityId="123"
										facilityName="KL City Medical Center"
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</>
	);
}

export default HistoryPage;
