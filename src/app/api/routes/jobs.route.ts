import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { jobApplicationService, jobService } from "../services/jobs.service";
import {
	createJobApplicationSchema,
	jobQuerySchema,
} from "../types/jobs.types";

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
	 * POST /api/v2/jobs/:jobId/apply
	 * Apply to a job
	 */
	.post(
		"/:jobId/apply",
		zValidator("param", z.object({ jobId: z.string() })),
		zValidator("json", createJobApplicationSchema),
		async (c) => {
			try {
				const { jobId } = c.req.valid("param");
				const data = c.req.valid("json");
				const application = await jobApplicationService.createApplication({
					...data,
					jobId,
				});
				return c.json(
					{
						success: true,
						message: "Application submitted successfully",
						data: application,
					},
					201,
				);
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
		},
	)

	/**
	 * GET /api/v2/jobs/:jobId/applications
	 * Get applications for a job
	 */
	.get(
		"/:jobId/applications",
		zValidator("param", z.object({ jobId: z.string() })),
		async (c) => {
			try {
				const { jobId } = c.req.valid("param");
				const applications =
					await jobApplicationService.getApplicationsByJob(jobId);
				return c.json({
					success: true,
					message: "Applications fetched successfully",
					data: applications,
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
		},
	);

export default app;
