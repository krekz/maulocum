"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { client } from "@/lib/rpc-client";

export default function FacilitiesVerificationsPage() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["facilities", "verifications"],
		queryFn: async () => {
			const response =
				await client.api.v2.admin.facilities.verifications.$get();
			if (!response.ok) {
				throw new Error("Failed to fetch verifications");
			}
			return response.json();
		},
	});

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
						<Badge variant="secondary">{data?.count || 0} Pending</Badge>
					</div>
				</CardHeader>
				<CardContent>
					{!data?.verifications || data.verifications.length === 0 ? (
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
									{data.verifications.map((verification) => (
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
												<Button size="sm" variant="default">
													Review
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
