import { ProfileSidebar } from "@/components/profile/profile-sidebar";

export default function ProfileLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="sm:container px-4 mx-auto py-4 sm:py-6 lg:py-8">
			{/* Mobile navigation */}
			<div className="md:hidden mb-6 flex items-center justify-between">
				<h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
				<div className="md:hidden">
					<ProfileSidebar />
				</div>
			</div>

			<div className="flex flex-col md:flex-row gap-6 lg:gap-8">
				{/* Sidebar */}
				<div className="hidden md:block w-64 shrink-0">
					<div className="sticky top-20">
						<ProfileSidebar />
					</div>
				</div>

				{/* Main content */}
				<div className="flex-1 space-y-6 lg:space-y-8">{children}</div>
			</div>
		</div>
	);
}
