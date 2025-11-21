import type { Session } from "better-auth";
import type { Prisma } from "../../../../prisma/generated/prisma/client";

// Define the facility profile type from middleware
type FacilityProfileContext = Prisma.UserFacilityProfileGetPayload<{
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
export type AppVariables = {
	facilityProfile: FacilityProfileContext;
	doctorProfile: DoctorProfileContext;
	session: Session;
};
