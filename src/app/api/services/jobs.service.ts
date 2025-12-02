import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
import { checkTokenExpiry, handleExpiredToken } from "../lib/api-utils";
import {
	fullAccessSelect,
	type GetJobsPromiseReturn,
	type JobQuery,
	limitedAccessSelect,
} from "../types/jobs.types";

// This is for public endpoint in /jobs page. for creating/updating/deleting jobs, is on facility service
export class JobService {
	// Get job by ID
	async getJobById(id: string) {
		try {
			const job = await prisma.job.findUnique({
				where: { id },
				include: {
					facility: {
						select: {
							id: true,
							name: true,
							address: true,
							contactEmail: true,
							contactPhone: true,
						},
					},
					applicants: {
						include: {
							DoctorProfile: true,
						},
					},
				},
			});

			if (!job) {
				throw new HTTPException(404, { message: "Job not found" });
			}
			return job;
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, { message: "Failed to fetch job" });
		}
	}

	// Get all jobs with filters and pagination
	async getJobs(query: JobQuery, c: Context): GetJobsPromiseReturn {
		try {
			const session = await auth.api.getSession({
				headers: c.req.raw.headers,
			});

			const {
				status,
				urgency,
				facilityId,
				location,
				payBasis,
				startDate,
				endDate,
				page,
				limit,
			} = query;

			const where: Prisma.JobWhereInput = {};

			if (status) where.status = status;
			if (urgency) where.urgency = urgency;
			if (facilityId) where.facilityId = facilityId;
			if (location)
				where.location = { contains: location, mode: "insensitive" };
			if (payBasis) where.payBasis = payBasis;
			if (startDate) where.startDate = { gte: startDate };
			if (endDate) where.endDate = { lte: endDate };

			const skip = (page - 1) * limit;

			// Check if user has doctor or admin role
			let hasFullAccess = false;
			if (session?.user?.id) {
				const user = await prisma.user.findUnique({
					where: { id: session.user.id },
					select: { roles: true },
				});
				hasFullAccess =
					user?.roles.includes("DOCTOR") ||
					user?.roles.includes("ADMIN") ||
					false;
			}

			if (hasFullAccess) {
				const [fullAccessJobs, total] = await Promise.all([
					prisma.job.findMany({
						where,
						skip,
						take: limit,
						orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
						select: fullAccessSelect,
					}),
					prisma.job.count({ where }),
				]);

				if (!fullAccessJobs.length) {
					throw new HTTPException(404, { message: "Jobs not found" });
				}

				return {
					jobs: fullAccessJobs,
					pagination: {
						total,
						page,
						limit,
						totalPages: Math.ceil(total / limit),
					},
				};
			} else {
				const [limitedAccessJobs, total] = await Promise.all([
					prisma.job.findMany({
						where,
						skip,
						take: limit,
						orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
						select: limitedAccessSelect,
					}),
					prisma.job.count({ where }),
				]);

				if (!limitedAccessJobs.length) {
					throw new HTTPException(404, { message: "Jobs not found" });
				}

				return {
					jobs: limitedAccessJobs,
					pagination: {
						total,
						page,
						limit,
						totalPages: Math.ceil(total / limit),
					},
				};
			}
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, { message: "Failed to fetch jobs" });
		}
	}

	/**
	 * Get application details by confirmation token (without confirming)
	 * Used to display job details before doctor confirms
	 */
	async getApplicationByToken(confirmationToken: string) {
		try {
			const application = await prisma.jobApplication.findUnique({
				where: { confirmationToken },
				include: {
					job: {
						select: {
							id: true,
							title: true,
							startDate: true,
							endDate: true,
							startTime: true,
							endTime: true,
							location: true,
							facility: {
								select: {
									id: true,
									name: true,
									address: true,
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
								},
							},
						},
					},
				},
			});

			if (!application) {
				throw new HTTPException(404, {
					message: "Invalid or expired confirmation link",
				});
			}

			if (application.status !== "EMPLOYER_APPROVED") {
				throw new HTTPException(400, {
					message:
						application.status === "DOCTOR_CONFIRMED"
							? "This job has already been confirmed"
							: `Cannot view application with status: ${application.status}`,
				});
			}

			// Check token expiry
			const { isExpired, expiresAt, remainingTime } = checkTokenExpiry(
				application.employerApprovedAt,
			);

			if (isExpired) {
				await handleExpiredToken(
					application.id,
					!!application.confirmationToken,
				);
			}

			return {
				application,
				expiresAt: expiresAt.toISOString(),
				remainingTime,
			};
		} catch (error) {
			console.error("Error fetching application by token:", error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to fetch application details",
			});
		}
	}

	/**
	 * Doctor confirms the job via confirmation token
	 * - Validates token
	 * - Updates status to DOCTOR_CONFIRMED
	 * - Finalizes the booking
	 */
	async confirmApplication(confirmationToken: string) {
		try {
			const application = await prisma.jobApplication.findUnique({
				where: { confirmationToken },
				include: {
					job: {
						select: {
							id: true,
							title: true,
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
								},
							},
						},
					},
				},
			});

			if (!application) {
				throw new HTTPException(404, {
					message: "Invalid or expired confirmation link",
				});
			}

			if (application.status !== "EMPLOYER_APPROVED") {
				throw new HTTPException(400, {
					message: `Cannot confirm application with status: ${application.status}`,
				});
			}

			// Check token expiry
			const { isExpired } = checkTokenExpiry(application.employerApprovedAt);

			if (isExpired) {
				await handleExpiredToken(
					application.id,
					!!application.confirmationToken,
				);
			}

			// Update application status to confirmed and job status to FILLED
			const [updatedApplication] = await prisma.$transaction([
				prisma.jobApplication.update({
					where: { id: application.id },
					data: {
						status: "DOCTOR_CONFIRMED",
						doctorConfirmedAt: new Date(),
						confirmationToken: null, // Clear token after use
					},
					include: {
						job: {
							select: {
								id: true,
								title: true,
								facility: {
									select: {
										id: true,
										name: true,
									},
								},
							},
						},
					},
				}),
				prisma.job.update({
					where: { id: application.job.id },
					data: { status: "FILLED" },
				}),
			]);

			// TODO: Send confirmation WhatsApp to employer
			console.log("=== EMPLOYER NOTIFICATION (TODO) ===");
			console.log(`Job: ${application.job.title}`);
			console.log(
				`Doctor ${application.DoctorProfile?.user.name} has confirmed the booking!`,
			);
			console.log("=====================================");

			return {
				application: updatedApplication,
			};
		} catch (error) {
			console.error("Error confirming application:", error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to confirm application",
			});
		}
	}
}

// Export singleton instances
export const jobService = new JobService();
