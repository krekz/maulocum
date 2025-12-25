"use client";

import { useMutation } from "@tanstack/react-query";
import { Building2, Calendar, CheckCircle2, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { client } from "@/lib/rpc";

interface InvitationData {
	id: string;
	facilityName: string;
	facilityAddress: string;
	role: string;
	status: string;
	expiresAt: string;
	createdAt: string;
}

interface InvitationAcceptanceProps {
	invitation: InvitationData;
	token: string;
}

export function InvitationAcceptance({
	invitation,
	token,
}: InvitationAcceptanceProps) {
	const router = useRouter();

	const respondMutation = useMutation({
		mutationFn: async (action: "accept" | "decline") => {
			const response = await client.api.v2.profile["staff-invitations"][
				":token"
			].respond.$post({
				param: { token },
				json: { action },
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to respond to invitation");
			}

			return response.json();
		},
		onSuccess: (data) => {
			toast.success(data.message);

			setTimeout(() => {
				if (data.message.toLowerCase().includes("staff member")) {
					router.push("/employer/profile");
				} else {
					router.push("/profile");
				}
			}, 2000);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to respond to invitation", {
				style: { backgroundColor: "#fee2e2", color: "#b91c1c" },
			});
		},
	});

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (respondMutation.isSuccess) {
		return (
			<Card className="border-primary/20">
				<CardHeader className="text-center pb-4">
					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
						<CheckCircle2 className="w-8 h-8 text-primary" />
					</div>
					<CardTitle className="text-2xl">Success! 🎉</CardTitle>
					<CardDescription>{respondMutation.data?.message}</CardDescription>
				</CardHeader>
				<CardContent className="text-center">
					<p className="text-sm text-muted-foreground mb-4">
						Redirecting you to your profile...
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold">Staff Invitation</h1>
				<p className="text-muted-foreground">
					You've been invited to join a facility as a staff member
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Building2 className="h-5 w-5 text-primary" />
						Invitation Details
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<div className="flex items-start justify-between">
							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground">
									Facility
								</p>
								<p className="text-lg font-semibold">
									{invitation.facilityName}
								</p>
								<p className="text-sm text-muted-foreground">
									{invitation.facilityAddress}
								</p>
							</div>
						</div>

						<Separator />

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
									<UserCheck className="h-4 w-4" />
									Role
								</p>
								<p className="font-medium">{invitation.role}</p>
							</div>
						</div>

						<Separator />

						<div className="space-y-1">
							<p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
								<Calendar className="h-4 w-4" />
								Invitation Expires
							</p>
							<p className="text-sm">{formatDate(invitation.expiresAt)}</p>
						</div>
					</div>

					<div className="pt-4 space-y-3">
						<Button
							onClick={() => respondMutation.mutate("accept")}
							disabled={respondMutation.isPending}
							className="w-full"
							size="lg"
						>
							{respondMutation.isPending ? (
								<>
									<span className="animate-spin mr-2">⏳</span>
									Processing...
								</>
							) : (
								<>
									<CheckCircle2 className="mr-2 h-5 w-5" />
									Accept Invitation
								</>
							)}
						</Button>

						<Button
							variant="outline"
							onClick={() => respondMutation.mutate("decline")}
							disabled={respondMutation.isPending}
							className="w-full"
						>
							Decline
						</Button>
					</div>

					<p className="text-xs text-center text-muted-foreground">
						By accepting this invitation, you agree to join{" "}
						{invitation.facilityName} as a {invitation.role} staff member.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
