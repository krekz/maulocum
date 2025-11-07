import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFileKey, uploadToR2 } from "@/lib/r2";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
import type {
	CreateContactInfoInput,
	CreateReviewInput,
	FacilityQuery,
	FacilityRegistrationApiInput,
} from "../types/facilities.types";

// Facility Service (Single Responsibility Principle)
export class FacilityService {
	// Create or Register a new facility
	async createFacility(data: FacilityRegistrationApiInput, c: Context) {
		try {
			const session = await auth.api.getSession({
				headers: c.req.raw.headers,
			});

			if (!session) {
				throw new HTTPException(401, { message: "Unauthorized" });
			}

			// Check if user already has a facility
			const existingFacility = await prisma.facility.findFirst({
				where: { ownerId: session.user.id },
			});

			if (existingFacility) {
				throw new HTTPException(400, {
					message: "User already has a registered facility",
				});
			}

			// Validate file sizes
			const maxSize = 5 * 1024 * 1024; // 5MB
			if (
				data.ssmDocument.size > maxSize ||
				data.clinicLicense.size > maxSize
			) {
				throw new HTTPException(400, {
					message: "File size must be less than 5MB",
				});
			}

			// Validate file types
			const allowedTypes = [
				"application/pdf",
				"image/jpeg",
				"image/png",
				"image/jpg",
			];
			if (
				!allowedTypes.includes(data.ssmDocument.type) ||
				!allowedTypes.includes(data.clinicLicense.type)
			) {
				throw new HTTPException(400, {
					message: "Files must be PDF or image (JPEG, PNG)",
				});
			}

			// Generate unique file keys
			const ssmKey = generateFileKey(session.user.id, data.ssmDocument.name);
			const licenseKey = generateFileKey(
				session.user.id,
				data.clinicLicense.name,
			);

			// Convert Files to Buffers
			const [ssmArrayBuffer, licenseArrayBuffer] = await Promise.all([
				data.ssmDocument.arrayBuffer(),
				data.clinicLicense.arrayBuffer(),
			]);

			const ssmBuffer = Buffer.from(ssmArrayBuffer);
			const licenseBuffer = Buffer.from(licenseArrayBuffer);

			// Upload both files to R2 in parallel
			const [ssmResult, licenseResult] = await Promise.all([
				uploadToR2(ssmBuffer, ssmKey, data.ssmDocument.type),
				uploadToR2(licenseBuffer, licenseKey, data.clinicLicense.type),
			]);

			// Create facility
			const facility = await prisma.facility.create({
				data: {
					name: data.companyName,
					address: data.address,
					contactEmail: data.companyEmail,
					contactPhone: data.companyPhone,
					ownerId: session.user.id,
				},
			});

			// Create facility verification record with uploaded file URLs
			await prisma.facilityVerification.create({
				data: {
					facilityId: facility.id,
					businessRegistrationNo: "PENDING", // Will be extracted from document
					businessDocumentUrl: ssmResult.url,
					licenseDocumentUrl: licenseResult.url,
					verificationStatus: "PENDING",
				},
			});

			return {
				facility,
				message:
					"Facility registration submitted successfully. Verification pending.",
			};
		} catch (error) {
			console.error("Error in facility.service.createFacility:", error);
			throw new HTTPException(500, {
				message: "Failed to create facility",
			});
		}
	}

	async updateFacilityVerificationStatus(
		facilityId: string,
		verificationStatus: Prisma.EnumVerificationStatusFilter,
		rejectionReason?: string,
	) {
		return prisma.facilityVerification.update({
			where: { facilityId },
			data: {
				verificationStatus:
					verificationStatus.equals === "APPROVED" ? "APPROVED" : "REJECTED",
				rejectionReason,
				reviewedAt:
					verificationStatus.equals === "APPROVED" ? new Date() : null,
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
	async updateFacility(id: string, data: FacilityRegistrationApiInput) {
		return prisma.facility.update({
			where: { id },
			data: {
				...data,
				name: data.companyName,
				address: data.address,
				contactEmail: data.companyEmail,
				contactPhone: data.companyPhone,
				updatedAt: new Date(),
			},
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
	async getFacilityByOwnerId(ownerId: string) {
		return prisma.facility.findFirst({
			where: { ownerId },
			include: {
				facilityVerification: true,
			},
		});
	}
}

// Export singleton instance
export const facilityService = new FacilityService();
