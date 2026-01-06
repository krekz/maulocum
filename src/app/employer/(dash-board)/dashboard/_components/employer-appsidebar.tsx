"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { handleLogout } from "@/lib/utils";
import { useFacilityName } from "../_hooks/use-facility-name";
import { useSidebarCounts } from "../_hooks/use-sidebar-counts";

function EmployerAppSidebar() {
	const { data } = useFacilityName();
	const { data: counts } = useSidebarCounts();

	return (
		<AppSidebar
			main={{
				header: {
					title: data?.facilityName || "Facility",
					url: "/employer",
				},
				basic: [
					{
						title: "Dashboard",
						url: "/employer/dashboard",
					},
					{
						title: "Notifications",
						url: "/employer/dashboard/notifications",
						badge: counts?.unreadNotifications,
					},
				],
				collapsible: [
					{
						title: "Jobs",
						url: "/employer/dashboard/jobs",
						badge: counts?.pendingApplicants,
						items: [
							{
								title: "Post Job",
								url: "/employer/dashboard/jobs/post",
							},
							{
								title: "All Jobs",
								url: "/employer/dashboard/jobs",
							},
							{
								title: "Applicants",
								url: "/employer/dashboard/jobs/applicants",
								badge: counts?.pendingApplicants,
							},
						],
					},
					{
						title: "Staff",
						url: "/employer/dashboard/staff",
						items: [
							{
								title: "All Staff",
								url: "/employer/dashboard/staffs",
							},
						],
					},
				],
			}}
			user={{
				name: data?.user.name || "Unknown",
				email: data?.user.email,
				avatar: data?.user.image || "",
			}}
			logout={() => handleLogout()}
		/>
	);
}

export default EmployerAppSidebar;
