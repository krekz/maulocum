"use client";

import { IconCheck, IconFileText, IconUser, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	usePendingVerifications,
	useVerificationAction,
} from "@/lib/hooks/useAdminDoctors";

function DoctorVerificationsPage() {
	const { data, isLoading, error } = usePendingVerifications();
	const verificationAction = useVerificationAction();

	const [selectedVerification, setSelectedVerification] = useState<
		string | null
	>(null);
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");

	const verifications = data?.data?.verifications || [];
	const count = data?.data?.count || 0;

	const handleApprove = async (verificationId: string) => {
		try {
			await verificationAction.mutateAsync({
				verificationId,
				action: "APPROVE",
			});
			toast.success("Verification approved successfully");
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to approve verification",
			);
		}
	};

	const handleReject = async () => {
		if (!selectedVerification || !rejectionReason.trim()) {
			toast.error("Please provide a rejection reason");
			return;
		}

		try {
			await verificationAction.mutateAsync({
				verificationId: selectedVerification,
				action: "REJECT",
				rejectionReason: rejectionReason.trim(),
			});
			toast.success("Verification rejected");
			setRejectDialogOpen(false);
			setRejectionReason("");
			setSelectedVerification(null);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to reject verification",
			);
		}
	};

	const openRejectDialog = (verificationId: string) => {
		setSelectedVerification(verificationId);
		setRejectDialogOpen(true);
	};

	switch (error?.cause) {
		case 404:
			return (
				<Card>
					<CardContent className="pt-6">
						<p className="text-muted-foreground text-center">
							No verifications found.
						</p>
					</CardContent>
				</Card>
			);
		case 500:
			return (
				<Card>
					<CardContent className="pt-6">
						<p className="text-muted-foreground text-center">
							Failed to fetch verifications.
						</p>
					</CardContent>
				</Card>
			);
	}

	return (
		<div className="px-6 w-full mx-auto">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Pending Verifications</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Review and approve doctor verification requests
				</p>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="flex items-center gap-2">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						<p className="text-muted-foreground">Loading verifications...</p>
					</div>
				</div>
			) : error ? (
				<Card className="border-destructive">
					<CardContent className="pt-6">
						<p className="text-destructive text-center">
							Error loading verifications: {error.message}
						</p>
					</CardContent>
				</Card>
			) : verifications.length === 0 ? (
				<Card>
					<CardContent className="pt-6">
						<p className="text-muted-foreground text-center">
							No pending verifications at the moment.
						</p>
					</CardContent>
				</Card>
			) : (
				<>
					<div className="mb-4">
						<Badge variant="secondary">
							{count} pending request{count !== 1 ? "s" : ""}
						</Badge>
					</div>
					<div className="grid gap-4">
						{verifications.map((verification) => (
							<Card key={verification.id}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
												<IconUser className="h-6 w-6 text-primary" />
											</div>
											<div>
												<CardTitle>{verification.fullName}</CardTitle>
												<CardDescription>
													{verification.user.email}
												</CardDescription>
											</div>
										</div>
										<Badge variant="secondary">Pending</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-4 mb-4">
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Phone
											</p>
											<p className="text-sm">{verification.phoneNumber}</p>
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Location
											</p>
											<p className="text-sm">{verification.location}</p>
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												APC Number
											</p>
											<p className="text-sm font-mono">
												{verification.apcNumber}
											</p>
										</div>
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Experience
											</p>
											<p className="text-sm">
												{verification.yearsOfExperience} years
											</p>
										</div>
										{verification.specialty && (
											<div>
												<p className="text-sm font-medium text-muted-foreground">
													Specialty
												</p>
												<p className="text-sm">{verification.specialty}</p>
											</div>
										)}
										{verification.provisionalId && (
											<div>
												<p className="text-sm font-medium text-muted-foreground">
													Provisional ID
												</p>
												<p className="text-sm font-mono">
													{verification.provisionalId}
												</p>
											</div>
										)}
										{verification.fullId && (
											<div>
												<p className="text-sm font-medium text-muted-foreground">
													Full ID
												</p>
												<p className="text-sm font-mono">
													{verification.fullId}
												</p>
											</div>
										)}
									</div>

									<div className="flex items-center gap-2 mb-4">
										<Button variant="outline" size="sm" asChild>
											<a
												href={verification.apcDocumentUrl}
												target="_blank"
												rel="noopener noreferrer"
											>
												<IconFileText className="h-4 w-4 mr-2" />
												View APC Document
											</a>
										</Button>
									</div>

									<div className="flex items-center gap-2">
										<Button
											variant="default"
											size="sm"
											onClick={() => handleApprove(verification.id)}
											disabled={verificationAction.isPending}
										>
											<IconCheck className="h-4 w-4 mr-2" />
											Approve
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => openRejectDialog(verification.id)}
											disabled={verificationAction.isPending}
										>
											<IconX className="h-4 w-4 mr-2" />
											Reject
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</>
			)}

			<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Verification</DialogTitle>
						<DialogDescription>
							Please provide a reason for rejecting this verification request.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="reason">Rejection Reason</Label>
							<Textarea
								id="reason"
								placeholder="Enter the reason for rejection..."
								value={rejectionReason}
								onChange={(e) => setRejectionReason(e.target.value)}
								rows={4}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setRejectDialogOpen(false);
								setRejectionReason("");
							}}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleReject}
							disabled={!rejectionReason.trim() || verificationAction.isPending}
						>
							{verificationAction.isPending ? "Rejecting..." : "Reject"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default DoctorVerificationsPage;
