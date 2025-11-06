"use client";

import { Bell, Book, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
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

interface Navbar1Props {
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

const Navbar1 = ({
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
			title: "Contact Us",
			url: "#",
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
		{ name: "Press", url: "#" },
		{ name: "Contact", url: "#" },
		{ name: "Imprint", url: "#" },
		{ name: "Sitemap", url: "#" },
	],
	auth = {
		login: { text: "Log in", url: "/login" },
		signup: { text: "Sign up", url: "/register" },
	},
}: Navbar1Props) => {
	const { data: session } = authClient.useSession();

	const handleLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = "/login";
				},
			},
		});
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
						{session?.user ? (
							<>
								{/* Notifications */}
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="ghost"
											className="p-3 h-auto rounded-full focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2"
										>
											<div className="relative">
												<Bell className="h-5 w-5" />
												<span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
											</div>
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-80 p-4">
										<div className="space-y-4">
											<h4 className="font-medium">Notifications</h4>
											<div className="border-t pt-4">
												<div className="text-sm">
													You have no new notifications
												</div>
											</div>
										</div>
									</PopoverContent>
								</Popover>
								<ProfileAvatar
									imageSrc={
										session.user.image ||
										"https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=150&h=150"
									}
									fallback={session.user.name?.charAt(0).toUpperCase() || "U"}
									onLogout={handleLogout}
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
					<div className="flex items-center justify-between px-3">
						<Link href={logo.url} className="flex items-center gap-2">
							<Image
								width={24}
								height={24}
								src={logo.src}
								className="w-8"
								alt={logo.alt}
							/>
							<span className="text-lg font-semibold">{logo.title}</span>
						</Link>
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="outline" size="icon">
									<Menu className="size-4" />
								</Button>
							</SheetTrigger>
							<SheetContent className="overflow-y-auto">
								<SheetHeader>
									<SheetTitle>
										<Link href={logo.url} className="flex items-center gap-2">
											<Image src={logo.src} className="w-8" alt={logo.alt} />
											<span className="text-lg font-semibold">
												{logo.title}
											</span>
										</Link>
									</SheetTitle>
								</SheetHeader>
								<div className="my-6 flex flex-col gap-6">
									<Accordion
										type="single"
										collapsible
										className="flex w-full flex-col gap-4"
									>
										{menu.map((item) => renderMobileMenuItem(item))}
									</Accordion>
									<div className="border-t py-4">
										<div className="grid grid-cols-2 justify-start">
											{mobileExtraLinks.map((link, idx) => (
												<Link
													key={idx}
													className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground"
													href={link.url}
												>
													{link.name}
												</Link>
											))}
										</div>
									</div>
									<div className="flex flex-col gap-3">
										{session?.user ? (
											<>
												<div className="flex items-center gap-3 p-3 border rounded-md">
													<div className="flex-1">
														<p className="font-medium">{session.user.name}</p>
														<p className="text-sm text-muted-foreground">
															{session.user.email}
														</p>
													</div>
												</div>
												<Button onClick={handleLogout} variant="outline">
													Log out
												</Button>
											</>
										) : (
											<Button asChild variant="outline">
												<Link href={auth.login.url}>{auth.login.text}</Link>
											</Button>
										)}
									</div>
								</div>
							</SheetContent>
						</Sheet>
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

	return (
		<Link
			key={item.title}
			className={cn(
				"group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground",
				item.title === "Employer Site" && "bg-background",
			)}
			href={item.url}
		>
			{item.title}
		</Link>
	);
};

const renderMobileMenuItem = (item: MenuItem) => {
	if (item.items) {
		return (
			<AccordionItem key={item.title} value={item.title} className="border-b-0">
				<AccordionTrigger className="py-0 font-semibold hover:no-underline">
					{item.title}
				</AccordionTrigger>
				<AccordionContent className="mt-2">
					{item.items.map((subItem) => (
						<Link
							key={subItem.title}
							className={
								"flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
							}
							href={subItem.url}
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
			className={cn("font-semibold", item.className)}
		>
			{item.title}
		</Link>
	);
};

export { Navbar1 };
