import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { requireValidDoctorProfile } from "../lib/api-utils";
import { doctorsService } from "../services/doctors.services";
import type { AppVariables } from "../types/hono.types";
import { createJobApplicationSchema } from "../types/jobs.types";

const app = new Hono<{ Variables: AppVariables }>()

	/*
	 * Apply for a job
	 * POST /api/v2/doctors/applications
	 */
	.post(
		"/applications",
		requireValidDoctorProfile,
		zValidator("json", createJobApplicationSchema),
		async (c) => {
			try {
				const doctorProfile = c.get("doctorProfile");
				const data = c.req.valid("json");

				const application = await doctorsService.applyForJob(
					doctorProfile.id,
					data,
				);

				return c.json(
					{
						success: true,
						data: application,
						message: "Application submitted successfully",
					},
					201,
				);
			} catch (error) {
				console.error("Error applying for job:", error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
						data: null,
					},
					httpError.status || 500,
				);
			}
		},
	)

	/*
	 * Get all applications for the logged-in doctor
	 * GET /api/v2/doctors/applications
	 */
	.get("/applications", requireValidDoctorProfile, async (c) => {
		try {
			const doctorProfile = c.get("doctorProfile");

			const applications = await doctorsService.getDoctorJobApplications(
				doctorProfile.id,
			);

			return c.json(
				{
					success: true,
					data: applications,
					message: "Applications fetched successfully",
				},
				200,
			);
		} catch (error) {
			console.error("Error fetching applications:", error);
			const httpError = error as HTTPException;
			return c.json(
				{
					success: false,
					message: httpError.message,
					data: null,
				},
				httpError.status || 500,
			);
		}
	})

	/*
	 * Get a specific application
	 * GET /api/v2/doctors/applications/:applicationId
	 */
	.get(
		"/applications/:applicationId",
		requireValidDoctorProfile,
		zValidator("param", z.object({ applicationId: z.string() })),
		async (c) => {
			try {
				const doctorProfile = c.get("doctorProfile");
				const { applicationId } = c.req.valid("param");

				const application = await doctorsService.getDoctorJobApplicationById(
					applicationId,
					doctorProfile.id,
				);

				return c.json(
					{
						success: true,
						data: application,
						message: "Application fetched successfully",
					},
					200,
				);
			} catch (error) {
				console.error("Error fetching application:", error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
						data: null,
					},
					httpError.status || 500,
				);
			}
		},
	)

	/*
	 * Withdraw an application
	 * DELETE /api/v2/doctors/applications/:applicationId
	 */
	.delete(
		"/applications/:applicationId",
		requireValidDoctorProfile,
		zValidator("param", z.object({ applicationId: z.string() })),
		async (c) => {
			try {
				const doctorProfile = c.get("doctorProfile");
				const { applicationId } = c.req.valid("param");

				await doctorsService.withdrawDoctorJobApplication(
					applicationId,
					doctorProfile.id,
				);

				return c.json(
					{
						success: true,
						data: null,
						message: "Application withdrawn successfully",
					},
					200,
				);
			} catch (error) {
				console.error("Error withdrawing application:", error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
						data: null,
					},
					httpError.status || 500,
				);
			}
		},
	)

	/*
	 * Cancel an application (PENDING or EMPLOYER_APPROVED)
	 * POST /api/v2/doctors/applications/:applicationId/cancel
	 */
	.post(
		"/applications/:applicationId/cancel",
		requireValidDoctorProfile,
		zValidator("param", z.object({ applicationId: z.string() })),
		zValidator(
			"json",
			z.object({
				cancellationReason: z
					.string()
					.min(10, "Please provide at least 10 characters")
					.max(500, "Reason must be less than 500 characters")
					.optional(),
			}),
		),
		async (c) => {
			try {
				const doctorProfile = c.get("doctorProfile");
				const { applicationId } = c.req.valid("param");
				const { cancellationReason } = c.req.valid("json");

				const result = await doctorsService.cancelDoctorJobApplication(
					applicationId,
					doctorProfile.id,
					cancellationReason,
				);

				return c.json(
					{
						success: true,
						data: result.data,
						message: result.notifiedEmployer
							? "Application cancelled. The employer has been notified."
							: "Application cancelled successfully",
					},
					200,
				);
			} catch (error) {
				console.error("Error cancelling application:", error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
						data: null,
					},
					httpError.status || 500,
				);
			}
		},
	)

	/*
	 * Submit a review for a completed job
	 * POST /api/v2/doctors/jobs/:jobId/review
	 */
	.post(
		"/jobs/:jobId/review",
		requireValidDoctorProfile,
		zValidator(
			"param",
			z.object({
				jobId: z.cuid().min(5, "Job ID is required"),
			}),
		),
		zValidator(
			"json",
			z.object({
				rating: z
					.number()
					.int("Rating must be a whole number")
					.min(1, "Rating must be at least 1")
					.max(5, "Rating cannot exceed 5"),
				comment: z
					.string()
					.max(1000, "Comment must be less than 1000 characters")
					.optional(),
			}),
		),
		async (c) => {
			try {
				const { jobId } = c.req.valid("param");
				const { rating, comment } = c.req.valid("json");
				const doctorProfile = c.get("doctorProfile");

				const review = await doctorsService.submitFacilityReview(
					doctorProfile.id,
					jobId,
					rating,
					comment,
				);

				return c.json(
					{
						success: true,
						data: review,
						message: "Review submitted successfully",
					},
					201,
				);
			} catch (error) {
				console.error("Error submitting review:", error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
						data: null,
					},
					httpError.status || 500,
				);
			}
		},
	)

	/*
	 * Get all facility reviews made by the doctor
	 * GET /api/v2/doctors/jobs/reviews
	 */
	.get("/jobs/reviews", requireValidDoctorProfile, async (c) => {
		try {
			const doctorProfile = c.get("doctorProfile");

			const reviews = await doctorsService.getDoctorFacilityReviews(
				doctorProfile.id,
			);

			return c.json(
				{
					success: true,
					data: reviews,
					message: "Reviews fetched successfully",
				},
				200,
			);
		} catch (error) {
			console.error("Error fetching reviews:", error);
			const httpError = error as HTTPException;
			return c.json(
				{
					success: false,
					message: httpError.message,
					data: null,
				},
				httpError.status || 500,
			);
		}
	})
	.get("/bookmarks", requireValidDoctorProfile, async (c) => {
		try {
			const doctorId = c.get("doctorProfile").id;
			const bookmarks = await doctorsService.getBookmarkedJobs(doctorId);

			return c.json(
				{
					success: true,
					data: bookmarks,
				},
				200,
			);
		} catch (error) {
			console.error("Error fetching bookmarks:", error);
			const httpError = error as HTTPException;
			return c.json(
				{
					success: false,
					message: httpError.message,
					data: null,
				},
				httpError.status || 500,
			);
		}
	})
	.post(
		"/bookmarks",
		requireValidDoctorProfile,
		zValidator(
			"json",
			z.object({ jobId: z.cuid().min(5, "Job ID is required") }),
		),
		async (c) => {
			try {
				const doctorId = c.get("doctorProfile").id;
				const { jobId } = c.req.valid("json");

				const result = await doctorsService.submitJobBookmark(doctorId, jobId);

				return c.json(
					{
						success: true,
						bookmarked: result.bookmarked,
						message: result.bookmarked
							? "Job bookmarked successfully"
							: "Bookmark removed successfully",
					},
					200,
				);
			} catch (error) {
				console.error("Error toggling bookmark:", error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
					},
					httpError.status || 500,
				);
			}
		},
	);

export default app;
