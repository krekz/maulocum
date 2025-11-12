import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { PhoneNumberUpdate } from "../_components/phone-number-update";

export default async function SettingsPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	return (
		<>
			{/* Desktop Header */}
			<div className="hidden md:flex flex-col">
				<h1 className="text-3xl font-bold">Account Settings</h1>
				<p className="text-muted-foreground mt-2">
					Manage your profile image and phone number
				</p>
			</div>

			{/* Phone Number / Profile Update Card */}
			<Card className="p-6">
				<PhoneNumberUpdate
					currentPhoneNumber={session.user.phoneNumber}
					phoneNumberVerified={session.user.phoneNumberVerified ?? false}
					userEmail={session.user.email}
				/>
			</Card>
		</>
	);
}
