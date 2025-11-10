"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Check, ExternalLink, FileText, X } from "lucide-react";
import Link from "next/link";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useFacilityVerificationAction } from "@/lib/hooks/useAdminFacilities";
import { client } from "@/lib/rpc-client";

export default function FacilitiesVerificationsPage() {
	const [selectedVerification, setSelectedVerification] = useState<
		string | null
	>(null);
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");

	const verificationAction = useFacilityVerificationAction();
	const { data, isLoading, error } = useQuery({
		queryKey: ["admin", "facilities", "verifications"],
		queryFn: async () => {
			const response =
				await client.api.v2.admin.facilities.verifications.pendings.$get();
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to fetch verifications");
			}
			return response.json();
		},
	});

	const handleApprove = async (verificationId: string) => {
		try {
			await verificationAction.mutateAsync({
				verificationId,
				action: "APPROVE",
			});
			toast.success("Facility verification approved successfully");
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
			toast.success("Facility verification rejected");
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

	if (isLoading) {
		return (
			<div className="px-3">
				<Card>
					<CardHeader>
						<CardTitle>Loading...</CardTitle>
					</CardHeader>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="px-3">
				<Card>
					<CardHeader>
						<CardTitle>Error</CardTitle>
						<CardDescription className="text-destructive">
							{error.message}
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="px-3">
			<Card>
				<CardHeader>
					<CardTitle>Pending Facility Verifications</CardTitle>
					<CardDescription>
						Review and verify facility registration requests
					</CardDescription>
					<div className="flex items-center gap-2 mt-2">
						<Badge variant="secondary">{data?.data?.count || 0} Pending</Badge>
					</div>
				</CardHeader>
				<CardContent>
					{!data?.data?.verifications ||
					data?.data?.verifications.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No pending verifications
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Facility Name</TableHead>
										<TableHead>Owner</TableHead>
										<TableHead>Contact</TableHead>
										<TableHead>Address</TableHead>
										<TableHead>Documents</TableHead>
										<TableHead>Submitted</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data?.data?.verifications.map((verification) => (
										<TableRow key={verification.id}>
											<TableCell className="font-medium">
												{verification.facility.name}
											</TableCell>
											<TableCell>
												<div className="flex flex-col">
													<span className="font-medium">
														{verification.facility.owner.name}
													</span>
													<span className="text-sm text-muted-foreground">
														{verification.facility.owner.email}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex flex-col text-sm">
													<span>{verification.facility.contactEmail}</span>
													<span className="text-muted-foreground">
														{verification.facility.contactPhone}
													</span>
												</div>
											</TableCell>
											<TableCell className="max-w-xs truncate">
												{verification.facility.address}
											</TableCell>
											<TableCell>
												<div className="flex gap-2">
													{verification.businessDocumentUrl && (
														<Link
															href={verification.businessDocumentUrl}
															target="_blank"
															rel="noopener noreferrer"
														>
															<Button variant="outline" size="sm">
																<FileText className="h-4 w-4 mr-1" />
																SSM
																<ExternalLink className="h-3 w-3 ml-1" />
															</Button>
														</Link>
													)}
													{verification.licenseDocumentUrl && (
														<Link
															href={verification.licenseDocumentUrl}
															target="_blank"
															rel="noopener noreferrer"
														>
															<Button variant="outline" size="sm">
																<FileText className="h-4 w-4 mr-1" />
																License
																<ExternalLink className="h-3 w-3 ml-1" />
															</Button>
														</Link>
													)}
												</div>
											</TableCell>
											<TableCell>
												{format(
													new Date(verification.createdAt),
													"MMM dd, yyyy",
												)}
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													{verification.verificationStatus}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-2">
													<Button
														size="sm"
														variant="default"
														onClick={() => handleApprove(verification.id)}
														disabled={verificationAction.isPending}
													>
														<Check className="h-4 w-4 mr-1" />
														Approve
													</Button>
													<Button
														size="sm"
														variant="destructive"
														onClick={() => openRejectDialog(verification.id)}
														disabled={verificationAction.isPending}
													>
														<X className="h-4 w-4 mr-1" />
														Reject
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Facility Verification</DialogTitle>
						<DialogDescription>
							Please provide a reason for rejecting this facility verification
							request.
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
