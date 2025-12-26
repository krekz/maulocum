import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProfileClient } from "./_components/profile-client";

async function EmployerProfilePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || session.user.isEmployer === false) notFound();
	return (
		<div className="container mx-auto py-10">
			<h1 className="text-3xl font-bold mb-6">Clinic Profile</h1>
			<ProfileClient />
		</div>
	);
}

export default EmployerProfilePage;
