import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AdminDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const data = {
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
	return (
		<SidebarProvider>
			<AppSidebar data={data} />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator
						orientation="vertical"
						className="mr-2 data-[orientation=vertical]:h-4"
					/>
					<DynamicBreadcrumb />
				</header>

				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4">{children}</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
