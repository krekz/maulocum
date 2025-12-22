import type { Session } from "better-auth";
import type { UserType } from "@/lib/auth";
import type { Prisma } from "../../../../prisma/generated/prisma/client";

// Define the facility profile type from middleware
type StaffProfileContext = Prisma.StaffProfileGetPayload<{
	include: {
		user: true;
		facility: {
			include: {
				facilityVerification: true;
				contactInfo: true;
				reviews: true;
			};
		};
	};
}>;

// Define the doctor profile type from middleware
type DoctorProfileContext = Prisma.DoctorProfileGetPayload<{
	include: {
		user: true;
	};
}>;

// Extend Hono context with custom variables
export type DoctorVariables = {
	doctorProfile: DoctorProfileContext;
	session: Session;
	user: UserType;
};

export type ProfileVariables = {
	session: Session;
	user: UserType;
};

export type FacilityVariables = {
	staffProfile: StaffProfileContext;
	session: Session;
	user: UserType;
};
