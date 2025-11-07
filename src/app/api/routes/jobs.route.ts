import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
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
			return c.json(result);
		} catch (error) {
			console.error(error);
			throw new HTTPException(500, { message: "Failed to fetch jobs" });
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
			if (!job) {
				throw new HTTPException(404, { message: "Job not found" });
			}
			return c.json(job);
		} catch (error) {
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, { message: "Failed to fetch job" });
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
			return c.json(job, 201);
		} catch (error) {
			console.error(error);
			throw new HTTPException(500, { message: "Failed to create job" });
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
				return c.json(job);
			} catch (error) {
				console.error(error);
				throw new HTTPException(500, { message: "Failed to update job" });
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
				return c.json({ message: "Job deleted successfully" });
			} catch (error) {
				console.error(error);
				throw new HTTPException(500, { message: "Failed to delete job" });
			}
		},
	)

	/**
	 * GET /api/v2/jobs/facility/:facilityId
	 * Get jobs by facility
	 */
	.get(
		"/facility/:facilityId",
		zValidator("param", z.object({ facilityId: z.string() })),
		async (c) => {
			try {
				const { facilityId } = c.req.valid("param");
				const jobs = await jobService.getJobsByFacility(facilityId);
				return c.json(jobs);
			} catch (error) {
				console.error(error);
				throw new HTTPException(500, { message: "Failed to fetch jobs" });
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
				return c.json(application, 201);
			} catch (error) {
				if (
					error instanceof Error &&
					error.message.includes("already applied")
				) {
					throw new HTTPException(400, { message: error.message });
				}
				throw new HTTPException(500, {
					message: "Failed to submit application",
				});
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
				return c.json(applications);
			} catch (error) {
				console.error(error);
				throw new HTTPException(500, {
					message: "Failed to fetch applications",
				});
			}
		},
	);

export default app;
