import { HTTPException } from "hono/http-exception";
import { prisma } from "@/lib/prisma";
import "server-only";
import type { JobApplication } from "../../../../prisma/generated/prisma/client";
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
	 * Auto-marks DOCTOR_CONFIRMED applications as COMPLETED if job timeframe has passed
	 */
	async getDoctorJobApplications(doctorProfileId: string) {
		try {
			const now = new Date();

			// Batch update: mark expired DOCTOR_CONFIRMED applications as COMPLETED
			// Uses a single efficient query with proper indexing
			await prisma.jobApplication.updateMany({
				where: {
					doctorProfileId,
					status: "DOCTOR_CONFIRMED",
					job: {
						endDate: { lt: now },
					},
				},
				data: {
					status: "COMPLETED",
				},
			});

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
					facilityReview: {
						select: {
							id: true,
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

	/**
	 * Cancel application (for PENDING or DOCTOR_CONFIRMED status)
	 * - PENDING: Deleted the job application
	 * - DOCTOR_CONFIRMED: Requires cancellation reason, notifies employer
	 */
	async cancelDoctorJobApplication(
		applicationId: string,
		doctorProfileId: string,
		cancellationReason?: string,
	) {
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
								contactEmail: true,
								contactPhone: true,
							},
						},
					},
				},
				DoctorProfile: {
					include: {
						doctorVerification: {
							select: {
								fullName: true,
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

		// Only allow cancellation for PENDING or EMPLOYER_APPROVED
		const allowedStatuses = ["PENDING", "DOCTOR_CONFIRMED"];
		if (!allowedStatuses.includes(application.status)) {
			throw new HTTPException(400, {
				message: "Cannot cancel application",
			});
		}

		// DOCTOR_CONFIRMED requires a cancellation reason with min 10 chars
		if (application.status === "DOCTOR_CONFIRMED") {
			if (!cancellationReason) {
				throw new HTTPException(400, {
					message:
						"Cancellation reason is required when cancelling a confirmed application",
				});
			}
			if (cancellationReason.length < 10) {
				throw new HTTPException(400, {
					message:
						"Please provide at least 10 characters for the cancellation reason",
				});
			}
			if (cancellationReason.length > 500) {
				throw new HTTPException(400, {
					message: "Cancellation reason must be less than 500 characters",
				});
			}
		}

		// PENDING: delete the application, DOCTOR_CONFIRMED: update status to CANCELLED
		let updatedApplication: JobApplication;
		if (application.status === "PENDING") {
			// Use transaction for atomic delete + job status update
			[updatedApplication] = await prisma.$transaction([
				prisma.jobApplication.delete({
					where: { id: applicationId },
				}),
				prisma.job.update({
					where: { id: application.jobId },
					data: { status: "OPEN" },
				}),
			]);
		} else {
			updatedApplication = await prisma.jobApplication.update({
				where: { id: applicationId },
				data: {
					status: "CANCELLED",
					cancelledAt: new Date(),
					cancellationReason: cancellationReason || null,
					job: {
						update: {
							status: "OPEN",
							updatedAt: new Date(),
						},
					},
				},
			});
		}

		// Notify employer if the application was already approved
		if (application.status === "DOCTOR_CONFIRMED") {
			const doctorName =
				application.DoctorProfile?.doctorVerification?.fullName || "A doctor";
			const jobTitle = application.job.title || "Untitled Job";
			const facilityEmail = application.job.facility.contactEmail;
			const facilityPhone = application.job.facility.contactPhone;

			// TODO: Implement actual WhatsApp notification
			console.log("=== WHATSAPP NOTIFICATION (TODO) ===");
			console.log(`To: ${facilityPhone}`);
			console.log(
				`Message: ${doctorName} has cancelled their confirmed application for "${jobTitle}".`,
			);
			console.log(`Reason: ${cancellationReason}`);
			console.log("=====================================");

			// TODO: Implement actual email notification
			console.log("=== EMAIL NOTIFICATION (TODO) ===");
			console.log(`To: ${facilityEmail}`);
			console.log(`Subject: Application Cancelled - ${jobTitle}`);
			console.log(
				`Body: ${doctorName} has cancelled their confirmed application for "${jobTitle}".`,
			);
			console.log(`Reason: ${cancellationReason}`);
			console.log("==================================");
		}

		return {
			success: true,
			data: updatedApplication,
			notifiedEmployer: application.status === "EMPLOYER_APPROVED",
		};
	}

	/**
	 * Submit a facility review for a completed job
	 * Only allowed for COMPLETED job applications
	 * Doctor reviews the facility they worked at
	 */
	async submitFacilityReview(
		doctorProfileId: string,
		jobId: string,
		rating: number,
		comment?: string,
	) {
		// Find the job application for this doctor and job
		const application = await prisma.jobApplication.findFirst({
			where: {
				jobId,
				doctorProfileId,
			},
			include: {
				job: {
					select: {
						facilityId: true,
						title: true,
					},
				},
				facilityReview: {
					select: { id: true },
				},
			},
		});

		if (!application) {
			throw new HTTPException(404, {
				message: "Job application not found",
			});
		}

		// Only allow reviews for completed jobs
		if (application.status !== "COMPLETED") {
			throw new HTTPException(400, {
				message: "Reviews can only be submitted for completed jobs",
			});
		}

		// Check if review already exists
		if (application.facilityReview) {
			throw new HTTPException(409, {
				message: "You have already reviewed this facility for this job",
			});
		}

		// Create the facility review
		const review = await prisma.facilityReview.create({
			data: {
				rating,
				comment,
				doctorProfileId,
				facilityId: application.job.facilityId,
				jobApplicationId: application.id,
			},
			select: {
				id: true,
				rating: true,
				comment: true,
				createdAt: true,
			},
		});

		return review;
	}

	/**
	 * Check if a doctor can review a facility for a specific job
	 */
	async canReviewFacility(doctorProfileId: string, jobId: string) {
		const application = await prisma.jobApplication.findFirst({
			where: {
				jobId,
				doctorProfileId,
				status: "COMPLETED",
			},
			include: {
				facilityReview: {
					select: { id: true },
				},
			},
		});

		if (!application) {
			return { canReview: false, reason: "No completed application found" };
		}

		if (application.facilityReview) {
			return { canReview: false, reason: "Already reviewed" };
		}

		return { canReview: true, reason: null };
	}

	/**
	 * Get all facility reviews made by a doctor
	 */
	async getDoctorFacilityReviews(doctorProfileId: string) {
		const reviews = await prisma.facilityReview.findMany({
			where: {
				doctorProfileId,
			},
			select: {
				id: true,
				rating: true,
				comment: true,
				createdAt: true,
				updatedAt: true,
				facility: {
					select: {
						id: true,
						name: true,
						address: true,
						profileImage: true,
					},
				},
				jobApplication: {
					select: {
						id: true,
						job: {
							select: {
								id: true,
								title: true,
								startDate: true,
								endDate: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return reviews;
	}

	async submitJobBookmark(doctorProfileId: string, jobId: string) {
		try {
			const checkJobExist = await prisma.job.findUnique({
				where: { id: jobId },
				select: { id: true },
			});

			if (!checkJobExist) {
				throw new HTTPException(404, {
					message: "Job not found",
				});
			}

			const existingBookmark = await prisma.jobBookmark.findUnique({
				where: {
					jobId_doctorProfileId: { jobId, doctorProfileId },
				},
			});

			if (existingBookmark) {
				await prisma.jobBookmark.delete({
					where: {
						jobId_doctorProfileId: { jobId, doctorProfileId },
					},
				});
				return { bookmarked: false };
			}

			await prisma.jobBookmark.create({
				data: { jobId, doctorProfileId },
			});
			return { bookmarked: true };
		} catch (error) {
			console.error(error);
			if (error instanceof HTTPException) throw error;

			throw new HTTPException(500, {
				message: "Failed to bookmark job",
			});
		}
	}

	async getBookmarkedJobs(doctorProfileId: string) {
		try {
			const bookmarks = await prisma.jobBookmark.findMany({
				where: { doctorProfileId },
				orderBy: { createdAt: "desc" },
				include: {
					job: {
						select: {
							id: true,
							title: true,
							location: true,
							payRate: true,
							payBasis: true,
							requiredSpecialists: true,
							startDate: true,
							facility: {
								select: {
									name: true,
								},
							},
						},
					},
				},
			});

			return bookmarks.map((b) => ({
				id: b.job.id,
				title: b.job.title,
				facilityName: b.job.facility.name,
				date: b.job.startDate,
				location: b.job.location,
				specialist: b.job.requiredSpecialists[0] ?? null,
				payRate: b.job.payRate,
				payBasis: b.job.payBasis,
				bookmarkedAt: b.createdAt,
			}));
		} catch (error) {
			console.error(error);
			throw new HTTPException(500, {
				message: "Failed to fetch bookmarked jobs",
			});
		}
	}
}

export const doctorsService = new DoctorsService();
