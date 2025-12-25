"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Mail, User, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/lib/rpc";
import { DeleteStaffDialog } from "./_components/delete-staff-dialog";
import { InviteStaffDialog } from "./_components/invite-staff-dialog";

export default function StaffsPage() {
	const queryClient = useQueryClient();

	const {
		data: staffsResult,
		isLoading: staffsLoading,
		error: staffsError,
	} = useQuery({
		queryKey: ["employer", "facility", "staffs"],
		queryFn: async () => {
			const res = await client.api.v2.facilities.staffs.$get();
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || "Failed to fetch staffs");
			}
			return res.json();
		},
		retry: 1,
	});

	const { data: invitationsResult } = useQuery({
		queryKey: ["employer", "facility", "invitations"],
		queryFn: async () => {
			const res = await client.api.v2.facilities.staffs.invitations.$get();
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || "Failed to fetch invitations");
			}
			return res.json();
		},
		retry: 1,
	});

	const revokeInviteMutation = useMutation({
		mutationFn: async (invitationId: string) => {
			const res = await client.api.v2.facilities.staffs.invitations[
				":id"
			].$delete({
				param: { id: invitationId },
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to revoke invitation");
			}

			return res.json();
		},
		onSuccess: () => {
			toast.success("Invitation revoked successfully");
			queryClient.invalidateQueries({
				queryKey: ["employer", "facility", "invitations"],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to revoke invitation");
		},
	});

	const staffs = staffsResult?.data;
	const invitations = invitationsResult?.success ? invitationsResult.data : [];

	if (staffsLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	if (staffsError instanceof Error) {
		return <div className="text-destructive">Error: {staffsError.message}</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Staff Management
					</h1>
					<p className="text-muted-foreground">
						Manage your facility staff members and invitations
					</p>
				</div>
				<InviteStaffDialog />
			</div>

			<Separator />

			{invitations.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Clock className="h-5 w-5" />
							Pending Invitations ({invitations.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{invitations.map((invitation) => (
								<div
									key={invitation.id}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
											<Mail className="h-5 w-5 text-muted-foreground" />
										</div>
										<div>
											<div className="font-medium">{invitation.email}</div>
											<div className="text-sm text-muted-foreground">
												Invited{" "}
												{new Date(invitation.createdAt).toLocaleDateString()}
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="outline">{invitation.role}</Badge>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => revokeInviteMutation.mutate(invitation.id)}
											disabled={revokeInviteMutation.isPending}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Active Staff ({staffs?.length ?? 0})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{staffs?.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<User className="h-12 w-12 text-muted-foreground/50 mb-2" />
							<p className="text-muted-foreground">No staff members yet</p>
							<p className="text-sm text-muted-foreground">
								Invite users to join your facility
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{staffs?.map((staff) => (
								<div
									key={staff.id}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
											<User className="h-5 w-5 text-primary" />
										</div>
										<div>
											<div className="font-medium">
												{staff.user?.name ?? "Unknown"}
											</div>
											<div className="text-sm text-muted-foreground">
												{staff.user?.email ?? ""}
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant={staff.isActive ? "default" : "secondary"}>
											{staff.role}
										</Badge>
										{!staff.isActive && (
											<Badge variant="outline">Inactive</Badge>
										)}
										<DeleteStaffDialog
											staffId={staff.id}
											staffName={staff.user?.name ?? "this staff member"}
										/>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
