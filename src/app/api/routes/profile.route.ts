import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HTTPException } from "hono/http-exception";
import { z } from "zod";
import {
	doctorCreateExtendedVerificationSchemaAPI,
	doctorVerificationEditSchemaAPI,
} from "@/lib/schemas/doctor-verification.schema";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { requireAuth } from "../lib/api-utils";
import { profileServices } from "../services/profile.services";
import type { ProfileVariables } from "../types/hono.types";

const app = new Hono<{ Variables: ProfileVariables }>()
	// Submit doctor verification
	.post(
		"/verify-doctor",
		zValidator("form", doctorCreateExtendedVerificationSchemaAPI),
		requireAuth,
		async (c) => {
			const data = c.req.valid("form");
			const processedData = {
				...data,
				yearsOfExperience: Number(data.yearsOfExperience),
			};
			const user = c.get("user");

			try {
				const verification = await profileServices.submitDoctorVerification(
					user,
					processedData,
				);

				return c.json(
					{
						success: true,
						data: verification,
						message:
							"Verification submitted successfully. Please wait for admin approval.",
					},
					201,
				);
			} catch (error) {
				console.error("Error submitting verification:", error);
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
	// Update verification details (only for PENDING and REJECTED with AllowAppeal status)
	.patch(
		"/verification/:verificationId",
		zValidator("param", z.object({ verificationId: z.string() })),
		zValidator("form", doctorVerificationEditSchemaAPI),
		async (c) => {
			const { verificationId } = c.req.valid("param");
			const data = c.req.valid("form");
			const processedData = {
				...data,
				yearsOfExperience: Number(data.yearsOfExperience),
			};

			try {
				await profileServices.updateDoctorVerificationDetails(
					verificationId,
					processedData,
				);

				return c.json(
					{
						success: true,
						data: null,
						message: "Verification updated successfully",
					},
					201,
				);
			} catch (error) {
				console.error("Error updating verification:", error);
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
	// Update user role (admin only)
	.patch(
		"/user/:userId/role",
		zValidator("param", z.object({ userId: z.string() })),
		zValidator("json", z.object({ role: z.enum(UserRole) })),
		async (c) => {
			const { userId } = c.req.valid("param");
			const { role } = c.req.valid("json");

			try {
				await profileServices.updateUserRole(userId, role);
				return c.json(
					{
						message: "User role updated successfully",
						success: true,
						data: null,
					},
					201,
				);
			} catch (error) {
				console.error("Error updating user role:", error);
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

	// Get user profile with verification status
	.get(
		"/user/:userId",
		zValidator("param", z.object({ userId: z.string() })),
		async (c) => {
			const { userId } = c.req.valid("param");

			try {
				const user = await profileServices.getUserProfile(userId);

				return c.json(
					{
						message: "User profile fetched successfully",
						success: true,
						data: user,
					},
					200,
				);
			} catch (error) {
				console.error("Error fetching user profile:", error);
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
