"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { authClient } from "@/lib/auth-client";
import { handleLogout } from "@/lib/utils";

function AdminSidebar() {
	const { data: user } = authClient.useSession();
	const main = {
		header: {
			title: "Admin Dashboard",
			url: "/admin/dashboard",
		},
		basic: [
			{
				title: "Dashboard",
				url: "/admin/dashboard",
			},
			{
				title: "Users",
				url: "/admin/dashboard/users",
			},
		],
		collapsible: [
			{
				title: "Doctors",
				url: "/admin/dashboard/doctors",
				items: [
					{
						title: "Verifications",
						url: "/admin/dashboard/doctors/verifications",
					},
					{
						title: "All",
						url: "/admin/dashboard/doctors",
					},
				],
			},
			{
				title: "Facilities",
				url: "/admin/dashboard/facilities",
				items: [
					{
						title: "Verifications",
						url: "/admin/dashboard/facilities/verifications",
					},
					{
						title: "All",
						url: "/admin/dashboard/facilities",
					},
				],
			},
		],
	};

	const userObj = {
		name: user?.user.name || "Unknown",
		email: user?.user.email || "",
		avatar: user?.user.image || "",
	};

	return (
		<AppSidebar main={main} user={userObj} logout={() => handleLogout()} />
	);
}

export default AdminSidebar;
