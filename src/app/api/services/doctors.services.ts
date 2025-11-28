import { HTTPException } from "hono/http-exception";
import { prisma } from "@/lib/prisma";
import "server-only";
import type { CreateJobApplicationInput } from "../types/jobs.types";

class DoctorsService {
	/**
	 * Apply for a job
	 */
	async applyForJob(
		doctorProfileId: string,
		data: CreateJobApplicationInput,
	): Promise<{ id: string; status: string; appliedAt: Date }> {
		try {
			// Verify job exists and is open
			const job = await prisma.job.findUnique({
				where: { id: data.jobId },
				select: {
					id: true,
					status: true,
					title: true,
				},
			});

			if (!job) {
				throw new HTTPException(404, {
					message: "Job not found",
				});
			}

			if (job.status !== "OPEN") {
				throw new HTTPException(400, {
					message: `Cannot apply to this job. Job status is ${job.status.toLowerCase()}`,
				});
			}

			// Check if doctor has already applied
			const existingApplication = await prisma.jobApplication.findFirst({
				where: {
					jobId: data.jobId,
					doctorProfileId,
				},
			});

			if (existingApplication) {
				throw new HTTPException(409, {
					message: "You have already applied to this job",
				});
			}

			// Create application
			const application = await prisma.jobApplication.create({
				data: {
					jobId: data.jobId,
					doctorProfileId,
					coverLetter: data.coverLetter,
					status: "PENDING",
				},
				select: {
					id: true,
					status: true,
					appliedAt: true,
				},
			});

			return application;
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to get facilities",
			});
		}
	}

	/**
	 * Get doctor's job applications
	 */
	async getDoctorJobApplications(doctorProfileId: string) {
		try {
			const applications = await prisma.jobApplication.findMany({
				where: {
					doctorProfileId,
				},
				include: {
					job: {
						include: {
							facility: {
								select: {
									id: true,
									name: true,
									address: true,
									profileImage: true,
								},
							},
						},
					},
				},
				orderBy: {
					appliedAt: "desc",
				},
			});

			if (!applications || applications.length === 0) {
				throw new HTTPException(404, {
					message: "No applications found",
				});
			}

			return applications;
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to get facilities",
			});
		}
	}

	/**
	 * Get a specific application
	 */
	async getDoctorJobApplicationById(
		applicationId: string,
		doctorProfileId: string,
	) {
		try {
			const application = await prisma.jobApplication.findFirst({
				where: {
					id: applicationId,
					doctorProfileId,
				},
				include: {
					job: {
						include: {
							facility: {
								select: {
									id: true,
									name: true,
									address: true,
									profileImage: true,
									contactEmail: true,
									contactPhone: true,
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

			return application;
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to get applications",
			});
		}
	}

	/**
	 * Withdraw application (only if status is pending)
	 */
	async withdrawDoctorJobApplication(
		applicationId: string,
		doctorProfileId: string,
	) {
		const application = await prisma.jobApplication.findFirst({
			where: {
				id: applicationId,
				doctorProfileId,
			},
		});

		if (!application) {
			throw new HTTPException(404, {
				message: "Application not found",
			});
		}

		if (application.status !== "PENDING") {
			throw new HTTPException(400, {
				message: `Cannot withdraw application with status: ${application.status}`,
			});
		}

		await prisma.jobApplication.delete({
			where: {
				id: applicationId,
			},
		});

		return { success: true };
	}
}

export const doctorsService = new DoctorsService();
