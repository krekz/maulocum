"use client";

import Cookies from "js-cookie";
import {
	Bookmark,
	LogOut,
	type LucideIcon,
	Stethoscope,
	User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
	imageSrc?: string;
	fallback: string;
	className?: string;
	onLogout?: () => void;
}

interface ProfileLinkItem {
	href: string;
	label: string;
	icon: LucideIcon;
	isDestructive?: boolean;
	onClickAction?: () => void;
}

export function ProfileAvatar({
	imageSrc,
	fallback,
	className,
	onLogout,
}: ProfileAvatarProps) {
	const [open, setOpen] = React.useState(false);
	const pathname = usePathname();

	const profileLinks: ProfileLinkItem[] = [
		{ href: "/profile/bookmarks", label: "Bookmarks", icon: Bookmark },
		{
			href: "/profile/history",
			label: "History",
			icon: Stethoscope,
		},
		{ href: "/profile", label: "Profile", icon: User },
		// { href: "/profile/settings", label: "Settings", icon: Cog },
		{
			href: "#",
			label: "Logout",
			icon: LogOut,
			isDestructive: true,
			onClickAction:
				onLogout ||
				(() => {
					Cookies.remove("user");
					window.location.reload();
				}),
		},
	];

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					className="p-0 w-10 h-10 rounded-full focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2"
				>
					<Avatar className={cn("cursor-pointer", className)}>
						{imageSrc && <AvatarImage src={imageSrc} alt="Profile" />}
						<AvatarFallback>{fallback}</AvatarFallback>
					</Avatar>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-44 p-2" align="end">
				<div className="flex flex-col gap-1">
					{profileLinks.map((link) => {
						const isActive = pathname === link.href;
						let itemVariant: "ghost" | "secondary" = "ghost";

						if (isActive && !link.isDestructive && link.href !== "#") {
							itemVariant = "secondary";
						}

						return (
							<Link
								key={link.href + link.label}
								href={link.href}
								className={cn(
									"flex w-full items-center gap-2 p-2 rounded-md transition-colors",
									buttonVariants({
										variant: itemVariant,
										size: "sm",
										className: "justify-start w-full",
									}),

									link.isDestructive &&
										"text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive-foreground",
								)}
								onClick={() => {
									if (link.onClickAction) {
										link.onClickAction();
									}
									setOpen(false); // Close popover on any link click
								}}
							>
								<link.icon className="mr-2 h-4 w-4" />
								<span>{link.label}</span>
							</Link>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
