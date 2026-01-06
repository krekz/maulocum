"use client";

import { GalleryVerticalEnd, Minus, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import type * as React from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarUser } from "./sidebar-user";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "./ui/collapsible";

interface Sidebarmain {
	header: {
		title: string;
		url: string;
	};
	basic: Array<{
		title: string;
		url: string;
		badge?: number;
	}>;
	collapsible: Array<{
		title: string;
		url: string;
		badge?: number;
		items?: Array<{
			title: string;
			url: string;
			badge?: number;
		}>;
	}>;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	main: Sidebarmain;
	secondaryNav?: {
		title: string;
		url: string;
		icon: React.ComponentType<{ className?: string }>;
	}[];
	user: {
		name?: string;
		email?: string;
		avatar?: string;
	};
	logout: () => void;
}

export function AppSidebar({
	main,
	secondaryNav,
	user,
	logout,
	...props
}: AppSidebarProps) {
	const pathname = usePathname();

	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<a href={main.header.url}>
								<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<GalleryVerticalEnd className="size-4" />
								</div>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-medium">{main.header.title}</span>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						{main.basic.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild isActive={pathname === item.url}>
									<a
										href={item.url}
										className="flex items-center justify-between w-full"
									>
										<span>{item.title}</span>
										{item.badge !== undefined && item.badge > 0 && (
											<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground px-1.5">
												{item.badge > 99 ? "99+" : item.badge}
											</span>
										)}
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
						{main.collapsible.map((item) => (
							<Collapsible
								key={item.title}
								defaultOpen={item.items?.some(
									(subItem) => pathname === subItem.url,
								)}
								className="group/collapsible"
							>
								<SidebarMenuItem>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton>
											<span className="flex items-center gap-2">
												{item.title}
												{item.badge !== undefined && item.badge > 0 && (
													<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground px-1.5">
														{item.badge > 99 ? "99+" : item.badge}
													</span>
												)}
											</span>
											<Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
											<Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									{item.items?.length ? (
										<CollapsibleContent>
											<SidebarMenuSub>
												{item.items.map((subItem) => (
													<SidebarMenuSubItem key={subItem.title}>
														<SidebarMenuSubButton
															asChild
															isActive={pathname === subItem.url}
														>
															<a
																href={subItem.url}
																className="flex items-center justify-between w-full"
															>
																<span>{subItem.title}</span>
																{subItem.badge !== undefined &&
																	subItem.badge > 0 && (
																		<span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground px-1">
																			{subItem.badge > 99
																				? "99+"
																				: subItem.badge}
																		</span>
																	)}
															</a>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												))}
											</SidebarMenuSub>
										</CollapsibleContent>
									) : null}
								</SidebarMenuItem>
							</Collapsible>
						))}
					</SidebarMenu>
				</SidebarGroup>

				{/* Bottom sidebar */}
				{secondaryNav && (
					<SidebarGroup {...props}>
						<SidebarGroupContent>
							<SidebarMenu>
								{secondaryNav?.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild>
											<a href={item.url}>
												<item.icon />
												<span>{item.title}</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarContent>
			<SidebarFooter>
				<SidebarUser user={user} logout={logout} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
