import { HTTPException } from "hono/http-exception";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
import type { FacilityQuery } from "../types/facilities.types";

class AdminService {
	// Get all facilities for admin with full details
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
								email: true,
							},
						},
						facilityVerification: true,
						contactInfo: true,
						facilityReviews: true,
						jobs: true,
						staffs: true,
						_count: {
							select: {
								jobs: true,
								facilityReviews: true,
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

			throw new HTTPException(500, {
				message: "Failed to get facilities",
			});
		}
	}

	async getPendingDoctorsVerifications() {
		try {
			const verifications = await prisma.doctorVerification.findMany({
				where: { verificationStatus: "PENDING" },
				omit: {
					allowAppeal: true,
				},
				include: {
					doctorProfile: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									image: true,
									createdAt: true,
								},
							},
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});

			if (!verifications.length) {
				throw new HTTPException(404, {
					message: "Verifications not found",
				});
			}

			return verifications;
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to get pending verifications",
			});
		}
	}

	async getDoctorVerifications({
		status,
		search,
		limit,
		offset,
	}: {
		status?: "PENDING" | "APPROVED" | "REJECTED";
		search?: string;
		limit: number;
		offset: number;
	}) {
		try {
			const where: Prisma.DoctorVerificationWhereInput = {};

			if (status) {
				where.verificationStatus = status;
			}

			if (search) {
				where.OR = [
					{ fullName: { contains: search, mode: "insensitive" } },
					{
						doctorProfile: {
							user: {
								email: { contains: search, mode: "insensitive" },
							},
						},
					},
					{ phoneNumber: { contains: search, mode: "insensitive" } },
					{ provisionalId: { contains: search, mode: "insensitive" } },
					{ fullId: { contains: search, mode: "insensitive" } },
					{ apcNumber: { contains: search, mode: "insensitive" } },
				];
			}

			const [verifications, total] = await Promise.all([
				prisma.doctorVerification.findMany({
					where,
					select: {
						id: true,
						fullName: true,
						verificationStatus: true,
						reviewedBy: true,
						apcNumber: true,
						specialty: true,
						yearsOfExperience: true,
						location: true,
						doctorProfile: {
							select: {
								user: {
									select: {
										email: true,
									},
								},
							},
						},
					},
					orderBy: { createdAt: "desc" },
					take: limit,
					skip: offset,
				}),
				prisma.doctorVerification.count({ where }),
			]);

			if (!verifications.length || !total) {
				throw new HTTPException(404, {
					message: "Verifications not found",
				});
			}

			return {
				verifications,
				total,
				limit,
				offset,
				totalPages: Math.ceil(total / limit),
			};
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to get verifications",
			});
		}
	}

	async getDoctorsVerificationById(id: string) {
		try {
			const verification = await prisma.doctorVerification.findUnique({
				where: { id },
				include: {
					doctorProfile: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									image: true,
									roles: true,
									phoneNumber: true,
									location: true,
									createdAt: true,
								},
							},
						},
					},
				},
			});

			if (!verification) {
				throw new HTTPException(404, {
					message: "Verification not found",
				});
			}

			return verification;
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to get verification",
			});
		}
	}

	async createDoctorVerificationAction({
		doctorId,
		action,
		rejectionReason,
		allowAppeal = true,
	}: {
		doctorId: string;
		action: "APPROVE" | "REJECT";
		rejectionReason?: string;
		allowAppeal?: boolean;
	}) {
		try {
			const doctorProfile = await this.getDoctorsVerificationById(doctorId);
			if (doctorProfile.verificationStatus !== "PENDING") {
				throw new HTTPException(400, {
					message: "Verification has already been processed",
				});
			}

			if (action === "APPROVE") {
				// Update verification status to APPROVED
				await prisma.doctorVerification.update({
					where: { id: doctorProfile.id },
					data: {
						verificationStatus: "APPROVED",
						reviewedBy: "ADMIN",
						reviewedAt: new Date(),
					},
				});

				const hasEmployer =
					doctorProfile.doctorProfile.user.roles.includes("EMPLOYER");
				await prisma.user.update({
					where: { id: doctorProfile.doctorProfile.userId },
					data: {
						roles: hasEmployer ? { push: "DOCTOR" } : { set: ["DOCTOR"] },
					},
				});

				return;
			} else {
				// REJECT
				if (!rejectionReason) {
					throw new HTTPException(400, {
						message: "Rejection reason is required",
					});
				}

				// Update verification status to REJECTED
				await prisma.doctorVerification.update({
					where: { id: doctorProfile.id },
					data: {
						verificationStatus: "REJECTED",
						rejectionReason,
						allowAppeal,
						reviewedBy: "ADMIN",
						reviewedAt: new Date(),
					},
				});

				return;
			}
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to create verification action",
			});
		}
	}

	// ============================================
	// FACILITIES SERVICES
	// ============================================

	async getFacilitiesPendingVerifications() {
		try {
			const verifications = await prisma.facilityVerification.findMany({
				where: { verificationStatus: "PENDING" },
				include: {
					facility: {
						include: {
							owner: {
								select: {
									id: true,
									name: true,
									email: true,
									phoneNumber: true,
									createdAt: true,
								},
							},
						},
					},
				},
				orderBy: { createdAt: "desc" },
			});

			if (!verifications.length) {
				throw new HTTPException(404, {
					message: "Facilities not found",
				});
			}

			return {
				verifications,
				count: verifications.length,
			};
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to get facilities pending verifications",
			});
		}
	}

	// Approve or reject facility verification
	async facilityVerificationAction({
		verificationId,
		action,
		rejectionReason,
		allowAppeal = true,
	}: {
		verificationId: string;
		action: "APPROVE" | "REJECT";
		rejectionReason?: string;
		allowAppeal?: boolean;
	}) {
		try {
			// Validate rejection reason if action is REJECT
			if (action === "REJECT" && !rejectionReason) {
				throw new HTTPException(400, {
					message: "Rejection reason is required when rejecting",
				});
			}

			// Find the verification
			const verification = await prisma.facilityVerification.findUnique({
				where: { id: verificationId },
				include: {
					facility: {
						include: {
							owner: true,
						},
					},
				},
			});

			if (!verification) {
				throw new HTTPException(404, {
					message: "Verification not found",
				});
			}

			if (verification.verificationStatus !== "PENDING") {
				throw new HTTPException(400, {
					message: `Verification already ${verification.verificationStatus.toLowerCase()}`,
				});
			}
			const roles = verification.facility.owner.roles;
			const isDoctor = roles.includes("DOCTOR");
			const updatedVerification = await prisma.facility.update({
				where: { id: verification.facilityId },
				data: {
					owner: {
						update: {
							roles: {
								set: isDoctor ? ["EMPLOYER", "DOCTOR"] : ["EMPLOYER"],
							},
						},
					},
					facilityVerification: {
						update: {
							verificationStatus:
								action === "APPROVE" ? "APPROVED" : "REJECTED",
							rejectionReason: action === "REJECT" ? rejectionReason : null,
							allowAppeal: action === "REJECT" ? allowAppeal : false,
							reviewedAt: new Date(),
							updatedAt: new Date(),
						},
					},
					...(action === "APPROVE" && {
						staffs: {
							create: {
								role: "OWNER",
								userId: verification.facility.ownerId,
								isActive: true,
							},
						},
					}),
				},
			});

			return {
				verification: updatedVerification,
			};
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to create verification action",
			});
		}
	}

	// ============================================
	// USER SERVICES
	// ============================================

	async getAllUsers({
		role,
		limit,
		offset,
	}: {
		role?: "USER" | "DOCTOR" | "ADMIN";
		limit: number;
		offset: number;
	}) {
		try {
			const where: Prisma.UserWhereInput = role ? { roles: { has: role } } : {};

			const [users, total] = await Promise.all([
				prisma.user.findMany({
					where,
					include: {
						doctorProfile: true,
					},
					orderBy: { createdAt: "desc" },
					take: limit,
					skip: offset,
				}),
				prisma.user.count({ where }),
			]);

			if (!users.length || !total) {
				throw new HTTPException(404, {
					message: "Users not found",
				});
			}

			return {
				users,
				total,
				limit,
				offset,
				totalPages: Math.ceil(total / limit),
			};
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to get users",
			});
		}
	}

	async updateUserRole({
		userId,
		role,
	}: {
		userId: string;
		role: "USER" | "DOCTOR" | "ADMIN";
	}) {
		try {
			const user = await prisma.user.update({
				where: { id: userId },
				data: { roles: { set: [role] } },
				include: { doctorProfile: true },
			});

			if (!user) {
				throw new HTTPException(404, {
					message: "User not found",
				});
			}

			return {
				user,
			};
		} catch (error) {
			console.error("Error updating user role:", error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to update user role",
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
							user: {
								select: {
									id: true,
									name: true,
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
			const updatedApplication = await prisma.jobApplication.update({
				where: { id: applicationId },
				data: {
					status: "EMPLOYER_APPROVED",
					confirmationToken,
					employerApprovedAt: new Date(),
				},
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
							user: {
								select: {
									id: true,
									name: true,
									email: true,
									phoneNumber: true,
								},
							},
						},
					},
				},
			});

			// Build confirmation URL
			const confirmationUrl = `${process.env.BETTER_AUTH_URL}/jobs/confirm/${confirmationToken}`;

			// TODO: Send WhatsApp message to doctor
			// For now, just log it
			console.log("=== WHATSAPP NOTIFICATION (TODO) ===");
			console.log(`To: ${application.DoctorProfile?.user.phoneNumber}`);
			console.log(`Doctor: ${application.DoctorProfile?.user.name}`);
			console.log(
				`Job: ${application.job.title} at ${application.job.facility.name}`,
			);
			console.log(
				`Dates: ${application.job.startDate} - ${application.job.endDate}`,
			);
			console.log(`Confirmation Link: ${confirmationUrl}`);
			console.log("=====================================");

			return {
				application: updatedApplication,
				confirmationUrl,
			};
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

			const updatedApplication = await prisma.jobApplication.update({
				where: { id: applicationId },
				data: {
					status: "EMPLOYER_REJECTED",
					rejectedAt: new Date(),
					rejectionReason: reason,
					confirmationToken: null,
					updatedAt: new Date(),
				},
			});

			return {
				application: updatedApplication,
			};
		} catch (error) {
			console.error("Error rejecting application:", error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to reject application",
			});
		}
	}
}

export const adminService = new AdminService();
