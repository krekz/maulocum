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

interface DoctorVerification {
	apcNumber: string | null;
	specialty: string | null;
	yearsOfExperience: number | null;
	location: string | null;
}

interface Doctor {
	id: string;
	name: string | null;
	email: string;
	location: string | null;
	doctorProfile: DoctorVerification | null;
}

interface DoctorsTableProps {
	doctors: Doctor[];
}

export function DoctorsTable({ doctors }: DoctorsTableProps) {
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
					{doctors.map((doctor) => (
						<TableRow key={doctor.id}>
							<TableCell className="font-medium">{doctor.name}</TableCell>
							<TableCell className="text-sm text-muted-foreground">
								{doctor.email}
							</TableCell>
							<TableCell>{doctor.doctorProfile?.apcNumber || "N/A"}</TableCell>
							<TableCell>
								{doctor.doctorProfile?.specialty || "Not specified"}
							</TableCell>
							<TableCell>
								{doctor.doctorProfile?.yearsOfExperience || 0} years
							</TableCell>
							<TableCell>
								{doctor.doctorProfile?.location || doctor.location || "N/A"}
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
