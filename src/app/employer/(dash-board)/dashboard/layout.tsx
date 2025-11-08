import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function EmployerDashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<AppSidebar
				data={{
					basic: [
						{
							title: "Dashboard",
							url: "/employer/dashboard",
						},
						{
							title: "Users",
							url: "/employer/dashboard/users",
						},
					],
					collapsible: [
						{
							title: "Doctors",
							url: "/employer/dashboard/doctors",
							items: [
								{
									title: "Verifications",
									url: "/employer/dashboard/doctors/verifications",
								},
							],
						},
						{
							title: "Facilities",
							url: "/employer/dashboard/facilities",
							items: [
								{
									title: "Verifications",
									url: "/employer/dashboard/facilities/verifications",
								},
							],
						},
					],
				}}
			/>
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							{children}
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
