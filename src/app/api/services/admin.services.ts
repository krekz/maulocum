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
			const verifications = await prisma.doctorProfile.findMany({
				where: { verificationStatus: "PENDING" },
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
		limit,
		offset,
	}: {
		status?: "PENDING" | "APPROVED" | "REJECTED";
		limit: number;
		offset: number;
	}) {
		try {
			const where: Prisma.DoctorProfileWhereInput = status
				? { verificationStatus: status }
				: {};

			const [verifications, total] = await Promise.all([
				prisma.doctorProfile.findMany({
					where,
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
								image: true,
								role: true,
								createdAt: true,
							},
						},
					},
					orderBy: { createdAt: "desc" },
					take: limit,
					skip: offset,
				}),
				prisma.doctorProfile.count({ where }),
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
			const verification = await prisma.doctorProfile.findUnique({
				where: { id },
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
							role: true,
							phoneNumber: true,
							location: true,
							createdAt: true,
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

	async getVerifiedDoctors({
		search,
		limit,
		offset,
	}: {
		search?: string;
		limit: number;
		offset: number;
	}) {
		try {
			const where: Prisma.UserWhereInput = {
				role: "DOCTOR",
				doctorProfile: {
					verificationStatus: "APPROVED",
				},
			};

			if (search) {
				where.OR = [
					{ name: { contains: search, mode: "insensitive" } },
					{ email: { contains: search, mode: "insensitive" } },
					{
						doctorProfile: {
							apcNumber: { contains: search, mode: "insensitive" },
						},
					},
				];
			}

			const [doctors, total] = await Promise.all([
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

			if (!doctors.length || !total) {
				throw new HTTPException(404, {
					message: "Doctors not found",
				});
			}

			return {
				doctors,
				total,
				limit,
				offset,
				totalPages: Math.ceil(total / limit),
			};
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to get verified doctors",
			});
		}
	}

	async createDoctorVerificationAction({
		doctorId,
		action,
		rejectionReason,
	}: {
		doctorId: string;
		action: "APPROVE" | "REJECT";
		rejectionReason?: string;
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
				await prisma.doctorProfile.update({
					where: { id: doctorProfile.id },
					data: {
						verificationStatus: "APPROVED",
						reviewAt: new Date(),
					},
				});

				// Update user role to DOCTOR
				await prisma.user.update({
					where: { id: doctorProfile.userId },
					data: { role: "DOCTOR" },
				});
			} else {
				// REJECT
				if (!rejectionReason) {
					throw new HTTPException(400, {
						message: "Rejection reason is required",
					});
				}

				// Update verification status to REJECTED
				await prisma.doctorProfile.update({
					where: { id: doctorProfile.id },
					data: {
						verificationStatus: "REJECTED",
						rejectionReason,
						reviewAt: new Date(),
					},
				});

				return {
					doctorProfile: {
						...doctorProfile,
						status: "REJECTED",
						rejectionReason,
					},
				};
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
	}: {
		verificationId: string;
		action: "APPROVE" | "REJECT";
		rejectionReason?: string;
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

			const updatedVerification = await prisma.facility.update({
				where: { id: verification.facilityId },
				data: {
					facilityVerification: {
						update: {
							verificationStatus:
								action === "APPROVE" ? "APPROVED" : "REJECTED",
							rejectionReason: action === "REJECT" ? rejectionReason : null,
							reviewedAt: new Date(),
							updatedAt: new Date(),
						},
					},
					userFacilityProfiles: {
						create: {
							role: "OWNER",
							userId: verification.facility.ownerId,
							isActive: true,
							updatedAt: new Date(),
							createdAt: new Date(),
						},
					},
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

	async getUsers({
		role,
		limit,
		offset,
	}: {
		role?: "USER" | "DOCTOR" | "ADMIN";
		limit: number;
		offset: number;
	}) {
		try {
			const where: Prisma.UserWhereInput = role ? { role: role } : {};

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
				data: { role },
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
}

export const adminService = new AdminService();
