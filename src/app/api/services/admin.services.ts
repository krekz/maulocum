import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
import type { FacilityQuery } from "../types/facilities.types";

class AdminService {
	// Get all facilities for admin with full details
	async getAdminFacilities(query: FacilityQuery) {
		const { ownerId, search, page, limit } = query;

		const where: Prisma.FacilityWhereInput = {};

		if (ownerId) where.ownerId = ownerId;
		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ address: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			];
		}

		const skip = (page - 1) * limit;

		const facilities = await prisma.facility.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				owner: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				facilityVerification: true,
				contactInfo: true,
				reviews: true,
				jobs: true,
				userFacilityProfiles: true,
				_count: {
					select: {
						jobs: true,
						reviews: true,
					},
				},
			},
		});

		const total = await prisma.facility.count({ where });

		return {
			facilities,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}
}

export const adminService = new AdminService();
