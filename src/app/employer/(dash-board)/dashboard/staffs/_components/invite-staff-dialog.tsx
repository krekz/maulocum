"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { client } from "@/lib/rpc";

const inviteStaffSchema = z.object({
	email: z.string().email("Invalid email address"),
	role: z.string().min(1, "Role is required"),
});

type InviteStaffFormValues = z.infer<typeof inviteStaffSchema>;

const STAFF_ROLES = [
	{ value: "staff", label: "Staff" },
	{ value: "manager", label: "Manager" },
	{ value: "admin", label: "Admin" },
	{ value: "hr", label: "HR" },
];

export function InviteStaffDialog() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const form = useForm<InviteStaffFormValues>({
		resolver: zodResolver(inviteStaffSchema),
		defaultValues: {
			email: "",
			role: "staff",
		},
	});

	const inviteMutation = useMutation({
		mutationFn: async (data: InviteStaffFormValues) => {
			const res = await client.api.v2.facilities.staffs.invite.$post({
				json: data,
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to send invitation");
			}

			return res.json();
		},
		onSuccess: () => {
			toast.success("Staff invitation has been sent successfully.");
			queryClient.invalidateQueries({
				queryKey: ["employer", "facility", "staffs"],
			});
			queryClient.invalidateQueries({
				queryKey: ["employer", "facility", "invitations"],
			});
			form.reset();
			setOpen(false);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to send invitation");
		},
	});

	const onSubmit = (data: InviteStaffFormValues) => {
		inviteMutation.mutate(data);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<UserPlus className="h-4 w-4 mr-2" />
					Invite Staff
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Invite Staff Member</DialogTitle>
					<DialogDescription>
						Send an invitation to a user to join your facility as a staff
						member. The user must have a verified phone number.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Address</FormLabel>
									<FormControl>
										<Input
											placeholder="user@example.com"
											type="email"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Enter the email of the user you want to invite
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a role" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{STAFF_ROLES.map((role) => (
												<SelectItem key={role.value} value={role.value}>
													{role.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormDescription>
										Assign a role to the staff member
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={inviteMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={inviteMutation.isPending}>
								{inviteMutation.isPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Send Invitation
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
