"use client";

import {
	ChevronDown,
	ChevronUp,
	Heart,
	History,
	Menu,
	Settings,
	Star,
	User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

interface SidebarLinkProps {
	href: string;
	icon: React.ReactNode;
	label: string;
	active?: boolean;
	onClick?: () => void;
}

function SidebarLink({ href, icon, label, active, onClick }: SidebarLinkProps) {
	return (
		<Link
			href={href}
			className={`flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm transition-all ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}
			onClick={onClick}
		>
			{icon}
			<span className="text-xs sm:text-sm">{label}</span>
		</Link>
	);
}

interface SidebarSectionProps {
	title: string;
	links: Array<{
		href: string;
		icon: React.ReactNode;
		label: string;
	}>;
	pathname: string;
	collapsible?: boolean;
	onLinkClick?: () => void;
}

function SidebarSection({
	title,
	links,
	pathname,
	collapsible = false,
	onLinkClick,
}: SidebarSectionProps) {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between px-2 sm:px-3">
				<h3 className="text-xs sm:text-sm font-medium">{title}</h3>
				{collapsible && (
					<Button
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0"
						onClick={() => setIsOpen(!isOpen)}
					>
						{isOpen ? (
							<ChevronUp className="h-3 w-3" />
						) : (
							<ChevronDown className="h-3 w-3" />
						)}
					</Button>
				)}
			</div>
			{isOpen && (
				<div className="space-y-1">
					{links.map((link) => (
						<SidebarLink
							key={link.href}
							href={link.href}
							icon={link.icon}
							label={link.label}
							active={pathname === link.href}
							onClick={onLinkClick}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export function ProfileSidebar() {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);

	const profileLinks = [
		{
			href: "/profile",
			icon: <User className="h-4 w-4" />,
			label: "Personal Information",
		},
	];

	const jobLinks = [
		{
			href: "/profile/history",
			icon: <History className="h-4 w-4" />,
			label: "History",
		},
		{
			href: "/profile/reviews",
			icon: <Star className="h-4 w-4" />,
			label: "Reviews",
		},
		{
			href: "/profile/bookmarks",
			icon: <Heart className="h-4 w-4" />,
			label: "Bookmarks",
		},
	];

	const settingLinks = [
		{
			href: "/profile/settings",
			icon: <Settings className="h-4 w-4" />,
			label: "Account Settings",
		},
	];

	return (
		<>
			{/* Desktop Sidebar */}
			<div className="hidden md:block w-full space-y-4 sm:space-y-6">
				<SidebarSection
					title="Profile"
					links={profileLinks}
					pathname={pathname}
				/>
				<SidebarSection title="Jobs" links={jobLinks} pathname={pathname} />
				<SidebarSection
					title="Settings"
					links={settingLinks}
					pathname={pathname}
				/>
			</div>

			{/* Mobile Sidebar Sheet */}
			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetTrigger asChild className="md:hidden">
					<Button variant="outline" size="sm" className="h-8 w-8 p-0">
						<Menu className="h-4 w-4" />
						<span className="sr-only">Toggle menu</span>
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="w-[85%] sm:w-[350px] p-0">
					<SheetHeader className="p-4 border-b">
						<SheetTitle className="text-left text-base">Menu</SheetTitle>
					</SheetHeader>
					<div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
						<SidebarSection
							title="Profile"
							links={profileLinks}
							pathname={pathname}
							collapsible
							onLinkClick={() => setIsOpen(false)}
						/>
						<SidebarSection
							title="Jobs"
							links={jobLinks}
							pathname={pathname}
							collapsible
							onLinkClick={() => setIsOpen(false)}
						/>
						<SidebarSection
							title="Settings"
							links={settingLinks}
							pathname={pathname}
							collapsible
							onLinkClick={() => setIsOpen(false)}
						/>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
