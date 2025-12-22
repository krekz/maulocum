"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { handleLogout } from "@/lib/utils";
import { useFacilityName } from "../_hooks/use-facility-name";

function EmployerAppSidebar() {
	const { data } = useFacilityName();

	return (
		<AppSidebar
			main={{
				header: {
					title: data?.facilityName || "Facility",
					url: "/employer/dashboard",
				},
				basic: [
					{
						title: "Dashboard",
						url: "/employer/dashboard",
					},
				],
				collapsible: [
					{
						title: "Jobs",
						url: "/employer/dashboard/jobs",
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
