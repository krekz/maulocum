import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SectionCards } from "@/components/section-cards";
import { auth } from "@/lib/auth";

async function DashboardHome() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) notFound();
	if (!session.user.isEmployer) notFound();
	return (
		<>
			<SectionCards />
			<div className="mt-8 lg:px-6">
				<h2 className="text-2xl font-bold mb-4">Recent Applicants</h2>
				<div className="grid gap-2">
					{[
						{
							name: "Dr. Sarah Johnson",
							specialty: "Pediatrician",
							appliedDate: "2 days ago",
							status: "Pending",
						},
						{
							name: "Dr. Michael Chen",
							specialty: "Cardiologist",
							appliedDate: "3 days ago",
							status: "Approved",
						},
						{
							name: "Dr. Emily Rodriguez",
							specialty: "Neurologist",
							appliedDate: "1 week ago",
							status: "Pending",
						},
						{
							name: "Dr. James Wilson",
							specialty: "Emergency Medicine",
							appliedDate: "1 week ago",
							status: "Approved",
						},
						{
							name: "Dr. Aisha Patel",
							specialty: "Family Medicine",
							appliedDate: "2 weeks ago",
							status: "Rejected",
						},
					].map((applicant, index) => (
						<div
							key={index}
							className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:bg-gray-50"
						>
							<div className="flex items-center space-x-4">
								<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
									{applicant.name
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</div>
								<div>
									<h3 className="font-medium">{applicant.name}</h3>
									<p className="text-sm text-gray-500">{applicant.specialty}</p>
								</div>
							</div>
							<div className="text-right">
								<span className="text-sm text-gray-500">
									{applicant.appliedDate}
								</span>
								<p
									className={`text-sm ${
										applicant.status === "Approved"
											? "text-green-600"
											: applicant.status === "Pending"
												? "text-blue-600"
												: "text-red-600"
									}`}
								>
									{applicant.status}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
}

export default DashboardHome;
