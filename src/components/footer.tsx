"use client";

import {
	Facebook,
	Instagram,
	Linkedin,
	Moon,
	Send,
	Sun,
	Twitter,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

function Footerdemo() {
	const [isDarkMode, setIsDarkMode] = React.useState(false);

	React.useEffect(() => {
		if (isDarkMode) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [isDarkMode]);

	return (
		<footer className="relative border-t bg-background text-foreground transition-colors duration-300">
			<div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
				<div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
					<div className="relative">
						<h2 className="mb-4 text-3xl font-bold tracking-tight">
							Stay Connected
						</h2>
						<p className="mb-6 text-muted-foreground">
							Join our newsletter for the latest updates and exclusive offers.
						</p>
						<form className="relative">
							<Input
								type="email"
								placeholder="Enter your email"
								className="w-full h-10 sm:h-12 pl-4 pr-12 rounded-full backdrop-blur-sm placeholder:text-muted-foreground"
							/>
							<Button
								type="submit"
								size="icon"
								className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
							>
								<Send className="h-4 w-4" />
								<span className="sr-only">Subscribe</span>
							</Button>
						</form>
						<div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
					</div>
					<div>
						<h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
						<nav className="space-y-2 text-sm">
							<Link
								href="/"
								className="block transition-colors hover:text-primary"
							>
								Home
							</Link>
							<Link
								href="/about"
								className="block transition-colors hover:text-primary"
							>
								About Maulocum
							</Link>
							<Link
								href="/support"
								className="block transition-colors hover:text-primary"
							>
								System Support
							</Link>
							<Link
								href="/privacy"
								className="block transition-colors hover:text-primary"
							>
								Privacy Policy
							</Link>
							<Link
								href="/terms"
								className="block transition-colors hover:text-primary"
							>
								Terms of Service
							</Link>
						</nav>
					</div>
					<div>
						<h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
						<address className="space-y-2 text-sm not-italic">
							<p>Kulliyyah of Information & Communication Technology (KICT)</p>
							<p>International Islamic University Malaysia (IIUM)</p>
							<p>Jalan Gombak, 53100 Kuala Lumpur, Malaysia</p>
							<p>
								Email:{" "}
								<a
									href="mailto:maulocum.project@iium.edu.my"
									className="underline underline-offset-2 hover:text-foreground"
								>
									maulocum.project@gmail.com
								</a>
							</p>
						</address>
					</div>
					<div className="relative">
						<h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
						<div className="mb-6 flex space-x-4">
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="outline"
											size="icon"
											className="rounded-full"
										>
											<Facebook className="h-4 w-4" />
											<span className="sr-only">Facebook</span>
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Follow us on Facebook</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="outline"
											size="icon"
											className="rounded-full"
										>
											<Twitter className="h-4 w-4" />
											<span className="sr-only">Twitter</span>
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Follow us on Twitter</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="outline"
											size="icon"
											className="rounded-full"
										>
											<Instagram className="h-4 w-4" />
											<span className="sr-only">Instagram</span>
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Follow us on Instagram</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="outline"
											size="icon"
											className="rounded-full"
										>
											<Linkedin className="h-4 w-4" />
											<span className="sr-only">LinkedIn</span>
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Connect with us on LinkedIn</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						</div>
						<div className="flex items-center space-x-2">
							<Sun className="h-4 w-4" />
							<Switch
								id="dark-mode"
								checked={isDarkMode}
								onCheckedChange={setIsDarkMode}
							/>
							<Moon className="h-4 w-4" />
							<Label htmlFor="dark-mode" className="sr-only">
								Toggle dark mode
							</Label>
						</div>
					</div>
				</div>
				<div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
					<p className="text-sm text-muted-foreground">
						© 2025 MauLocum. Developed as an IIUM Final Year Project.
					</p>
					<nav className="flex gap-4 text-sm">
						<Link href="#" className="transition-colors hover:text-primary">
							Cookie Settings
						</Link>
					</nav>
				</div>
			</div>
		</footer>
	);
}

export { Footerdemo };
