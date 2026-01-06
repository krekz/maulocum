import { HTTPException } from "hono/http-exception";
import { prisma } from "@/lib/prisma";
import { getDisplayName } from "@/lib/utils/name.utils";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
import {
	deleteFromR2,
	extractKeyFromUrl,
	generateFileKey,
	uploadToR2,
} from "../../../lib/r2";
import { sendWhatsappNotifications } from "../lib/send-whatsapp";
import type {
	CreateContactInfoInput,
	FacilityQuery,
	FacilityRegistrationApiInput,
	FacilityVerificationEditApiInput,
} from "../types/facilities.types";
import type { JobPostFormValues } from "../types/jobs.types";
import { notificationService } from "./notification.service";

// Facility Service (Single Responsibility Principle)
export class FacilityService {
	// Create or Register a new facility
	async createFacility(userId: string, data: FacilityRegistrationApiInput) {
		try {
			// Check if user already has a facility
			const existingFacility = await prisma.facility.findFirst({
				where: { ownerId: userId },
				select: {
					facilityVerification: {
						select: {
							id: true,
							verificationStatus: true,
						},
					},
				},
			});

			if (existingFacility?.facilityVerification?.id) {
				throw new HTTPException(400, {
					message: "User has either existing facility or pending verification",
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
			const ssmKey = generateFileKey(userId, data.ssmDocument.name);
			const licenseKey = generateFileKey(userId, data.clinicLicense.name);

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
					ownerId: userId,
					facilityVerification: {
						create: {
							businessRegistrationNo: "", // TODO: Will be extracted from document
							businessDocumentUrl: licenseResult.url,
							licenseDocumentUrl: ssmResult.url,
							verificationStatus: "PENDING",
						},
					},
				},
			});

			await notificationService.createNotification({
				type: "FACILITY_VERIFICATION_APPROVED",
				title: "Facility Verification Approved",
				message: "Your facility verification has been approved.",
				facilityId: facility.id,
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

	// Get all staffs for employer's facility
	async getMyFacilityStaffs(facilityId: string) {
		try {
			return prisma.staffProfile.findMany({
				where: {
					facilityId,
				},
				orderBy: {
					createdAt: "desc",
				},
				select: {
					id: true,
					role: true,
					isActive: true,
					createdAt: true,
					updatedAt: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
				},
			});
		} catch (error) {
			console.error("Error in facility.service.getMyFacilityStaffs:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to fetch facility staffs",
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

	/**
	 * Check if facility verification is editable
	 * Editable when: PENDING or (REJECTED and allowAppeal is true)
	 */
	private isVerificationEditable(verification: {
		verificationStatus: string;
		allowAppeal: boolean;
	}): boolean {
		return (
			verification.verificationStatus === "PENDING" ||
			(verification.verificationStatus === "REJECTED" &&
				verification.allowAppeal)
		);
	}

	/**
	 * Get facility verification status with editable flag
	 */
	async getFacilityVerificationStatus(userId: string) {
		try {
			const verification = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					ownedFacilities: {
						select: {
							facilityVerification: {
								select: {
									id: true,
									facility: {
										select: {
											name: true,
											address: true,
											contactEmail: true,
											contactPhone: true,
										},
									},
									facilityId: true,
									verificationStatus: true,
									rejectionReason: true,
									allowAppeal: true,
									businessDocumentUrl: true,
									licenseDocumentUrl: true,
								},
							},
						},
					},
				},
			});

			if (!verification || verification.ownedFacilities.length === 0) {
				throw new HTTPException(404, {
					message: "No facilities found for this user",
				});
			}

			// Extract the first facility's verification data
			const facilityVerification =
				verification.ownedFacilities[0]?.facilityVerification;

			if (!facilityVerification) {
				throw new HTTPException(404, {
					message: "Facility verification not found",
				});
			}

			return {
				...facilityVerification,
				canEdit: this.isVerificationEditable(facilityVerification),
			};
		} catch (error) {
			console.error(
				"Error in facility.service.getFacilityVerificationStatus:",
				error,
			);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to get facility verification status",
			});
		}
	}

	/**
	 * Update facility verification details with optional file uploads
	 * Only allowed for PENDING or REJECTED with allowAppeal
	 */
	async updateFacilityVerificationDetails(
		userId: string,
		data: FacilityVerificationEditApiInput,
	) {
		try {
			// Check if verification exists
			const verification = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					ownedFacilities: {
						select: {
							facilityVerification: {
								select: {
									id: true,
									facilityId: true,
									verificationStatus: true,
									allowAppeal: true,
									businessDocumentUrl: true,
									licenseDocumentUrl: true,
								},
							},
						},
					},
				},
			});

			if (!verification || verification.ownedFacilities.length === 0) {
				throw new HTTPException(404, {
					message: "Facility verification not found",
				});
			}

			const facility = verification.ownedFacilities[0];
			if (!facility?.facilityVerification) {
				throw new HTTPException(404, {
					message: "Facility verification not found",
				});
			}

			if (!this.isVerificationEditable(facility.facilityVerification)) {
				throw new HTTPException(400, {
					message: "You are not allowed to edit this verification",
				});
			}

			// Validate and upload files if provided
			const allowedTypes = [
				"application/pdf",
				"image/jpeg",
				"image/png",
				"image/jpg",
			];
			const maxSize = 1 * 1024 * 1024; // 1MB

			let newSsmDocumentUrl: string | undefined;
			let newLicenseDocumentUrl: string | undefined;

			// Handle SSM document upload
			if (data.ssmDocument) {
				if (!allowedTypes.includes(data.ssmDocument.type)) {
					throw new HTTPException(400, {
						message:
							"Invalid SSM document type. Only PDF or images are allowed",
					});
				}
				if (data.ssmDocument.size > maxSize) {
					throw new HTTPException(400, {
						message: "SSM document must be less than 1MB",
					});
				}

				const arrayBuffer = await data.ssmDocument.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				const fileKey = generateFileKey(userId, data.ssmDocument.name);
				const result = await uploadToR2(buffer, fileKey, data.ssmDocument.type);
				newSsmDocumentUrl = result.url;

				// Delete old SSM document
				if (facility.facilityVerification.businessDocumentUrl) {
					const oldKey = extractKeyFromUrl(
						facility.facilityVerification.businessDocumentUrl,
					);
					await deleteFromR2(oldKey);
				}
			}

			// Handle clinic license upload
			if (data.clinicLicense) {
				if (!allowedTypes.includes(data.clinicLicense.type)) {
					throw new HTTPException(400, {
						message:
							"Invalid clinic license type. Only PDF or images are allowed",
					});
				}
				if (data.clinicLicense.size > maxSize) {
					throw new HTTPException(400, {
						message: "Clinic license must be less than 1MB",
					});
				}

				const arrayBuffer = await data.clinicLicense.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				const fileKey = generateFileKey(userId, data.clinicLicense.name);
				const result = await uploadToR2(
					buffer,
					fileKey,
					data.clinicLicense.type,
				);
				newLicenseDocumentUrl = result.url;

				// Delete old license document
				if (facility.facilityVerification.licenseDocumentUrl) {
					const oldKey = extractKeyFromUrl(
						facility.facilityVerification.licenseDocumentUrl,
					);
					await deleteFromR2(oldKey);
				}
			}

			// Update facility and verification in a transaction
			await prisma.$transaction([
				prisma.facility.update({
					where: { id: facility.facilityVerification.facilityId },
					data: {
						name: data.companyName,
						address: data.address,
						contactEmail: data.companyEmail,
						contactPhone: data.companyPhone,
						updatedAt: new Date(),
					},
				}),
				prisma.facilityVerification.update({
					where: { id: facility.facilityVerification.id },
					data: {
						verificationStatus: "PENDING",
						rejectionReason: null,
						reviewedAt: null,
						...(newSsmDocumentUrl && {
							businessDocumentUrl: newSsmDocumentUrl,
						}),
						...(newLicenseDocumentUrl && {
							licenseDocumentUrl: newLicenseDocumentUrl,
						}),
					},
				}),
			]);

			return { success: true };
		} catch (error) {
			console.error(
				"Error in facility.service.updateFacilityVerificationDetails:",
				error,
			);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to update facility verification",
			});
		}
	}

	// Get facility by ID with access control
	// isVerifiedDoctor: if true, returns sensitive data (reviews, ratings, jobs)
	async getFacilityById(id: string, isVerifiedDoctor = false) {
		const facility = await prisma.facility.findUnique({
			where: { id },
			include: {
				owner: {
					select: {
						id: true,
						name: true,
					},
				},
				// Only include sensitive data for verified doctors
				...(isVerifiedDoctor && {
					jobs: {
						where: { status: "OPEN" },
						orderBy: { createdAt: "desc" },
						take: 10,
						select: {
							id: true,
							title: true,
							description: true,
							location: true,
							payRate: true,
							payBasis: true,
							startTime: true,
							endTime: true,
							startDate: true,
							endDate: true,
							jobType: true,
							urgency: true,
							status: true,
							requiredSpecialists: true,
							createdAt: true,
						},
					},
					facilityReviews: {
						orderBy: { createdAt: "desc" },
						take: 10,
						select: {
							id: true,
							rating: true,
							comment: true,
							createdAt: true,
						},
					},
				}),
				contactInfo: true,
				facilityVerification: {
					select: {
						verificationStatus: true,
					},
				},
				_count: {
					select: {
						jobs: true,
						facilityReviews: true,
					},
				},
			},
		});

		if (!facility) return null;

		// Calculate average rating only for verified doctors
		let averageRating = 0;
		let reviewCount = 0;

		if (isVerifiedDoctor) {
			const ratingStats = await prisma.facilityReview.aggregate({
				where: { facilityId: id },
				_avg: { rating: true },
				_count: { rating: true },
			});
			averageRating = ratingStats._avg.rating || 0;
			reviewCount = ratingStats._count.rating || 0;
		}

		return {
			...facility,
			averageRating,
			reviewCount,
			// Mask sensitive data for non-verified users
			jobs: isVerifiedDoctor ? facility.jobs : undefined,
			facilityReviews: isVerifiedDoctor ? facility.facilityReviews : undefined,
		};
	}

	// Get all facilities with filters and pagination
	async getFacilities(query: FacilityQuery) {
		try {
			const { ownerId, search, location, page, limit } = query;

			const where: Prisma.FacilityWhereInput = {};

			if (ownerId) where.ownerId = ownerId;

			const conditions: Prisma.FacilityWhereInput[] = [];

			if (search) {
				conditions.push({
					OR: [
						{ name: { contains: search, mode: "insensitive" } },
						{ address: { contains: search, mode: "insensitive" } },
						{ description: { contains: search, mode: "insensitive" } },
					],
				});
			}

			if (location && location !== "all") {
				conditions.push({
					address: { contains: location, mode: "insensitive" },
				});
			}

			if (conditions.length > 0) {
				where.AND = conditions;
			}

			const skip = (page - 1) * limit;

			const [facilities, total] = await Promise.all([
				prisma.facility.findMany({
					where,
					skip,
					take: limit,
					orderBy: { createdAt: "desc" },

					select: {
						id: true,
						name: true,
						profileImage: true,
						_count: true,
					},
				}),
				prisma.facility.count({ where }),
			]);

			if (!facilities || !facilities.length)
				throw new HTTPException(404, { message: "Facilities not found" });

			return {
				facilities,
				pagination: {
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit) || 0,
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

	// Get facility reviews
	async getFacilityReviews(facilityId: string) {
		try {
			return prisma.facilityReview.findMany({
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
			const facility = await prisma.staffProfile.findUnique({
				where: {
					userId,
				},
				include: {
					user: true,
					facility: {
						include: {
							facilityVerification: true,
							contactInfo: true,
							doctorReviews: true,
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
	async postJob(data: JobPostFormValues, facilityId: string, staffId: string) {
		try {
			// Create the job
			await prisma.job.create({
				data: {
					...data,
					facilityId,
					staffId,
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
				include: {
					_count: {
						select: {
							acceptedDoctors: true,
						},
					},
				},
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

	async getJobApplicants(facilityId: string) {
		try {
			const applications = await prisma.jobApplication.findMany({
				where: {
					job: {
						facilityId,
					},
				},
				select: {
					id: true,
					appliedAt: true,
					coverLetter: true,
					status: true,
					updatedAt: true,
					job: {
						select: {
							id: true,
							title: true,
							startDate: true,
							endDate: true,
							startTime: true,
							endTime: true,
							location: true,
							payRate: true,
							payBasis: true,
							jobType: true,
							urgency: true,
							status: true,
						},
					},
					DoctorProfile: {
						select: {
							id: true,
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									image: true,
									phoneNumber: true,
								},
							},
							doctorVerification: {
								select: {
									fullName: true,
									location: true,
									specialty: true,
									yearsOfExperience: true,
									apcNumber: true,
									verificationStatus: true,
								},
							},
						},
					},
					doctorReview: {
						select: {
							id: true,
							rating: true,
						},
					},
				},
				orderBy: {
					appliedAt: "desc",
				},
			});

			// Get unique doctor profile IDs
			const doctorProfileIds = [
				...new Set(
					applications
						.map((a) => a.DoctorProfile?.id)
						.filter((id): id is string => !!id),
				),
			];

			// Batch fetch average ratings using aggregation
			const avgRatings = await prisma.doctorReview.groupBy({
				by: ["doctorProfileId"],
				where: { doctorProfileId: { in: doctorProfileIds } },
				_avg: { rating: true },
			});

			// Create a map for quick lookup
			const avgRatingMap = new Map(
				avgRatings.map((r) => [r.doctorProfileId, r._avg.rating]),
			);

			// Attach avg rating to each applicant
			const applicantsWithAvgRating = applications.map((application) => ({
				...application,
				DoctorProfile: application.DoctorProfile
					? {
							...application.DoctorProfile,
							avgRating: avgRatingMap.get(application.DoctorProfile.id) ?? null,
						}
					: null,
			}));

			return applicantsWithAvgRating;
		} catch (error) {
			console.error("Error in facility.service.getJobApplicants:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to fetch job applicants",
			});
		}
	}

	/**
	 * Close a job posting
	 * @security Ownership verified by requireActiveEmployer middleware
	 */
	async closeJob(jobId: string, facilityId: string) {
		try {
			// Get job status with ownership filter
			const job = await prisma.job.findFirst({
				where: { id: jobId, facilityId },
				select: { status: true },
			});

			if (!job) {
				throw new HTTPException(404, {
					message: "Job not found",
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

	/**
	 * Reopen a closed job posting
	 * @security Ownership verified by requireActiveEmployer middleware
	 */
	async reopenJob(jobId: string, facilityId: string) {
		try {
			// Get job status with ownership filter
			const job = await prisma.job.findFirst({
				where: { id: jobId, facilityId },
				select: { status: true },
			});

			if (!job) {
				throw new HTTPException(404, {
					message: "Job not found",
				});
			}

			// Check if job is not closed or filled
			if (job.status !== "CLOSED" && job.status !== "FILLED") {
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

	/**
	 * Mark a job as completed - updates all DOCTOR_CONFIRMED applications to COMPLETED
	 * @security Ownership verified by requireActiveEmployer middleware
	 */
	async completeJob(jobId: string, facilityId: string) {
		try {
			const job = await prisma.job.findFirst({
				where: { id: jobId, facilityId },
				select: { id: true },
			});

			if (!job) {
				throw new HTTPException(404, {
					message: "Job not found",
				});
			}

			// Find all confirmed applications for this job
			const confirmedApplications = await prisma.jobApplication.findMany({
				where: {
					jobId,
					status: "DOCTOR_CONFIRMED",
				},
				select: { id: true },
			});

			if (confirmedApplications.length === 0) {
				throw new HTTPException(400, {
					message: "No confirmed applications to mark as completed",
				});
			}

			// Update all confirmed applications to COMPLETED
			await Promise.all([
				prisma.jobApplication.updateMany({
					where: {
						jobId,
						status: "DOCTOR_CONFIRMED",
					},
					data: {
						status: "COMPLETED",
					},
				}),
				// update job status to filled
				prisma.job.update({
					where: {
						id: jobId,
					},
					data: {
						status: "FILLED",
					},
				}),
			]);

			return {
				success: true,
				completedCount: confirmedApplications.length,
			};
		} catch (error) {
			console.error("Error in facility.service.completeJob:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to mark job as completed",
			});
		}
	}

	/**
	 * Get all applicants for a job
	 * @security Ownership verified by requireActiveEmployer middleware
	 */
	async getJobApplicantsById(jobId: string, facilityId: string) {
		try {
			// Get applicants only for jobs belonging to this facility
			const applicants = await prisma.jobApplication.findMany({
				where: {
					jobId,
					job: { facilityId },
				},
				include: {
					DoctorProfile: {
						select: {
							id: true,
							doctorVerification: {
								select: {
									fullName: true,
									location: true,
									specialty: true,
									yearsOfExperience: true,
									verificationStatus: true,
								},
							},
							user: {
								select: {
									email: true,
									image: true,
									phoneNumber: true,
								},
							},
							doctorReviews: {
								select: {
									rating: true,
								},
							},
						},
					},
					doctorReview: {
						select: {
							id: true,
							rating: true,
						},
					},
				},
				orderBy: {
					appliedAt: "desc",
				},
			});

			// Calculate average rating for each doctor
			const applicantsWithAvgRating = applicants.map((applicant) => {
				const reviews = applicant.DoctorProfile?.doctorReviews ?? [];
				const avgRating =
					reviews.length > 0
						? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
						: null;

				return {
					...applicant,
					DoctorProfile: applicant.DoctorProfile
						? {
								...applicant.DoctorProfile,
								avgRating,
							}
						: null,
				};
			});

			return applicantsWithAvgRating;
		} catch (error) {
			console.error("Error in facility.service.getJobApplicants:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to fetch job applicants",
			});
		}
	}

	/**
	 * Update a job posting
	 * @security Ownership verified by requireActiveEmployer middleware
	 * Handles doctorsNeeded decrease by removing last accepted doctors
	 */
	async updateJob(jobId: string, facilityId: string, data: JobPostFormValues) {
		try {
			// Verify job exists and belongs to facility
			const job = await prisma.job.findFirst({
				where: { id: jobId, facilityId },
				select: {
					id: true,
					doctorsNeeded: true,
					status: true,
					acceptedDoctors: {
						orderBy: { acceptedAt: "desc" },
						select: {
							id: true,
							applicationId: true,
							doctorProfileId: true,
						},
					},
				},
			});

			if (!job) {
				throw new HTTPException(404, {
					message: "Job not found",
				});
			}

			const currentDoctorsNeeded = job.doctorsNeeded;
			const newDoctorsNeeded = data.doctorsNeeded ?? currentDoctorsNeeded;
			const acceptedCount = job.acceptedDoctors.length;

			// Handle doctorsNeeded decrease - remove last accepted doctors
			if (newDoctorsNeeded < acceptedCount) {
				const doctorsToRemove = acceptedCount - newDoctorsNeeded;
				const doctorsToRemoveList = job.acceptedDoctors.slice(
					0,
					doctorsToRemove,
				);

				// Remove accepted doctors and cancel their applications in a transaction
				await prisma.$transaction([
					// Delete from JobAcceptedDoctor
					prisma.jobAcceptedDoctor.deleteMany({
						where: {
							id: { in: doctorsToRemoveList.map((d) => d.id) },
						},
					}),
					// Update their job applications to CANCELLED
					prisma.jobApplication.updateMany({
						where: {
							id: { in: doctorsToRemoveList.map((d) => d.applicationId) },
						},
						data: {
							status: "CANCELLED",
							cancelledAt: new Date(),
							cancellationReason: "Job position count reduced by employer",
						},
					}),
				]);
			}

			// Determine new job status
			let newStatus = job.status;
			const newAcceptedCount = Math.min(acceptedCount, newDoctorsNeeded);

			// If doctorsNeeded increased and job was FILLED, reopen it
			if (newDoctorsNeeded > currentDoctorsNeeded && job.status === "FILLED") {
				newStatus = "OPEN";
			}
			// If after removal, we still have enough doctors, keep it FILLED
			else if (newAcceptedCount >= newDoctorsNeeded && job.status === "OPEN") {
				newStatus = "FILLED";
			}
			// If we removed doctors and now don't have enough, set to OPEN
			else if (newAcceptedCount < newDoctorsNeeded && job.status === "FILLED") {
				newStatus = "OPEN";
			}

			// Update the job
			const updatedJob = await prisma.job.update({
				where: { id: jobId },
				data: {
					...data,
					status: newStatus,
				},
				include: {
					_count: {
						select: {
							acceptedDoctors: true,
						},
					},
				},
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

	/**
	 * Delete a job posting
	 * @security Ownership verified by requireActiveEmployer middleware
	 */
	async deleteJob(jobId: string, facilityId: string) {
		try {
			// Verify job exists and belongs to facility
			const job = await prisma.job.findFirst({
				where: { id: jobId, facilityId },
				select: {
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

	/**
	 * Submit a review for a doctor after completing a job
	 * @security Ownership verified by requireActiveEmployer middleware
	 */
	async submitDoctorReview(
		applicationId: string,
		facilityId: string,
		rating: number,
		comment?: string,
	) {
		try {
			// Get the job application with related data
			const application = await prisma.jobApplication.findFirst({
				where: {
					id: applicationId,
					job: { facilityId },
				},
				include: {
					job: { select: { facilityId: true } },
					doctorReview: { select: { id: true } },
					DoctorProfile: { select: { id: true } },
				},
			});

			if (!application) {
				throw new HTTPException(404, {
					message: "Job application not found",
				});
			}

			if (!application.DoctorProfile) {
				throw new HTTPException(400, {
					message: "No doctor profile associated with this application",
				});
			}

			// Check if job is completed
			if (application.status !== "COMPLETED") {
				throw new HTTPException(400, {
					message: "Can only review doctors for completed jobs",
				});
			}

			// Check if already reviewed
			if (application.doctorReview) {
				throw new HTTPException(400, {
					message: "You have already reviewed this doctor for this job",
				});
			}

			// Create the review
			const review = await prisma.doctorReview.create({
				data: {
					rating,
					comment,
					doctorProfileId: application.DoctorProfile.id,
					facilityId,
					jobApplicationId: applicationId,
				},
				select: {
					id: true,
					rating: true,
					comment: true,
					createdAt: true,
				},
			});

			return review;
		} catch (error) {
			console.error("Error in facility.service.submitDoctorReview:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to submit review",
			});
		}
	}

	// ============================================
	// Double Opt-In Job Application Flow
	// ============================================

	/**
	 * Employer approves an application
	 * - Updates status to EMPLOYER_APPROVED
	 * - Generates confirmation token
	 * - Sends WhatsApp message to doctor (TODO)
	 */
	async approveApplication(applicationId: string) {
		try {
			// Get application with doctor details
			const application = await prisma.jobApplication.findUnique({
				where: { id: applicationId },
				include: {
					job: {
						select: {
							id: true,
							title: true,
							startDate: true,
							endDate: true,
							facility: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
					DoctorProfile: {
						include: {
							doctorVerification: {
								select: {
									fullName: true,
								},
							},
							user: {
								select: {
									id: true,
									email: true,
									phoneNumber: true,
								},
							},
						},
					},
				},
			});

			if (!application) {
				throw new HTTPException(404, {
					message: "Application not found",
				});
			}

			if (application.status !== "PENDING") {
				throw new HTTPException(400, {
					message: `Cannot approve application with status: ${application.status}`,
				});
			}

			// Generate unique confirmation token
			const confirmationToken = crypto.randomUUID();

			// Update application status
			await prisma.jobApplication.update({
				where: { id: applicationId },
				data: {
					status: "EMPLOYER_APPROVED",
					confirmationToken,
					employerApprovedAt: new Date(),
				},
			});

			// Build confirmation URL
			const confirmationUrl = `${process.env.BETTER_AUTH_URL}/jobs/confirm/${confirmationToken}`;

			// Send notification to doctor
			await notificationService.createNotification({
				type: "JOB_APPLICATION_APPROVED",
				title: "Application Approved!",
				message: `Your application for ${application.job.title} at ${application.job.facility.name} has been approved. Please confirm your availability.`,
				doctorProfileId: application.DoctorProfile?.id,
				jobId: application.job.id,
				userId: application.DoctorProfile?.userId,
				actionUrl: `/jobs/confirm/${confirmationToken}`,
				metadata: {
					facilityName: application.job.facility.name,
					jobTitle: application.job.title,
					confirmationUrl,
					startDate: application.job.startDate.toISOString(),
					endDate: application.job.endDate.toISOString(),
				},
			});

			// Send WhatsApp notification via queue
			if (application.DoctorProfile?.user.phoneNumber) {
				const doctorDisplayName = getDisplayName(
					application.DoctorProfile.doctorVerification?.fullName,
				);
				const message = `🎉 *Application Approved!*\n\nDear Dr. ${doctorDisplayName},\n\nYour application for *${application.job.title}* at *${application.job.facility.name}* has been approved!\n\n📅 *Job Details:*\n- Start Date: ${application.job.startDate.toLocaleDateString()}\n- End Date: ${application.job.endDate.toLocaleDateString()}\n\n⚠️ *Action Required:*\nPlease confirm your availability within 24 hours:\n${confirmationUrl}\n\nThank you for using MauLocum! 🏥`;
				sendWhatsappNotifications("/job", {
					phoneNumber: application.DoctorProfile.user.phoneNumber,
					message,
					metadata: {
						doctorName:
							application.DoctorProfile.doctorVerification?.fullName ??
							undefined,
						jobTitle: application.job.title,
						facilityName: application.job.facility.name,
						startDate: application.job.startDate.toISOString(),
						endDate: application.job.endDate.toISOString(),
						confirmationUrl,
						applicationId: application.id,
					},
				});
			}

			return;
		} catch (error) {
			console.error("Error approving application:", error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to approve application",
			});
		}
	}

	/**
	 * Employer rejects an application
	 */
	async rejectApplication(applicationId: string, reason?: string) {
		try {
			const application = await prisma.jobApplication.findUnique({
				where: { id: applicationId },
			});

			if (!application) {
				throw new HTTPException(404, {
					message: "Application not found",
				});
			}

			if (
				application.status === "EMPLOYER_REJECTED" ||
				application.status === "DOCTOR_REJECTED"
			) {
				throw new HTTPException(400, {
					message: "Application has already been rejected",
				});
			}

			if (application.status !== "PENDING") {
				throw new HTTPException(400, {
					message: `Cannot reject application with status: ${application.status}`,
				});
			}

			await prisma.jobApplication.update({
				where: { id: applicationId },
				data: {
					status: "EMPLOYER_REJECTED",
					rejectedAt: new Date(),
					rejectionReason: reason,
					confirmationToken: null,
					updatedAt: new Date(),
				},
			});

			return;
		} catch (error) {
			console.error("Error rejecting application:", error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to reject application",
			});
		}
	}

	async inviteStaff(
		facilityId: string,
		invitedBy: string,
		email: string,
		role: string,
	) {
		try {
			const user = await prisma.user.findUnique({
				where: { email },
				select: {
					id: true,
					name: true,
					phoneNumberVerified: true,
					staffProfile: { select: { id: true, facilityId: true } },
				},
			});

			if (!user) {
				throw new HTTPException(404, {
					message: "User with this email does not exist",
				});
			}

			if (!user.phoneNumberVerified) {
				throw new HTTPException(400, {
					message: "User must verify their phone number first",
				});
			}

			if (user.staffProfile) {
				throw new HTTPException(400, {
					message: "User is already a staff member at another facility",
				});
			}

			const existingInvite = await prisma.staffInvitation.findUnique({
				where: { facilityId_email: { facilityId, email } },
			});

			if (existingInvite && existingInvite.status === "PENDING") {
				throw new HTTPException(400, {
					message: "Invitation already sent to this user",
				});
			}

			const [facility, inviter] = await Promise.all([
				prisma.facility.findUnique({
					where: { id: facilityId },
					select: { name: true },
				}),
				prisma.user.findUnique({
					where: { id: invitedBy },
					select: { name: true },
				}),
			]);

			if (!facility || !inviter) {
				throw new HTTPException(404, {
					message: "Facility or inviter not found",
				});
			}

			const token = `${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
			const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

			const invitation = await prisma.staffInvitation.upsert({
				create: {
					facilityId,
					email,
					role,
					token,
					invitedBy,
					expiresAt,
				},
				update: {
					token,
					status: "PENDING",
					expiresAt,
				},
				where: {
					facilityId_email: { facilityId, email },
				},
			});

			await notificationService.notifyStaffInvitation({
				invitationToken: token,
				email,
				facilityName: facility.name,
				role,
				invitedByName: inviter.name,
				userId: user.id,
			});

			return invitation;
		} catch (error) {
			console.error("Error in facility.service.inviteStaff:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to send staff invitation",
			});
		}
	}

	async getStaffInvitation(token: string, userId: string) {
		try {
			const invitation = await prisma.staffInvitation.findUnique({
				where: { token },
				include: {
					facility: {
						select: {
							id: true,
							name: true,
							address: true,
							ownerId: true,
						},
					},
				},
			});

			if (!invitation) {
				throw new HTTPException(404, {
					message: "Invitation not found",
				});
			}

			if (new Date() > invitation.expiresAt) {
				throw new HTTPException(410, {
					message: "Invitation has expired",
				});
			}

			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { email: true },
			});

			if (!user || user.email !== invitation.email) {
				throw new HTTPException(403, {
					message: "This invitation is not for your account",
				});
			}

			return {
				id: invitation.id,
				facilityName: invitation.facility.name,
				facilityAddress: invitation.facility.address,
				role: invitation.role,
				status: invitation.status,
				expiresAt: invitation.expiresAt,
				createdAt: invitation.createdAt,
			};
		} catch (error) {
			console.error("Error in facility.service.getStaffInvitation:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to fetch invitation",
			});
		}
	}

	async respondToStaffInvitation(
		token: string,
		userId: string,
		action: "accept" | "decline",
	) {
		try {
			const invitation = await prisma.staffInvitation.findUnique({
				where: { token },
				include: {
					facility: {
						select: {
							id: true,
							name: true,
							ownerId: true,
						},
					},
				},
			});

			if (!invitation) {
				throw new HTTPException(404, {
					message: "Invitation not found",
				});
			}

			if (invitation.status !== "PENDING") {
				throw new HTTPException(400, {
					message: `Invitation is already "${invitation.status.toLowerCase()}"`,
				});
			}

			if (new Date() > invitation.expiresAt) {
				await prisma.staffInvitation.update({
					where: { id: invitation.id },
					data: { status: "EXPIRED" },
				});
				throw new HTTPException(410, {
					message: "Invitation has expired",
				});
			}

			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { email: true, name: true, staffProfile: true },
			});

			if (!user || user.email !== invitation.email) {
				throw new HTTPException(403, {
					message: "This invitation is not for your account",
				});
			}

			if (action === "decline") {
				await prisma.staffInvitation.update({
					where: { id: invitation.id },
					data: { status: "REJECTED", acceptedAt: new Date() },
				});

				return {
					success: true,
					message: "Invitation declined successfully",
					facilityName: invitation.facility.name,
				};
			}

			// Accept action
			if (user.staffProfile) {
				throw new HTTPException(400, {
					message: "You are already a staff member at another facility",
				});
			}

			await prisma.$transaction([
				prisma.staffProfile.create({
					data: {
						userId,
						facilityId: invitation.facilityId,
						role: invitation.role,
					},
				}),
				prisma.staffInvitation.update({
					where: { id: invitation.id },
					data: { status: "ACCEPTED", acceptedAt: new Date() },
				}),
			]);

			await notificationService.notifyStaffInvitationAccepted({
				facilityId: invitation.facilityId,
				facilityOwnerId: invitation.facility.ownerId,
				staffName: user.name,
				role: invitation.role,
			});

			return {
				success: true,
				message: `You are now a staff member at ${invitation.facility.name}`,
				facilityName: invitation.facility.name,
			};
		} catch (error) {
			console.error(
				"Error in facility.service.respondToStaffInvitation:",
				error,
			);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to respond to invitation",
			});
		}
	}

	async deleteStaff(staffId: string, facilityId: string) {
		try {
			const staff = await prisma.staffProfile.findFirst({
				where: { id: staffId, facilityId },
				include: {
					facility: { select: { ownerId: true, name: true } },
					user: { select: { id: true } },
				},
			});

			if (!staff) {
				throw new HTTPException(404, {
					message: "Staff member not found",
				});
			}

			if (staff.userId === staff.facility.ownerId) {
				throw new HTTPException(400, {
					message: "Cannot remove facility owner",
				});
			}

			await prisma.staffProfile.delete({
				where: { id: staffId },
			});

			await notificationService.notifyStaffRemoved({
				userId: staff.user.id,
				facilityName: staff.facility.name,
			});

			return { success: true };
		} catch (error) {
			console.error("Error in facility.service.deleteStaff:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to remove staff member",
			});
		}
	}

	async getPendingInvitations(facilityId: string) {
		try {
			return prisma.staffInvitation.findMany({
				where: {
					facilityId,
					status: "PENDING",
					expiresAt: { gt: new Date() },
				},
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					email: true,
					role: true,
					createdAt: true,
					expiresAt: true,
				},
			});
		} catch (error) {
			console.error("Error in facility.service.getPendingInvitations:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to fetch pending invitations",
			});
		}
	}

	async revokeInvitation(invitationId: string, facilityId: string) {
		try {
			const invitation = await prisma.staffInvitation.findFirst({
				where: { id: invitationId, facilityId },
			});

			if (!invitation) {
				throw new HTTPException(404, {
					message: "Invitation not found",
				});
			}

			if (invitation.status !== "PENDING") {
				throw new HTTPException(400, {
					message: "Can only revoke pending invitations",
				});
			}

			await prisma.staffInvitation.update({
				where: { id: invitationId },
				data: { status: "REVOKED" },
			});

			return { success: true };
		} catch (error) {
			console.error("Error in facility.service.revokeInvitation:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to revoke invitation",
			});
		}
	}

	// ============================================
	// Facility Profile Update Methods
	// ============================================

	/**
	 * Update clinic information section
	 */
	async updateClinicInfo(
		facilityId: string,
		data: {
			address: string;
			contactPhone: string;
			contactEmail: string;
			website?: string;
			operatingHours?: string;
		},
	) {
		try {
			await prisma.facility.update({
				where: { id: facilityId },
				data: {
					address: data.address,
					contactPhone: data.contactPhone,
					contactEmail: data.contactEmail,
					website: data.website || null,
					operatingHours: data.operatingHours || null,
					updatedAt: new Date(),
				},
			});

			return { success: true };
		} catch (error) {
			console.error("Error in facility.service.updateClinicInfo:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to update clinic information",
			});
		}
	}

	/**
	 * Update about section
	 */
	async updateAbout(facilityId: string, data: { description?: string }) {
		try {
			await prisma.facility.update({
				where: { id: facilityId },
				data: {
					description: data.description || null,
					updatedAt: new Date(),
				},
			});

			return { success: true };
		} catch (error) {
			console.error("Error in facility.service.updateAbout:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to update about section",
			});
		}
	}

	/**
	 * Update facilities & services section
	 */
	async updateFacilitiesServices(
		facilityId: string,
		data: { facilitiesServices: string[] },
	) {
		try {
			await prisma.facility.update({
				where: { id: facilityId },
				data: {
					facilitiesServices: data.facilitiesServices,
					updatedAt: new Date(),
				},
			});

			return { success: true };
		} catch (error) {
			console.error(
				"Error in facility.service.updateFacilitiesServices:",
				error,
			);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to update facilities & services",
			});
		}
	}

	/**
	 * Get sidebar counts for employer dashboard
	 */
	async getSidebarCounts(facilityId: string) {
		try {
			const [unreadNotifications, pendingApplicants] = await Promise.all([
				prisma.notification.count({
					where: { facilityId, isRead: false },
				}),
				prisma.jobApplication.count({
					where: {
						job: { facilityId },
						status: "PENDING",
					},
				}),
			]);

			return {
				unreadNotifications,
				pendingApplicants,
			};
		} catch (error) {
			console.error("Error in facility.service.getSidebarCounts:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to fetch sidebar counts",
			});
		}
	}

	/**
	 * Get notifications for employer's facility
	 */
	async getNotifications(facilityId: string) {
		try {
			const notifications = await prisma.notification.findMany({
				where: { facilityId },
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					type: true,
					title: true,
					message: true,
					isRead: true,
					actionUrl: true,
					metadata: true,
					createdAt: true,
					job: {
						select: {
							id: true,
							title: true,
						},
					},
					jobApplication: {
						select: {
							id: true,
							status: true,
							DoctorProfile: {
								select: {
									user: {
										select: {
											name: true,
											image: true,
										},
									},
								},
							},
						},
					},
				},
			});

			return notifications;
		} catch (error) {
			console.error("Error in facility.service.getNotifications:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to fetch notifications",
			});
		}
	}

	/**
	 * Mark notification as read
	 */
	async markNotificationAsRead(notificationId: string, facilityId: string) {
		try {
			const notification = await prisma.notification.findFirst({
				where: { id: notificationId, facilityId },
			});

			if (!notification) {
				throw new HTTPException(404, {
					message: "Notification not found",
				});
			}

			await prisma.notification.update({
				where: { id: notificationId },
				data: { isRead: true },
			});

			return { success: true };
		} catch (error) {
			console.error("Error in facility.service.markNotificationAsRead:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to mark notification as read",
			});
		}
	}

	/**
	 * Mark all notifications as read
	 */
	async markAllNotificationsAsRead(facilityId: string) {
		try {
			await prisma.notification.updateMany({
				where: { facilityId, isRead: false },
				data: { isRead: true },
			});

			return { success: true };
		} catch (error) {
			console.error(
				"Error in facility.service.markAllNotificationsAsRead:",
				error,
			);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to mark all notifications as read",
			});
		}
	}

	/**
	 * Get dashboard stats for employer
	 */
	async getDashboardStats(facilityId: string) {
		try {
			const [
				activeJobsCount,
				totalJobsCount,
				filledJobsCount,
				totalApplicantsCount,
				recentApplicants,
			] = await Promise.all([
				// Active jobs (OPEN status)
				prisma.job.count({
					where: { facilityId, status: "OPEN" },
				}),
				// Total jobs
				prisma.job.count({
					where: { facilityId },
				}),
				// Filled jobs
				prisma.job.count({
					where: { facilityId, status: "FILLED" },
				}),
				// Total applicants across all jobs
				prisma.jobApplication.count({
					where: { job: { facilityId } },
				}),
				// Recent applicants (last 5)
				prisma.jobApplication.findMany({
					where: { job: { facilityId } },
					orderBy: { appliedAt: "desc" },
					take: 5,
					select: {
						id: true,
						status: true,
						appliedAt: true,
						job: {
							select: {
								title: true,
								requiredSpecialists: true,
							},
						},
						DoctorProfile: {
							select: {
								user: {
									select: {
										name: true,
										image: true,
									},
								},
								doctorVerification: {
									select: {
										specialty: true,
									},
								},
							},
						},
					},
				}),
			]);

			// Calculate fill rate percentage
			const fillRate =
				totalJobsCount > 0
					? Math.round((filledJobsCount / totalJobsCount) * 100)
					: 0;

			return {
				activeJobs: activeJobsCount,
				totalApplicants: totalApplicantsCount,
				fillRate,
				recentApplicants: recentApplicants.map((app) => ({
					id: app.id,
					status: app.status,
					appliedAt: app.appliedAt,
					jobTitle: app.job.title,
					specialty:
						app.DoctorProfile?.doctorVerification?.specialty ||
						app.job.requiredSpecialists[0] ||
						"General",
					doctorName: app.DoctorProfile?.user.name || "Unknown",
					doctorImage: app.DoctorProfile?.user.image,
				})),
			};
		} catch (error) {
			console.error("Error in facility.service.getDashboardStats:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to fetch dashboard stats",
			});
		}
	}
}

// Export singleton instance
export const facilityService = new FacilityService();
