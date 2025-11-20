import type { Session } from "better-auth";
import type { Prisma } from "../../../../prisma/generated/prisma";

// Define the facility profile type from middleware
export type FacilityProfileContext = Prisma.UserFacilityProfileGetPayload<{
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

// Extend Hono context with custom variables
export type AppVariables = {
	facilityProfile: FacilityProfileContext;
	session: Session;
};
