import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { jobService } from "../services/jobs.service";
import { jobQuerySchema } from "../types/jobs.types";

// Initialize jobs route
const app = new Hono()

	/**
	 * GET /api/v2/jobs
	 * Get all jobs with pagination and filtering
	 */
	.get("/", zValidator("query", jobQuerySchema), async (c) => {
		try {
			const query = c.req.valid("query");
			const result = await jobService.getJobs(query, c);
			return c.json({
				success: true,
				message: "Jobs fetched successfully",
				data: result,
			});
		} catch (error) {
			console.error(error);
			const httpError = error as HTTPException;
			return c.json(
				{
					success: false,
					message: httpError.message,
					data: null,
				},
				httpError.status,
			);
		}
	})

	/**
	 * GET /api/v2/jobs/:id
	 * Get a single job by ID
	 */
	.get("/:id", zValidator("param", z.object({ id: z.string() })), async (c) => {
		try {
			const { id } = c.req.valid("param");
			const job = await jobService.getJobById(id);

			return c.json({
				success: true,
				message: "Job fetched successfully",
				data: job,
			});
		} catch (error) {
			console.error(error);
			const httpError = error as HTTPException;
			return c.json(
				{
					success: false,
					message: httpError.message,
					data: null,
				},
				httpError.status,
			);
		}
	})

	/**
	 * GET /api/v2/jobs/applications/confirm/:token
	 * Get application details by confirmation token (without confirming)
	 */
	.get(
		"/applications/confirm/:token",
		zValidator("param", z.object({ token: z.string() })),
		async (c) => {
			const { token } = c.req.valid("param");

			try {
				const result = await jobService.getApplicationByToken(token);

				return c.json({
					success: true,
					message: "Application details fetched successfully",
					data: {
						...result.application,
						expiresAt: result.expiresAt,
						remainingTime: result.remainingTime,
					},
				});
			} catch (error) {
				console.error("Error fetching application:", error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
						data: null,
					},
					httpError.status,
				);
			}
		},
	)

	/**
	 * POST /api/v2/jobs/applications/confirm/:token
	 * Doctor confirms the job via confirmation link
	 */
	.post(
		"/applications/confirm/:token",
		zValidator("param", z.object({ token: z.string() })),
		async (c) => {
			const { token } = c.req.valid("param");

			try {
				const result = await jobService.confirmApplication(token);

				return c.json({
					success: true,
					message: "Job confirmed! Booking finalized.",
					data: result.application,
				});
			} catch (error) {
				console.error("Error confirming application:", error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
						data: null,
					},
					httpError.status,
				);
			}
		},
	)

	/**
	 * POST /api/v2/jobs/applications/reject/:token
	 * Doctor rejects the job offer via confirmation link
	 */
	.post(
		"/applications/reject/:token",
		zValidator("param", z.object({ token: z.string() })),
		zValidator("json", z.object({ reason: z.string().optional() })),
		async (c) => {
			const { token } = c.req.valid("param");
			const { reason } = c.req.valid("json");

			try {
				const result = await jobService.rejectApplication(token, reason);

				return c.json({
					success: true,
					message: "Job offer declined.",
					data: result.application,
				});
			} catch (error) {
				console.error("Error rejecting application:", error);
				const httpError = error as HTTPException;
				return c.json(
					{
						success: false,
						message: httpError.message,
						data: null,
					},
					httpError.status,
				);
			}
		},
	);

export default app;
