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
import type { JobPostFormValues } from "../types/jobs.types";

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
			const maxSize = 1 * 1024 * 1024; // 1MB
			if (
				data.ssmDocument.size > maxSize ||
				data.clinicLicense.size > maxSize
			) {
				throw new HTTPException(400, {
					message: "File size must be less than 1MB",
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
			if (error instanceof HTTPException) {
				throw error;
			}
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
	// Use for general facility information
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
		try {
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

			if (!facilities.length || !total) {
				throw new HTTPException(404, {
					message: "Facilities not found",
				});
			}

			return {
				facilities,
				pagination: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
				},
			};
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, { message: "Failed to fetch facilities" });
		}
	}

	// Update facility
	async updateFacility(id: string, data: FacilityRegistrationApiInput) {
		try {
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
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, { message: "Failed to update facility" });
		}
	}

	// Delete facility
	async deleteFacility(id: string) {
		try {
			return prisma.facility.delete({
				where: { id },
			});
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, { message: "Failed to delete facility" });
		}
	}

	// Add contact info to facility
	async addContactInfo(data: CreateContactInfoInput) {
		try {
			return prisma.contactInfo.create({
				data,
			});
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, { message: "Failed to add contact info" });
		}
	}

	// Add review to facility
	async addReview(data: CreateReviewInput) {
		try {
			return prisma.review.create({
				data,
			});
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, { message: "Failed to add review" });
		}
	}

	// Get facility reviews
	async getFacilityReviews(facilityId: string) {
		try {
			return prisma.review.findMany({
				where: { facilityId },
				orderBy: { createdAt: "desc" },
			});
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to get facility reviews",
			});
		}
	}

	// Get facility contact info
	async getFacilityContactInfo(facilityId: string) {
		try {
			return prisma.contactInfo.findMany({
				where: { facilityId },
			});
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to get facility contact info",
			});
		}
	}

	/**
	 * @deprecated This method is no longer used. Facility profile is now fetched by requireActiveEmployer middleware.
	 * Get facility by owner ID for employer profile
	 */
	async getUserFacilityProfile(userId: string) {
		try {
			const facility = await prisma.userFacilityProfile.findUnique({
				where: {
					userId,
				},
				include: {
					user: true,
					facility: {
						include: {
							facilityVerification: true,
							contactInfo: true,
							reviews: true,
						},
					},
				},
			});

			if (!facility) {
				throw new HTTPException(404, {
					message: "Facility not found",
				});
			}

			if (
				facility.facility.facilityVerification?.verificationStatus !==
				"APPROVED"
			) {
				throw new HTTPException(403, {
					message: "Facility not approved",
				});
			}

			return facility;
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to get user facility profile",
			});
		}
	}

	// Post a job for employer's facility
	async postJob(
		data: JobPostFormValues,
		facilityId: string,
		userFacilityProfileId: string,
	) {
		try {
			// Create the job
			await prisma.job.create({
				data: {
					...data,
					facilityId,
					userFacilityProfileId,
				},
			});
		} catch (error) {
			console.error("Error in facility.service.postJob:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to post job",
			});
		}
	}

	// Get jobs posted by employer's facility
	async getMyFacilityJobs(facilityId: string) {
		try {
			// Get all jobs for this facility
			const jobs = await prisma.job.findMany({
				where: {
					facilityId,
				},
				orderBy: {
					createdAt: "desc",
				},
				include: {
					facility: {
						select: {
							id: true,
							name: true,
							address: true,
						},
					},
					_count: {
						select: {
							applicants: true,
						},
					},
				},
			});

			return jobs;
		} catch (error) {
			console.error("Error in facility.service.getMyFacilityJobs:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to fetch facility jobs",
			});
		}
	}
	async getJobById(id: string, facilityId?: string) {
		try {
			const job = await prisma.job.findUnique({
				where: { id },
			});

			if (!job) {
				throw new HTTPException(404, {
					message: "Job not found",
				});
			}

			// If facilityId is provided, verify ownership
			if (facilityId && job.facilityId !== facilityId) {
				throw new HTTPException(403, {
					message: "Forbidden - You don't have access to this job",
				});
			}

			return job;
		} catch (error) {
			console.error("Error in facility.service.getJobById:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to fetch job",
			});
		}
	}

	// Close a job posting
	async closeJob(jobId: string, facilityId: string) {
		try {
			// First verify the job belongs to this facility
			const job = await prisma.job.findUnique({
				where: { id: jobId },
				select: { facilityId: true, status: true },
			});

			if (!job) {
				throw new HTTPException(404, {
					message: "Job not found",
				});
			}

			// Security: Verify ownership
			if (job.facilityId !== facilityId) {
				throw new HTTPException(403, {
					message: "Forbidden - You don't have access to this job",
				});
			}

			// Check if job is already closed
			if (job.status === "CLOSED") {
				throw new HTTPException(400, {
					message: "Job is already closed",
				});
			}

			// Update job status to CLOSED
			await prisma.job.update({
				where: { id: jobId },
				data: {
					status: "CLOSED",
					updatedAt: new Date(),
				},
			});

			return { success: true };
		} catch (error) {
			console.error("Error in facility.service.closeJob:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to close job",
			});
		}
	}

	// Reopen a closed job posting
	async reopenJob(jobId: string, facilityId: string) {
		try {
			// First verify the job belongs to this facility
			const job = await prisma.job.findUnique({
				where: { id: jobId },
				select: { facilityId: true, status: true },
			});

			if (!job) {
				throw new HTTPException(404, {
					message: "Job not found",
				});
			}

			// Security: Verify ownership
			if (job.facilityId !== facilityId) {
				throw new HTTPException(403, {
					message: "Forbidden - You don't have access to this job",
				});
			}

			// Check if job is not closed
			if (job.status !== "CLOSED") {
				throw new HTTPException(400, {
					message: "Only closed jobs can be reopened",
				});
			}

			// Update job status to OPEN
			await prisma.job.update({
				where: { id: jobId },
				data: {
					status: "OPEN",
					updatedAt: new Date(),
				},
			});

			return { success: true };
		} catch (error) {
			console.error("Error in facility.service.reopenJob:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to reopen job",
			});
		}
	}

	// Get all applicants for a job
	async getJobApplicants(jobId: string, facilityId: string) {
		try {
			// First verify the job belongs to this facility
			const job = await prisma.job.findUnique({
				where: { id: jobId },
				select: { facilityId: true },
			});

			if (!job) {
				throw new HTTPException(404, {
					message: "Job not found",
				});
			}

			// Security: Verify ownership
			if (job.facilityId !== facilityId) {
				throw new HTTPException(403, {
					message: "Forbidden - You don't have access to this job",
				});
			}

			// Get all applicants for this job
			const applicants = await prisma.jobApplication.findMany({
				where: { jobId },
				include: {
					DoctorProfile: {
						select: {
							id: true,
							fullName: true,
							phoneNumber: true,
							location: true,
							specialty: true,
							yearsOfExperience: true,
							verificationStatus: true,
							user: {
								select: {
									email: true,
									image: true,
								},
							},
						},
					},
				},
				orderBy: {
					appliedAt: "desc",
				},
			});

			return applicants;
		} catch (error) {
			console.error("Error in facility.service.getJobApplicants:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to fetch job applicants",
			});
		}
	}

	// Update a job posting
	async updateJob(jobId: string, facilityId: string, data: JobPostFormValues) {
		try {
			// First verify the job belongs to this facility
			const job = await prisma.job.findUnique({
				where: { id: jobId },
				select: { facilityId: true, status: true },
			});

			if (!job) {
				throw new HTTPException(404, {
					message: "Job not found",
				});
			}

			// Security: Verify ownership
			if (job.facilityId !== facilityId) {
				throw new HTTPException(403, {
					message: "Forbidden - You don't have access to this job",
				});
			}

			// Update the job
			const updatedJob = await prisma.job.update({
				where: { id: jobId },
				data,
			});

			return updatedJob;
		} catch (error) {
			console.error("Error in facility.service.updateJob:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to update job",
			});
		}
	}

	// Delete a job posting
	async deleteJob(jobId: string, facilityId: string) {
		try {
			// First verify the job belongs to this facility
			const job = await prisma.job.findUnique({
				where: { id: jobId },
				select: {
					facilityId: true,
					status: true,
					_count: {
						select: {
							applicants: true,
						},
					},
				},
			});

			if (!job) {
				throw new HTTPException(404, {
					message: "Job not found",
				});
			}

			// Security: Verify ownership
			if (job.facilityId !== facilityId) {
				throw new HTTPException(403, {
					message: "Forbidden - You don't have access to this job",
				});
			}

			// Prevent deletion if job has applicants
			if (job._count.applicants > 0) {
				throw new HTTPException(400, {
					message:
						"Cannot delete job with applicants. Please close the job instead.",
				});
			}

			// Delete the job
			await prisma.job.delete({
				where: { id: jobId },
			});

			return { success: true };
		} catch (error) {
			console.error("Error in facility.service.deleteJob:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to delete job",
			});
		}
	}
}

// Export singleton instance
export const facilityService = new FacilityService();
