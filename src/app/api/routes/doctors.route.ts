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
	);

export default app;
