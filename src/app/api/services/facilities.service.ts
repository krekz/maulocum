import { HTTPException } from "hono/http-exception";
import { prisma } from "@/lib/prisma";
import {
	deleteFromR2,
	extractKeyFromUrl,
	generateFileKey,
	uploadToR2,
} from "@/lib/r2";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
import type {
	CreateContactInfoInput,
	FacilityQuery,
	FacilityRegistrationApiInput,
	FacilityVerificationEditApiInput,
} from "../types/facilities.types";
import type { JobPostFormValues } from "../types/jobs.types";

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
				facilityReviews: {
					orderBy: { createdAt: "desc" },
					take: 10,
				},
				contactInfo: true,
				_count: {
					select: {
						jobs: true,
						facilityReviews: true,
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
								doctorReviews: true,
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
									phoneNumber: true,
									location: true,
									specialty: true,
									yearsOfExperience: true,
									apcNumber: true,
									verificationStatus: true,
								},
							},
						},
					},
				},
				orderBy: {
					appliedAt: "desc",
				},
			});

			return applications;
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
									phoneNumber: true,
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

	/**
	 * Update a job posting
	 * @security Ownership verified by requireActiveEmployer middleware
	 */
	async updateJob(jobId: string, facilityId: string, data: JobPostFormValues) {
		try {
			// Verify job exists and belongs to facility
			const job = await prisma.job.findFirst({
				where: { id: jobId, facilityId },
				select: { id: true },
			});

			if (!job) {
				throw new HTTPException(404, {
					message: "Job not found",
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
