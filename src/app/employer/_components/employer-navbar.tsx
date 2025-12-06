"use client";
import { Book, Building, LogOut, Menu, Trees, UserCog } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface MenuItem {
	title: string;
	url: string;
	description?: string;
	icon?: React.ReactNode;
	items?: MenuItem[];
	className?: string;
}

interface EmployerNavbarProps {
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
}

const NavbarEmployer = ({
	logo = {
		url: "/employer",
		src: "https://www.shadcnblocks.com/images/block/block-1.svg",
		alt: "logo",
		title: "MauLocum Employer",
	},
	menu = [
		{
			title: "Resources",
			url: "#",
			items: [
				{
					title: "Hiring Guide",
					description: "Best practices for hiring healthcare professionals",
					icon: <Book className="size-5 shrink-0" />,
					url: "#",
				},
				{
					title: "Success Stories",
					description:
						"Learn how other facilities have succeeded with MauLocum",
					icon: <Trees className="size-5 shrink-0" />,
					url: "#",
				},
			],
		},
		{
			title: "Doctors",
			url: "/employer/doctors",
			className: "text-primary",
		},
		{
			title: "Locum Site",
			url: "/",
			className: "text-primary",
		},
	],
	mobileExtraLinks = [
		{ name: "Help Center", url: "/employer/help" },
		{ name: "Contact Sales", url: "/employer/contact" },
		{ name: "About Us", url: "/employer/about" },
		{ name: "Blog", url: "/employer/blog" },
	],
}: EmployerNavbarProps) => {
	const { data: session } = authClient.useSession();

	return (
		<section className="py-4 sticky top-0 z-50 bg-card shadow-sm">
			<div className="w-full lg:container">
				<nav className="hidden justify-between lg:flex">
					<div className="flex items-center gap-6">
						<Link href={logo.url} className="flex items-center gap-2">
							<span className="text-lg font-semibold text-primary">
								{logo.title}
							</span>
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
						{/* Not logged in */}
						{!session && (
							<Button asChild variant="outline" size="sm">
								<a href="/login">Login</a>
							</Button>
						)}

						{/* Logged in but not employer - show register button */}
						{session && !session.user.isEmployer && (
							<Button asChild size="sm">
								<Link href="/employer/register">Register as Employer</Link>
							</Button>
						)}

						{/* Logged in as employer */}
						{session?.user.isEmployer && (
							<div className="flex items-center gap-3">
								<Button asChild size="sm">
									<Link href="/employer/dashboard/jobs/post">Post a Job</Link>
								</Button>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="ghost"
											className="p-0 h-auto rounded-full focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2"
										>
											<Avatar className="cursor-pointer">
												<AvatarImage
													src={
														session.user.image ||
														"https://images.unsplash.com/photo-1613256168695-b13ed5ba9500?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
													}
													alt={session.user.name}
												/>
												<AvatarFallback>
													{session.user.name?.charAt(0).toUpperCase()}
												</AvatarFallback>
											</Avatar>
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-44 p-2" align="end">
										<div className="flex flex-col gap-1">
											<Link
												href="/employer/dashboard"
												className={cn(
													buttonVariants({ variant: "ghost" }),
													"justify-start",
												)}
											>
												<Building className="mr-2 h-4 w-4" />
												Dashboard
											</Link>
											<Link
												href="/employer/profile"
												className={cn(
													buttonVariants({ variant: "ghost" }),
													"justify-start",
												)}
											>
												<UserCog className="mr-2 h-4 w-4" />
												Employer Profile
											</Link>
											<Link
												href="/"
												className={cn(
													buttonVariants({
														variant: "destructive",
													}),
													"justify-start",
												)}
											>
												<LogOut className="mr-2 h-4 w-4" />
												Logout
											</Link>
										</div>
									</PopoverContent>
								</Popover>
							</div>
						)}
					</div>
				</nav>
				<div className="block lg:hidden">
					<div className="flex items-center justify-between px-2">
						<Link href={logo.url} className="flex items-center gap-2">
							<Image
								width={24}
								height={24}
								src={logo.src}
								className="w-8"
								alt={logo.alt}
							/>
							<span className="text-lg font-semibold text-primary">
								{logo.title}
							</span>
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
											<Image
												width={24}
												height={24}
												src={logo.src}
												className="w-8"
												alt={logo.alt}
											/>
											<span className="text-lg font-semibold text-primary p-4">
												{logo.title}
											</span>
										</Link>
									</SheetTitle>
								</SheetHeader>
								<div className="m-4 flex flex-col gap-6">
									<Accordion
										type="single"
										collapsible
										className="flex w-full flex-col gap-2"
									>
										{menu.map((item) => renderMobileMenuItem(item))}
									</Accordion>
									<div className="border-t py-4 ">
										<div className="grid grid-cols-2 justify-start ">
											{mobileExtraLinks.map((link, idx) => (
												<Link
													key={idx}
													className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground"
													href={link.url}
												>
													{link.name}
												</Link>
											))}
										</div>
									</div>
									<div className="flex flex-col gap-3">
										{/* Not logged in */}
										{!session && (
											<Button asChild variant="outline">
												<a href="/login">Login</a>
											</Button>
										)}

										{/* Logged in but not employer */}
										{session && !session.user.isEmployer && (
											<Button asChild>
												<Link href="/employer/register">
													Register as Employer
												</Link>
											</Button>
										)}

										{/* Logged in as employer */}
										{session?.user.isEmployer && (
											<>
												<Button asChild>
													<Link href="/employer/dashboard/jobs/post">
														Post a Job
													</Link>
												</Button>
												<Button asChild variant="outline">
													<Link href="/employer/dashboard">Dashboard</Link>
												</Button>
												<Button asChild variant="outline">
													<Link href="/employer/profile">Profile</Link>
												</Button>
											</>
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
			<NavigationMenuItem key={item.title}>
				<NavigationMenuTrigger className="bg-transparent">
					{item.title}
				</NavigationMenuTrigger>
				<NavigationMenuContent>
					<ul className="grid gap-3 p-4 w-[400px] md:w-[500px] lg:w-[600px] grid-cols-1 md:grid-cols-2">
						{item.items.map((subItem) => (
							<li key={subItem.title}>
								<NavigationMenuLink asChild>
									<Link
										className="flex select-none text-base gap-4 rounded-md p-3 leading-none no-underline "
										href={subItem.url}
									>
										{subItem.icon}
										<div>
											<div className="text-sm font-semibold">
												{subItem.title}
											</div>
											{subItem.description && (
												<p className="text-sm leading-snug">
													{subItem.description}
												</p>
											)}
										</div>
									</Link>
								</NavigationMenuLink>
							</li>
						))}
					</ul>
				</NavigationMenuContent>
			</NavigationMenuItem>
		);
	}

	return (
		<NavigationMenuItem key={item.title}>
			{item.title === "Locum Site" ? (
				<a
					className={cn(
						"group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground",
						item.className || "text-muted-foreground",
						item.title === "Locum Site" && "bg-background",
					)}
					href={item.url}
				>
					{item.icon && <span className="mr-2">{item.icon}</span>}
					{item.title}
				</a>
			) : (
				<Link
					className={cn(
						"group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground",
						item.className || "text-muted-foreground",
					)}
					href={item.url}
				>
					{item.icon && <span className="mr-2">{item.icon}</span>}
					{item.title}
				</Link>
			)}
		</NavigationMenuItem>
	);
};

const renderMobileMenuItem = (item: MenuItem) => {
	if (item.items) {
		return (
			<AccordionItem key={item.title} value={item.title} className="border-b-0">
				<AccordionTrigger className="py-2 text-base font-semibold hover:no-underline">
					{item.title}
				</AccordionTrigger>
				<AccordionContent className="mt-2">
					{item.items.map((subItem) => (
						<Link
							key={subItem.title}
							className="flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
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
			className={cn("flex items-center font-semibold py-2", item.className)}
		>
			{item.icon && <span className="mr-2">{item.icon}</span>}
			{item.title}
		</Link>
	);
};

export { NavbarEmployer };
