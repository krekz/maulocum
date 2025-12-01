import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
		<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
			{/* Header */}
			<div className="px-4 py-3 border-b border-slate-100">
				<h3 className="font-semibold text-slate-900 text-sm">
					Account Settings
				</h3>
				<p className="text-xs text-muted-foreground mt-0.5">
					Manage your phone number and account security
				</p>
			</div>

			{/* Content */}
			<div className="p-4">
				<PhoneNumberUpdate
					currentPhoneNumber={session.user.phoneNumber}
					phoneNumberVerified={session.user.phoneNumberVerified ?? false}
					userEmail={session.user.email}
				/>
			</div>
		</div>
	);
}
