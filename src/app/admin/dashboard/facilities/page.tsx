import { format } from "date-fns";
import { Building2, Mail, MapPin, Phone, User } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
import { backendApi } from "@/lib/rpc-client";

export const dynamic = "force-dynamic";

async function AdminFacilitiesPage() {
	// Fetch facilities from admin API endpoint
	const res = await backendApi.api.v2.admin.facilities.$get({
		query: {
			page: "1",
			limit: "100",
		},
	});

	if (!res.ok) {
		return (
			<div className="container mx-auto py-10">
				<Card>
					<CardHeader>
						<CardTitle>Error</CardTitle>
						<CardDescription className="text-destructive">
							Failed to load facilities. Please try again later.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	const data = await res.json();
	const facilities = data.success ? data.data.facilities : [];

	const getVerificationBadge = (status: string) => {
		switch (status) {
			case "APPROVED":
				return (
					<Badge variant="default" className="bg-green-600">
						Approved
					</Badge>
				);
			case "PENDING":
				return <Badge variant="secondary">Pending</Badge>;
			case "REJECTED":
				return <Badge variant="destructive">Rejected</Badge>;
			default:
				return <Badge variant="outline">Unknown</Badge>;
		}
	};

	return (
		<div className="px-3">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>All Facilities</CardTitle>
							<CardDescription>
								Manage and view all registered healthcare facilities
							</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant="secondary">
								{facilities.length} Total Facilities
							</Badge>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{!facilities || facilities.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							No facilities found
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
										<TableHead>Verification</TableHead>
										<TableHead>Jobs</TableHead>
										<TableHead>Registered</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{facilities.map((facility) => (
										<TableRow key={facility.id}>
											<TableCell>
												<div className="flex items-center gap-2">
													<div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
														<Building2 className="h-4 w-4 text-primary" />
													</div>
													<div>
														<div className="font-medium">{facility.name}</div>
														<div className="text-xs text-muted-foreground">
															ID: {facility.id.slice(0, 8)}...
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex flex-col">
													<div className="flex items-center gap-1">
														<User className="h-3 w-3 text-muted-foreground" />
														<span className="font-medium">
															{facility.owner?.name || "N/A"}
														</span>
													</div>
													<div className="flex items-center gap-1 text-xs text-muted-foreground">
														<Mail className="h-3 w-3" />
														<span>{facility.owner?.email || "N/A"}</span>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex flex-col text-sm">
													<div className="flex items-center gap-1">
														<Mail className="h-3 w-3 text-muted-foreground" />
														<span>{facility.contactEmail}</span>
													</div>
													<div className="flex items-center gap-1 text-muted-foreground">
														<Phone className="h-3 w-3" />
														<span>{facility.contactPhone}</span>
													</div>
												</div>
											</TableCell>
											<TableCell className="max-w-xs">
												<div className="flex items-start gap-1">
													<MapPin className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
													<span className="text-sm line-clamp-2">
														{facility.address}
													</span>
												</div>
											</TableCell>
											<TableCell>
												{getVerificationBadge(
													facility.facilityVerification?.verificationStatus ||
														"PENDING",
												)}
											</TableCell>
											<TableCell>
												<Badge variant="outline">
													{facility._count?.jobs || 0} jobs
												</Badge>
											</TableCell>
											<TableCell>
												<div className="text-sm">
													{format(new Date(facility.createdAt), "MMM dd, yyyy")}
												</div>
											</TableCell>
											<TableCell className="text-right">
												<Link
													href={`/admin/dashboard/facilities/${facility.id}`}
													className={buttonVariants({
														variant: "outline",
														size: "sm",
													})}
												>
													View Details
												</Link>
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

export default AdminFacilitiesPage;
