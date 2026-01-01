import Image from "next/image";
import { UserAuthForm } from "./auth-form";

export default function SignIn2() {
	return (
		<div className="relative px-4 w-full grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
			<div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
				<div className="absolute inset-0 bg-zinc-900" />
				<Image
					src="/doctors_illustration.svg"
					className="relative m-auto rounded-lg"
					width={600}
					height={60}
					alt="MauLocum"
				/>

				<div className="relative z-20 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-lg">
							&ldquo;MauLocum has transformed how I find medical shifts. The
							platform is intuitive, reliable, and has significantly improved my
							work-life balance as a healthcare professional.&rdquo;
						</p>
						<footer className="text-sm">John Doe</footer>
					</blockquote>
				</div>
			</div>
			<div className="flex items-center justify-center w-full">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
					<div className="flex flex-col space-y-2 text-center">
						<h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
						<p className="text-muted-foreground text-sm">
							Sign in to your account to continue
						</p>
					</div>
					<div className="rounded-lg border p-6 shadow-sm">
						<UserAuthForm />
					</div>

					<p className="text-muted-foreground text-center text-xs">
						By continuing, you agree to our{" "}
						<a
							href="/terms"
							className="hover:text-primary underline underline-offset-4 font-medium"
						>
							Terms of Service
						</a>{" "}
						and{" "}
						<a
							href="/privacy"
							className="hover:text-primary underline underline-offset-4 font-medium"
						>
							Privacy Policy
						</a>
						.
					</p>
				</div>
			</div>
		</div>
	);
}
