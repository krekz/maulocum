import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { jobApplicationService, jobService } from "../services/jobs.service";
import {
	createJobApplicationSchema,
	createJobSchema,
	jobQuerySchema,
	// updateJobApplicationSchema,
	updateJobSchema,
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
	 * POST /api/v2/jobs
	 * Create a new job
	 */
	.post("/", zValidator("json", createJobSchema), async (c) => {
		try {
			const data = c.req.valid("json");
			const job = await jobService.createJob(data);
			return c.json(
				{
					success: true,
					message: "Job created successfully",
					data: job,
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
	})

	/**
	 * PATCH /api/v2/jobs/:id
	 * Update an existing job
	 */
	.patch(
		"/:id",
		zValidator("param", z.object({ id: z.string() })),
		zValidator("json", updateJobSchema),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				const data = c.req.valid("json");
				const job = await jobService.updateJob(id, data);
				return c.json({
					success: true,
					message: "Job updated successfully",
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
		},
	)

	/**
	 * DELETE /api/v2/jobs/:id
	 * Delete a job
	 */
	.delete(
		"/:id",
		zValidator("param", z.object({ id: z.string() })),
		async (c) => {
			try {
				const { id } = c.req.valid("param");
				await jobService.deleteJob(id);
				return c.json({
					success: true,
					message: "Job deleted successfully",
					data: null,
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
	)

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
