import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { requireValidDoctorProfile } from "../lib/api-utils";
import { doctorsService } from "../services/doctors.services";
import type { AppVariables } from "../types/hono.types";
import { createJobApplicationSchema } from "../types/jobs.types";

const app = new Hono<{ Variables: AppVariables }>()

	// Apply for a job
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

	// Get all applications for the logged-in doctor
	.get("/applications", requireValidDoctorProfile, async (c) => {
		try {
			const doctorProfile = c.get("doctorProfile");

			const applications = await doctorsService.getDoctorApplications(
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

	// Get a specific application
	.get(
		"/applications/:applicationId",
		requireValidDoctorProfile,
		zValidator("param", z.object({ applicationId: z.string() })),
		async (c) => {
			try {
				const doctorProfile = c.get("doctorProfile");
				const { applicationId } = c.req.valid("param");

				const application = await doctorsService.getApplication(
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

	// Withdraw an application
	.delete(
		"/applications/:applicationId",
		requireValidDoctorProfile,
		zValidator("param", z.object({ applicationId: z.string() })),
		async (c) => {
			try {
				const doctorProfile = c.get("doctorProfile");
				const { applicationId } = c.req.valid("param");

				await doctorsService.withdrawApplication(
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
