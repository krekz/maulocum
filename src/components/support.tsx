"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SupportFormValues = {
	email: string;
	issueType: string;
	message: string;
};

export default function SupportPage() {
	const form = useForm<SupportFormValues>({
		defaultValues: {
			email: "",
			issueType: "",
			message: "",
		},
	});

	function onSubmit(data: SupportFormValues) {
		// For FYP: log / send to backend / email service
		console.log("Support request submitted:", data);
	}

	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
			<h1 className="mb-2 text-xl font-semibold">Support & Help</h1>
			<p className="mb-6 text-sm text-muted-foreground">
				Use this form to report bugs, account access issues, or other
				platform-related concerns. Our team will review your request.
			</p>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					{/* Email */}
					<FormField
						control={form.control}
						name="email"
						rules={{ required: "Email is required" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email address</FormLabel>
								<FormControl>
									<Input type="email" placeholder="your@email.com" {...field} />
								</FormControl>
								<FormDescription>
									We will use this email to respond to your request.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Issue Type */}
					<FormField
						control={form.control}
						name="issueType"
						rules={{ required: "Please select an issue type" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Issue type</FormLabel>
								<FormControl>
									<select
										{...field}
										className="h-9 w-full rounded-md border border-gray-500 bg-transparent px-3 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
									>
										<option value="">Select an issue</option>
										<option value="bug">Report a bug</option>
										<option value="account">Cannot access account</option>
										<option value="verification">Verification problem</option>
										<option value="other">Other</option>
									</select>
								</FormControl>
								<FormDescription>
									Choose the category that best describes your issue.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Message */}
					<FormField
						control={form.control}
						name="message"
						rules={{ required: "Please describe the issue" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Issue description</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Describe the issue you are facing..."
										rows={5}
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Do not include passwords or sensitive personal data.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full sm:w-auto">
						Submit request
					</Button>
				</form>
			</Form>
		</div>
	);
}
