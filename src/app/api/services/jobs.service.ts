import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
import {
	type CreateJobApplicationInput,
	type CreateJobInput,
	fullAccessSelect,
	type GetJobsPromiseReturn,
	type JobQuery,
	limitedAccessSelect,
	type UpdateJobApplicationInput,
	type UpdateJobInput,
} from "../types/jobs.types";

export class JobService {
	async createJob(data: CreateJobInput) {
		try {
			return prisma.job.create({
				data,
				include: {
					facility: {
						select: {
							id: true,
							name: true,
							address: true,
						},
					},
				},
			});
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, { message: "Failed to create job" });
		}
	}

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
					select: { role: true },
				});
				hasFullAccess = user?.role === "DOCTOR" || user?.role === "ADMIN";
			}

			if (hasFullAccess) {
				const [jobs, total] = await Promise.all([
					prisma.job.findMany({
						where,
						skip,
						take: limit,
						orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
						select: fullAccessSelect,
					}),
					prisma.job.count({ where }),
				]);

				if (!jobs.length) {
					throw new HTTPException(404, { message: "Jobs not found" });
				}

				return {
					jobs,
					pagination: {
						total,
						page,
						limit,
						totalPages: Math.ceil(total / limit),
					},
				};
			} else {
				const [jobs, total] = await Promise.all([
					prisma.job.findMany({
						where,
						skip,
						take: limit,
						orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
						select: limitedAccessSelect,
					}),
					prisma.job.count({ where }),
				]);

				if (!jobs.length) {
					throw new HTTPException(404, { message: "Jobs not found" });
				}

				return {
					jobs,
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

	// Update job
	async updateJob(id: string, data: UpdateJobInput) {
		try {
			return prisma.job.update({
				where: { id },
				data,
				include: {
					facility: {
						select: {
							id: true,
							name: true,
							address: true,
						},
					},
				},
			});
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, { message: "Failed to update job" });
		}
	}

	// Delete job
	async deleteJob(id: string) {
		try {
			return prisma.job.delete({
				where: { id },
			});
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, { message: "Failed to delete job" });
		}
	}
}

// Job Application Service (Single Responsibility Principle)
export class JobApplicationService {
	// Create job application
	async createApplication(data: CreateJobApplicationInput) {
		// Check if already applied
		const existing = await prisma.jobApplication.findUnique({
			where: {
				jobId: data.jobId,
				doctorProfileId: data.applicantId,
			},
		});

		if (existing) {
			throw new Error("You have already applied to this job");
		}

		return prisma.jobApplication.create({
			data,
			include: {
				job: {
					select: {
						id: true,
						title: true,
						facility: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});
	}

	// Get application by ID
	async getApplicationById(id: string) {
		return prisma.jobApplication.findUnique({
			where: { id },
			include: {
				job: {
					include: {
						facility: true,
					},
				},
				DoctorProfile: {
					select: {
						id: true,
						fullName: true,
						phoneNumber: true,
						user: {
							select: {
								email: true,
							},
						},
					},
				},
			},
		});
	}

	// Get applications by job
	async getApplicationsByJob(jobId: string) {
		return prisma.jobApplication.findMany({
			where: { jobId },
			orderBy: { appliedAt: "desc" },
			select: {
				DoctorProfile: {
					select: {
						id: true,
						fullName: true,
						user: {
							select: {
								email: true,
							},
						},
						phoneNumber: true,
					},
				},
			},
		});
	}

	// Get applications by user
	async getApplicationsByUser(applicantId: string) {
		return prisma.jobApplication.findMany({
			where: { doctorProfileId: applicantId },
			orderBy: { appliedAt: "desc" },
			select: {
				job: {
					select: {
						id: true,
						title: true,
						facility: {
							select: {
								id: true,
								name: true,
								address: true,
							},
						},
					},
				},
			},
		});
	}

	// Update application status
	async updateApplication(id: string, data: UpdateJobApplicationInput) {
		return prisma.jobApplication.update({
			where: { id },
			data,
		});
	}

	// Delete application
	async deleteApplication(id: string) {
		return prisma.jobApplication.delete({
			where: { id },
		});
	}
}

// Export singleton instances
export const jobService = new JobService();
export const jobApplicationService = new JobApplicationService();
