"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconBrandGoogle, IconLock } from "@tabler/icons-react";
import { type HTMLAttributes, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>;

const formSchema = z.object({
	email: z.email({ message: "Please enter a valid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [callbackURL, setCallbackURL] = useState("/jobs");

	useEffect(() => {
		// Get the referrer (previous page) from browser history
		const referrer = document.referrer;

		if (referrer) {
			try {
				const referrerUrl = new URL(referrer);
				const currentUrl = new URL(window.location.href);

				// Only use referrer if it's from the same origin and not the login page
				if (
					referrerUrl.origin === currentUrl.origin &&
					!referrerUrl.pathname.includes("/login")
				) {
					setCallbackURL(referrerUrl.pathname + referrerUrl.search);
				}
			} catch (error) {
				console.error("Error parsing referrer:", error);
			}
		}
	}, []);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL,
			});
		} catch (error) {
			console.error("Google sign-in error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	async function onSubmit(data: z.infer<typeof formSchema>) {
		setIsLoading(true);
		try {
			const result = await authClient.signIn.email({
				email: data.email,
				password: data.password,
				callbackURL,
			});

			if (result.error) {
				console.error("Sign-in error:", result.error);
			}
		} catch (error) {
			console.error("Sign-in error:", error);
		} finally {
			setIsLoading(false);
		}
	}

	// Magic Link (Disabled for now)
	// async function onSubmit(data: z.infer<typeof formSchema>) {
	// 	setIsLoading(true);
	// 	try {
	// 		const result = await authClient.signIn.magicLink({
	// 			email: data.email,
	// 			callbackURL: "/jobs",
	// 		});
	// 		if (result.error) {
	// 			console.error("Magic link error:", result.error);
	// 		} else {
	// 			setMagicLinkSent(true);
	// 		}
	// 	} catch (error) {
	// 		console.error("Magic link error:", error);
	// 	} finally {
	// 		setIsLoading(false);
	// 	}
	// }

	return (
		<div className={cn("space-y-5", className)} {...props}>
			{/* Google Sign-In */}
			<Button
				variant="outline"
				type="button"
				disabled={isLoading}
				onClick={handleGoogleSignIn}
				className="w-full h-11 text-sm font-medium"
			>
				<IconBrandGoogle className="mr-2 h-5 w-5" />
				Continue with Google
			</Button>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-card text-muted-foreground px-3">
						Or continue with email
					</span>
				</div>
			</div>

			{/* Email & Password Form */}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										type="email"
										placeholder="you@example.com"
										className="h-11"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input
										type="password"
										placeholder="••••••••"
										className="h-11"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						type="submit"
						disabled={isLoading}
						className="w-full h-11 text-sm font-medium"
					>
						{isLoading ? (
							<>
								<span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
								Signing in...
							</>
						) : (
							<>
								<IconLock className="mr-2 h-4 w-4" />
								Sign In
							</>
						)}
					</Button>
				</form>
			</Form>
		</div>
	);
}
