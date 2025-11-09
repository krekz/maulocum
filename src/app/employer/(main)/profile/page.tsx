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
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { backendApi } from "@/lib/rpc-client";

async function EmployerProfilePage() {
	const headersList = await headers();
	const cookie = headersList.get("cookie");
	const res = await backendApi.api.v2.facilities["my-facility"].$get(
		undefined,
		{
			headers: {
				cookie: cookie || "",
			},
		},
	);

	if (!res.ok) {
		switch (res.status) {
			case 401:
			case 403:
			case 404:
				return notFound();
			default:
				return notFound();
		}
	}
	const data = await res.json();

	const getVerificationBadge = () => {
		switch (data?.data?.facility.facilityVerification?.verificationStatus) {
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
		<div className="container mx-auto py-10">
			<h1 className="text-3xl font-bold mb-6">Clinic Profile</h1>

			{/* Verification Status Alert */}
			{data.success &&
				data.data?.facility.facilityVerification &&
				data.data.facility.facilityVerification.verificationStatus ===
					"REJECTED" && (
					<Alert variant="destructive" className="mb-6">
						<XCircle className="h-4 w-4" />
						<AlertTitle>Verification Rejected</AlertTitle>
						<AlertDescription>
							Your facility verification was rejected.{" "}
							{data.data.facility.facilityVerification?.rejectionReason && (
								<>
									<br />
									<strong>Reason:</strong>{" "}
									{data.data.facility.facilityVerification?.rejectionReason}
								</>
							)}
						</AlertDescription>
					</Alert>
				)}

			{data.success &&
				data.data?.facility.facilityVerification &&
				data.data.facility.facilityVerification.verificationStatus ===
					"PENDING" && (
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
							<h2 className="text-xl font-semibold">{data.data?.user.name}</h2>
							<div className="flex items-center gap-2 my-2">
								<Badge variant="secondary" className="flex items-center gap-1">
									<Shield className="h-3 w-3" /> {data.data?.role}
								</Badge>
							</div>
							<p className="text-gray-500 mb-2">Clinic Owner</p>

							<div className="w-full mt-2 mb-4 p-3 bg-blue-50 rounded-md text-center">
								<p className="text-sm text-gray-500">Managing</p>
								<p className="font-medium text-blue-800">
									{data.data?.facility.name}
								</p>
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
						<h3 className="text-xl font-semibold mb-4">Clinic Information</h3>
						<div className="grid grid-cols-1 gap-4 mb-6">
							<div className="flex items-start">
								<MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
								<div>
									<p className="text-sm text-gray-500 mb-1">Location</p>
									<p className="font-medium">{data.data?.facility.address}</p>
								</div>
							</div>
							<div className="flex items-start">
								<Phone className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
								<div>
									<p className="text-sm text-gray-500 mb-1">Phone</p>
									<p className="font-medium">
										+60 {data.data?.facility.contactPhone}
									</p>
								</div>
							</div>
							<div className="flex items-start">
								<Mail className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
								<div>
									<p className="text-sm text-gray-500 mb-1">Email</p>
									<p className="font-medium">
										{data.data?.facility.contactEmail}
									</p>
								</div>
							</div>
							<div className="flex items-start">
								<Globe className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
								<div>
									<p className="text-sm text-gray-500 mb-1">Website</p>
									<p className="font-medium">INSERT WEBSITE</p>
								</div>
							</div>
							<div className="flex items-start">
								<Clock className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
								<div>
									<p className="text-sm text-gray-500 mb-1">Operating Hours</p>
									<p className="font-medium">INSERT OPERATING HOURS</p>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6 mb-6">
						<h3 className="text-xl font-semibold mb-4">About Our Clinic</h3>
						<p className="text-gray-700 mb-4">
							Klinik One Medic is a modern primary care facility providing
							comprehensive healthcare services to the Subang Jaya community
							since 2010. Our team of experienced doctors and nurses is
							committed to delivering high-quality, patient-centered care in a
							comfortable and welcoming environment.
						</p>
						<p className="text-gray-700">
							We specialize in family medicine, preventive care, chronic disease
							management, and minor procedures. Our clinic is equipped with
							state-of-the-art facilities including digital X-ray, laboratory
							services, and electronic medical records system.
						</p>
					</div>

					<div className="bg-white rounded-lg shadow p-6 mb-6">
						<h3 className="text-xl font-semibold mb-4">
							Facilities & Services
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{[
								"General Consultation",
								"Vaccination",
								"Health Screening",
								"Minor Surgery",
								"Laboratory Services",
								"X-Ray",
								"ECG",
								"Ultrasound",
								"Nebulization",
								"Wound Dressing",
							].map((service, index) => (
								<div key={index} className="flex items-center">
									<div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
									<span>{service}</span>
								</div>
							))}
						</div>
					</div>
					<div className="bg-white rounded-lg shadow p-6">
						<h3 className="text-xl font-semibold mb-4">Contact Information</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{data.data?.facility.contactInfo.map((staff, index) => (
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
		</div>
	);
}

export default EmployerProfilePage;
