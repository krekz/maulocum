"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getFacilityName() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			throw new Error("Unauthorized");
		}

		// Get user's facility profile
		const userFacilityProfile = await prisma.staffProfile.findUnique({
			where: {
				userId: session.user.id,
			},
			include: {
				facility: {
					select: {
						name: true,
					},
				},
			},
		});

		if (!userFacilityProfile?.facility) {
			return null;
		}

		return userFacilityProfile.facility.name;
	} catch (error) {
		console.error("Error fetching facility name:", error);
		return null;
	}
}
