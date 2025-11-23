"use client";

import { IconDotsVertical } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { VerifiedVerificationsProps } from "@/lib/rpc";

export function DoctorsTable({
	doctors,
}: {
	doctors: VerifiedVerificationsProps["data"];
}) {
	const docs = doctors?.doctors;
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>APC Number</TableHead>
						<TableHead>Specialty</TableHead>
						<TableHead>Experience</TableHead>
						<TableHead>Location</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{docs?.map((doctor) => (
						<TableRow key={doctor.id}>
							<TableCell className="font-medium">{doctor.name}</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{doctor.email}
							</TableCell>
							<TableCell>
								{doctor.doctorProfile?.doctorVerification?.apcNumber || "N/A"}
							</TableCell>
							<TableCell>
								{doctor.doctorProfile?.doctorVerification?.specialty ||
									"Not specified"}
							</TableCell>
							<TableCell>
								{doctor.doctorProfile?.doctorVerification?.yearsOfExperience ||
									0}{" "}
								years
							</TableCell>
							<TableCell>
								{doctor.doctorProfile?.doctorVerification?.location ||
									doctor.location ||
									"N/A"}
							</TableCell>
							<TableCell>
								<Badge variant="default">Verified</Badge>
							</TableCell>
							<TableCell className="text-right">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" className="h-8 w-8 p-0">
											<IconDotsVertical className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem>View Profile</DropdownMenuItem>
										<DropdownMenuItem>View APC Document</DropdownMenuItem>
										<DropdownMenuItem className="text-red-600">
											Revoke Verification
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
