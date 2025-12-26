"use client";

import {
	Bell,
	Book,
	Heart,
	History,
	Mail,
	Menu,
	Settings,
	Star,
	User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/use-notifications";
import { authClient } from "@/lib/auth-client";
import { cn, handleLogout } from "@/lib/utils";
import { ProfileAvatar } from "./profile/profile-avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface MenuItem {
	title: string;
	url: string;
	description?: string;
	icon?: React.ReactNode;
	items?: MenuItem[];
	className?: string;
}

interface NavbarProps {
	logo?: {
		url: string;
		src: string;
		alt: string;
		title: string;
	};
	menu?: MenuItem[];
	mobileExtraLinks?: {
		name: string;
		url: string;
		icon?: React.ReactNode;
	}[];
	auth?: {
		login: {
			text: string;
			url: string;
		};
		signup: {
			text: string;
			url: string;
		};
	};
}

const MainNavbar = ({
	logo = {
		url: "/",
		src: "https://www.shadcnblocks.com/images/block/block-1.svg",
		alt: "logo",
		title: "MauLocum",
	},
	menu = [
		{
			title: "Locums",
			url: "#",
			items: [
				{
					title: "Browse",
					description: "Find the perfect locum job",
					icon: <Book className="size-5 shrink-0" />,
					url: "/jobs",
				},
				// {
				// 	title: "How MauLocum Works",
				// 	description:
				// 		"Learn how MauLocum can help you find the perfect locum job",
				// 	icon: <Trees className="size-5 shrink-0" />,
				// 	url: "#",
				// },
			],
		},
		{
			title: "Facilities",
			url: "/facilities",
		},
		{
			title: "FAQ",
			url: "/faqs",
		},
		{
			title: "Employer Site",
			url: "/employer",
			className: "opacity-20",
		},
	],
	mobileExtraLinks = [
		{ name: "Profile", icon: <User className="h-4 w-4" />, url: "/profile" },
		{
			name: "History",
			icon: <History className="h-4 w-4" />,
			url: "/profile/history",
		},
		{
			name: "Reviews",
			icon: <Star className="h-4 w-4" />,
			url: "/profile/reviews",
		},
		{
			name: "Bookmarks",
			icon: <Heart className="h-4 w-4" />,
			url: "/profile/bookmarks",
		},
		{
			name: "Inbox",
			icon: <Mail className="h-4 w-4" />,
			url: "/profile/inbox",
		},
		{
			name: "Settings",
			icon: <Settings className="h-4 w-4" />,
			url: "/profile/settings",
		},
	],
	auth = {
		login: { text: "Log in", url: "/login" },
		signup: { text: "Sign up", url: "/register" },
	},
}: NavbarProps) => {
	const { data: session, isPending } = authClient.useSession();
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	const closeSheet = () => {
		setIsSheetOpen(false);
	};
	return (
		<section className="py-4 sticky top-0 z-50 bg-card">
			<div className="md:container">
				<nav className="hidden justify-between lg:flex">
					<div className="flex items-center gap-6">
						<Link href={logo.url} className="flex items-center gap-2">
							{/* <img src={logo.src} className="w-8" alt={logo.alt} /> */}
							<span className="text-lg font-semibold">{logo.title}</span>
						</Link>
						<div className="flex items-center">
							<NavigationMenu>
								<NavigationMenuList>
									{menu.map((item) => renderMenuItem(item))}
								</NavigationMenuList>
							</NavigationMenu>
						</div>
					</div>
					<div className="flex gap-2">
						{isPending ? (
							<div className="flex items-center gap-2">
								<Skeleton className="h-10 w-10 rounded-full" />
								<Skeleton className="h-10 w-10 rounded-full" />
							</div>
						) : session?.user ? (
							<>
								{/* Notifications */}
								<NotificationBell />
								<ProfileAvatar
									imageSrc={
										session.user.image ||
										"https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=150&h=150"
									}
									fallback={session.user.name?.charAt(0).toUpperCase() || "U"}
									onLogout={() => handleLogout()}
								/>
							</>
						) : (
							<Button asChild variant="outline" size="sm">
								<Link href={auth.login.url}>{auth.login.text}</Link>
							</Button>
						)}
					</div>
				</nav>
				<div className="block lg:hidden">
					<div className="flex items-center justify-between px-3 ">
						<Link href={logo.url} className="flex items-center gap-2">
							<Image
								width={24}
								height={24}
								src={logo.src}
								className="w-8 min-w-[24px]"
								alt={logo.alt}
							/>
							<span className="text-lg font-semibold">{logo.title}</span>
						</Link>
						<div className="flex">
							<NotificationBell />
							<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
								<SheetTrigger asChild>
									<Button variant="outline" size="icon">
										<Menu className="size-4" />
									</Button>
								</SheetTrigger>
								<SheetContent className="overflow-y-auto">
									<SheetHeader>
										<SheetTitle>
											<Link
												href={logo.url}
												className="flex items-center gap-2"
												onClick={closeSheet}
											>
												<Image
													src={logo.src}
													width={32}
													height={32}
													className="w-8 min-w-[32px]"
													alt={logo.alt}
												/>
												<span className="text-lg font-semibold">
													{logo.title}
												</span>
											</Link>
										</SheetTitle>
									</SheetHeader>
									<div className="m-4 flex flex-col gap-4 ">
										<Accordion
											type="single"
											collapsible
											className="flex w-full flex-col gap-4"
										>
											{menu.map((item) =>
												renderMobileMenuItem(item, closeSheet),
											)}
										</Accordion>
										<div className="border-t py-4">
											<div className="flex justify-center text-lg font-semibold mb-2">
												Menu
											</div>
											<div className="grid grid-cols-2 justify-start">
												{mobileExtraLinks.map((link, idx) => (
													<Link
														key={idx}
														className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground active:scale-95 active:bg-muted"
														href={link.url}
														onClick={closeSheet}
													>
														{link.icon && (
															<span className="inline-flex items-center ">
																{link.icon}
															</span>
														)}
														{link.name}
													</Link>
												))}
											</div>
										</div>
										<div className="flex flex-col gap-3">
											{isPending ? (
												<div className="space-y-3">
													<div className="flex items-center gap-3 p-3 border rounded-md">
														<Skeleton className="h-10 w-10 rounded-full" />
														<div className="flex-1 space-y-2">
															<Skeleton className="h-4 w-24" />
															<Skeleton className="h-3 w-32" />
														</div>
													</div>
													<Skeleton className="h-10 w-full" />
												</div>
											) : session?.user ? (
												<>
													<div className="flex items-center gap-3 p-3 text-center rounded-md ">
														<div className="flex-1">
															<p className="font-medium">{session.user.name}</p>
															<p className="text-base tracking-wider font-light text-muted-foreground">
																{session.user.email}
															</p>
														</div>
													</div>
													<Button
														onClick={() => handleLogout()}
														variant="outline"
														className="active:scale-95"
													>
														Log out
													</Button>
												</>
											) : (
												<Button
													asChild
													variant="outline"
													className="active:scale-95"
												>
													<Link href={auth.login.url} onClick={closeSheet}>
														{auth.login.text}
													</Link>
												</Button>
											)}
										</div>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

const renderMenuItem = (item: MenuItem) => {
	if (item.items) {
		return (
			<NavigationMenuItem key={item.title} className="text-muted-foreground">
				<NavigationMenuTrigger className="bg-transparent">
					{item.title}
				</NavigationMenuTrigger>
				<NavigationMenuContent>
					<ul className="w-80 p-3">
						<NavigationMenuLink>
							{item.items.map((subItem) => (
								<li key={subItem.title}>
									{subItem.title === "Employer Site" ? (
										<a
											className="flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
											href={subItem.url}
										>
											{subItem.icon}
											<div>
												<div className="text-sm font-semibold">
													{subItem.title}
												</div>
												{subItem.description && (
													<p className="text-sm leading-snug text-muted-foreground">
														{subItem.description}
													</p>
												)}
											</div>
										</a>
									) : (
										<Link
											className="flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
											href={subItem.url}
										>
											{subItem.icon}
											<div>
												<div className="text-sm font-semibold">
													{subItem.title}
												</div>
												{subItem.description && (
													<p className="text-sm leading-snug text-muted-foreground">
														{subItem.description}
													</p>
												)}
											</div>
										</Link>
									)}
								</li>
							))}
						</NavigationMenuLink>
					</ul>
				</NavigationMenuContent>
			</NavigationMenuItem>
		);
	}

	if (item.title === "Employer Site") {
		return (
			<a
				key={item.title}
				className={cn(
					"group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground bg-background",
				)}
				href={item.url}
			>
				{item.title}
			</a>
		);
	}

	return (
		<Link
			key={item.title}
			className={cn(
				"group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground",
			)}
			href={item.url}
		>
			{item.title}
		</Link>
	);
};

const renderMobileMenuItem = (item: MenuItem, closeSheet: () => void) => {
	if (item.items) {
		return (
			<AccordionItem key={item.title} value={item.title} className="border-b-0">
				<AccordionTrigger className="py-0 font-semibold hover:no-underline text-base">
					{item.title}
				</AccordionTrigger>
				<AccordionContent className="mt-2">
					{item.items.map((subItem) => (
						<Link
							key={subItem.title}
							className={
								"flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors hover:bg-muted hover:text-accent-foreground active:scale-95 active:bg-muted"
							}
							href={subItem.url}
							onClick={closeSheet}
						>
							{subItem.icon}
							<div>
								<div className="text-sm font-semibold">{subItem.title}</div>
								{subItem.description && (
									<p className="text-sm leading-snug text-muted-foreground">
										{subItem.description}
									</p>
								)}
							</div>
						</Link>
					))}
				</AccordionContent>
			</AccordionItem>
		);
	}

	return (
		<Link
			key={item.title}
			href={item.url}
			className={cn(
				"font-semibold active:scale-95 transition-transform",
				item.className,
			)}
			onClick={closeSheet}
		>
			{item.title}
		</Link>
	);
};

function NotificationBell() {
	const { getUnreadNotifications, markAsReadMutation } = useNotifications();

	const unreadCount = getUnreadNotifications.data?.data?.unreadCount || 0;
	const notifications = getUnreadNotifications.data?.data?.notifications || [];

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					className="p-3 h-auto rounded-full focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 relative"
				>
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
						>
							{unreadCount > 9 ? "9+" : unreadCount}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-0" align="end">
				<div className="flex items-center justify-between p-4 pb-3">
					<h4 className="font-semibold">Notifications</h4>
					{unreadCount > 0 && (
						<Badge variant="secondary" className="rounded-full">
							{unreadCount} new
						</Badge>
					)}
				</div>
				<Separator />
				<div className="max-h-[400px] overflow-y-auto">
					{getUnreadNotifications.isLoading ? (
						<div className="p-4 space-y-3">
							<Skeleton className="h-16 w-full" />
							<Skeleton className="h-16 w-full" />
							<Skeleton className="h-16 w-full" />
						</div>
					) : notifications.length === 0 ? (
						<div className="p-8 text-center">
							<Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
							<p className="text-sm text-muted-foreground">
								No new notifications
							</p>
						</div>
					) : (
						<div className="divide-y">
							{notifications.map((notification) => (
								<Link
									onClick={() => {
										markAsReadMutation.mutate(notification.id);
									}}
									key={notification.id}
									href={notification.actionUrl || "/profile/inbox"}
									className="block p-4 hover:bg-muted/50 transition-colors"
								>
									<div className="space-y-1">
										<div className="flex items-start justify-between gap-2">
											<p className="text-sm font-medium leading-tight">
												{notification.title}
											</p>
											{!notification.isRead && (
												<span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
											)}
										</div>
										<p className="text-xs text-muted-foreground line-clamp-2">
											{notification.message}
										</p>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
				{notifications.length > 0 && (
					<>
						<Separator />
						<div className="p-2">
							<Button variant="ghost" className="w-full text-sm" asChild>
								<Link href="/profile/inbox">View all notifications</Link>
							</Button>
						</div>
					</>
				)}
			</PopoverContent>
		</Popover>
	);
}

export { MainNavbar };
