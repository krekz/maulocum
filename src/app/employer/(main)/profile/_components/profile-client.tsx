"use client";

import {
	Clock,
	Edit,
	Globe,
	Mail,
	MapPin,
	Phone,
	Shield,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useMyFacility } from "../_hooks/use-my-facility";
import { EditAboutDialog } from "./edit-about-dialog";
import { EditClinicInfoDialog } from "./edit-clinic-info-dialog";
import { EditFacilitiesServicesDialog } from "./edit-facilities-services-dialog";
import { ProfileSkeleton } from "./profile-skeleton";

export function ProfileClient() {
	const [clinicInfoOpen, setClinicInfoOpen] = useState(false);
	const [aboutOpen, setAboutOpen] = useState(false);
	const [servicesOpen, setServicesOpen] = useState(false);

	const { data, isLoading, error } = useMyFacility();

	if (isLoading) {
		return <ProfileSkeleton />;
	}

	if (error || !data?.success || !data.data) {
		return (
			<div className="bg-white rounded-lg shadow p-6 mb-6">
				<p className="text-red-500">Failed to load facility information</p>
			</div>
		);
	}

	const facility = data.data.facility;
	const user = data.data.user;
	const role = data.data.role;

	const getVerificationBadge = () => {
		switch (facility.facilityVerification?.verificationStatus) {
			case "PENDING":
				return (
					<Badge
						variant="secondary"
						className="flex items-center gap-1 bg-yellow-100 text-yellow-800"
					>
						<Clock className="h-3 w-3" /> Pending
					</Badge>
				);
			case "REJECTED":
				return (
					<Badge variant="destructive" className="flex items-center gap-1">
						<XCircle className="h-3 w-3" /> Rejected
					</Badge>
				);
			default:
				return null;
		}
	};

	return (
		<>
			{/* Verification Status Alerts */}
			{facility.facilityVerification?.verificationStatus === "REJECTED" && (
				<Alert variant="destructive" className="mb-6">
					<XCircle className="h-4 w-4" />
					<AlertTitle>Verification Rejected</AlertTitle>
					<AlertDescription>
						Your facility verification was rejected.{" "}
						{facility.facilityVerification?.rejectionReason && (
							<>
								<br />
								<strong>Reason:</strong>{" "}
								{facility.facilityVerification?.rejectionReason}
							</>
						)}
					</AlertDescription>
				</Alert>
			)}

			{facility.facilityVerification?.verificationStatus === "PENDING" && (
				<Alert className="mb-6 border-yellow-200 bg-yellow-50">
					<Clock className="h-4 w-4 text-yellow-600" />
					<AlertTitle className="text-yellow-800">
						Verification Pending
					</AlertTitle>
					<AlertDescription className="text-yellow-700">
						Your facility verification is currently under review. We'll notify
						you once it's processed.
					</AlertDescription>
				</Alert>
			)}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="col-span-1 md:sticky md:top-20 self-start">
					{/* User Profile Card */}
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex flex-col items-center">
							<Avatar className="h-24 w-24 mb-4">
								<AvatarImage src="https://source.unsplash.com/random/400x400/?portrait,professional" />
								<AvatarFallback>AF</AvatarFallback>
							</Avatar>
							<h2 className="text-xl font-semibold">{user.name}</h2>
							<div className="flex items-center gap-2 my-2">
								<Badge variant="secondary" className="flex items-center gap-1">
									<Shield className="h-3 w-3" /> {role}
								</Badge>
							</div>

							<div className="w-full mt-2 mb-4 p-3 bg-blue-50 rounded-md text-center">
								<p className="text-sm text-gray-500">Managing</p>
								<p className="font-medium text-blue-800">{facility.name}</p>
								<div className="flex justify-center mt-1">
									{getVerificationBadge()}
								</div>
							</div>

							<div className="w-full space-y-3">
								<Link
									href="/employer/dashboard"
									className={buttonVariants({
										variant: "default",
										className: "w-full",
									})}
								>
									<Edit className="mr-2 h-4 w-4" />
									Employer Dashboard
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className="col-span-1 md:col-span-2">
					<div className="bg-white rounded-lg shadow p-6 mb-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-semibold">Clinic Information</h3>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setClinicInfoOpen(true)}
							>
								<Edit className="h-4 w-4" />
							</Button>
						</div>
						<div className="grid grid-cols-1 gap-4">
							<div className="flex items-start">
								<MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
								<div>
									<p className="text-sm text-gray-500 mb-1">Location</p>
									<p className="font-medium">{facility.address}</p>
								</div>
							</div>
							<div className="flex items-start">
								<Phone className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
								<div>
									<p className="text-sm text-gray-500 mb-1">Phone</p>
									<p className="font-medium">+60 {facility.contactPhone}</p>
								</div>
							</div>
							<div className="flex items-start">
								<Mail className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
								<div>
									<p className="text-sm text-gray-500 mb-1">Email</p>
									<p className="font-medium">{facility.contactEmail}</p>
								</div>
							</div>
							<div className="flex items-start">
								<Globe className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
								<div>
									<p className="text-sm text-gray-500 mb-1">Website</p>
									<p className="font-medium">
										{facility.website ? (
											<a
												href={facility.website}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 hover:underline"
											>
												{facility.website}
											</a>
										) : (
											<span className="text-gray-400">Not provided</span>
										)}
									</p>
								</div>
							</div>
							<div className="flex items-start">
								<Clock className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
								<div>
									<p className="text-sm text-gray-500 mb-1">Operating Hours</p>
									<p className="font-medium whitespace-pre-line">
										{facility.operatingHours || (
											<span className="text-gray-400">Not provided</span>
										)}
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6 mb-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-semibold">About Our Clinic</h3>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setAboutOpen(true)}
							>
								<Edit className="h-4 w-4" />
							</Button>
						</div>
						{facility.description ? (
							<p className="text-gray-700 whitespace-pre-line">
								{facility.description}
							</p>
						) : (
							<p className="text-gray-400 italic">
								No description provided. Click the edit button to add one.
							</p>
						)}
					</div>

					<div className="bg-white rounded-lg shadow p-6 mb-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-semibold">Facilities & Services</h3>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setServicesOpen(true)}
							>
								<Edit className="h-4 w-4" />
							</Button>
						</div>
						{facility.facilitiesServices.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{facility.facilitiesServices.map((service, index) => (
									<div key={index} className="flex items-center">
										<div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
										<span>{service}</span>
									</div>
								))}
							</div>
						) : (
							<p className="text-gray-400 italic">
								No services listed. Click the edit button to add services.
							</p>
						)}
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<h3 className="text-xl font-semibold mb-4">Contact Information</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{facility.contactInfo.map((staff, index) => (
								<div key={index} className="flex items-center">
									<Avatar className="h-12 w-12 mr-4">
										<AvatarFallback>
											{staff.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium">{staff.name}</p>
										<p className="text-sm text-gray-500">{staff.position}</p>
										<p className="text-sm text-gray-500">+60 {staff.contact}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<EditClinicInfoDialog
				open={clinicInfoOpen}
				onOpenChange={setClinicInfoOpen}
				defaultValues={{
					address: facility.address,
					contactPhone: facility.contactPhone,
					contactEmail: facility.contactEmail,
					website: facility.website || "",
					operatingHours: facility.operatingHours || "",
				}}
			/>

			<EditAboutDialog
				open={aboutOpen}
				onOpenChange={setAboutOpen}
				defaultValues={{
					description: facility.description || "",
				}}
			/>

			<EditFacilitiesServicesDialog
				open={servicesOpen}
				onOpenChange={setServicesOpen}
				defaultValues={{
					facilitiesServices: facility.facilitiesServices,
				}}
			/>
		</>
	);
}
