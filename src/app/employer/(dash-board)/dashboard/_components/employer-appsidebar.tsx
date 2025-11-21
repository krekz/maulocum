"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { useFacilityName } from "../_hooks/use-facility-name";

function EmployerAppSidebar() {
	const { data: facilityName } = useFacilityName();

	return (
		<AppSidebar
			data={{
				header: {
					title: facilityName || "MauLocum",
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
						],
					},
					{
						title: "Staff",
						url: "/employer/dashboard/staff",
						items: [
							{
								title: "All Staff",
								url: "/employer/dashboard/staff/all",
							},
						],
					},
				],
			}}
		/>
	);
}

export default EmployerAppSidebar;
