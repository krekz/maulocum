import { HTTPException } from "hono/http-exception";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type {
	CreateContactInfoInput,
	CreateFacilityInput,
	CreateReviewInput,
	FacilityQuery,
	UpdateFacilityInput,
} from "../types/facilities.types";

// Facility Service (Single Responsibility Principle)
export class FacilityService {
	// Create a new facility
	async createFacility(data: CreateFacilityInput, headers: Headers) {
		const session = await auth.api.getSession({
			headers,
		});

		if (!session) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}

		return prisma.facility.create({
			data: {
				...data,
				createdAt: new Date(),
				updatedAt: new Date(),
				ownerId: session.user.id,
			},
			include: {
				owner: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				_count: {
					select: {
						jobs: true,
						reviews: true,
					},
				},
			},
		});
	}

	// Get facility by ID
	async getFacilityById(id: string) {
		return prisma.facility.findUnique({
			where: { id },
			include: {
				owner: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				jobs: {
					where: { status: "OPEN" },
					orderBy: { createdAt: "desc" },
					take: 10,
				},
				reviews: {
					orderBy: { createdAt: "desc" },
					take: 10,
				},
				contactInfo: true,
				_count: {
					select: {
						jobs: true,
						reviews: true,
					},
				},
			},
		});
	}

	// Get all facilities with filters and pagination
	async getFacilities(query: FacilityQuery) {
		const { ownerId, search, page, limit } = query;

		const where: any = {};

		if (ownerId) where.ownerId = ownerId;
		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ address: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			];
		}

		const skip = (page - 1) * limit;

		const [facilities, total] = await Promise.all([
			prisma.facility.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					owner: {
						select: {
							id: true,
							name: true,
						},
					},
					_count: {
						select: {
							jobs: true,
							reviews: true,
						},
					},
				},
			}),
			prisma.facility.count({ where }),
		]);

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

	// Update facility
	async updateFacility(id: string, data: UpdateFacilityInput) {
		return prisma.facility.update({
			where: { id },
			data,
		});
	}

	// Delete facility
	async deleteFacility(id: string) {
		return prisma.facility.delete({
			where: { id },
		});
	}

	// Add contact info to facility
	async addContactInfo(data: CreateContactInfoInput) {
		return prisma.contactInfo.create({
			data,
		});
	}

	// Add review to facility
	async addReview(data: CreateReviewInput) {
		return prisma.review.create({
			data,
		});
	}

	// Get facility reviews
	async getFacilityReviews(facilityId: string) {
		return prisma.review.findMany({
			where: { facilityId },
			orderBy: { createdAt: "desc" },
		});
	}

	// Get facility contact info
	async getFacilityContactInfo(facilityId: string) {
		return prisma.contactInfo.findMany({
			where: { facilityId },
		});
	}
}

// Export singleton instance
export const facilityService = new FacilityService();
