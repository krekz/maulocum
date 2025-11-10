import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HTTPException } from "hono/http-exception";
import { z } from "zod";
import {
	doctorVerificationApiSchema,
	doctorVerificationUpdateSchema,
} from "@/lib/schemas/doctor-verification.schema";
import { UserRole } from "../../../../prisma/generated/prisma/enums";
import { profileServices } from "../services/profile.services";

const app = new Hono()

	// Upload APC document to R2
	.post(
		"/upload-apc",
		zValidator(
			"form",
			z.object({ file: z.instanceof(File), userId: z.string() }),
		),
		async (c) => {
			try {
				const formData = c.req.valid("form");
				const file = formData.file;
				const userId = formData.userId;

				const result = await profileServices.uploadDoctorAPC(file, userId);

				return c.json(
					{
						success: true,
						data: result,
						message: "File uploaded successfully",
					},
					200,
				);
			} catch (error) {
				console.error("Error uploading file:", error);
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
	// Submit doctor verification
	.post(
		"/verify-doctor",
		zValidator("json", doctorVerificationApiSchema),
		async (c) => {
			const data = c.req.valid("json");

			try {
				const verification =
					await profileServices.submitDoctorVerification(data);

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
	// Replace APC document for existing verification
	.post(
		"/verification/:verificationId/replace-document",
		zValidator("form", z.object({ file: z.instanceof(File) })),
		zValidator("param", z.object({ verificationId: z.string() })),
		async (c) => {
			const { verificationId } = c.req.valid("param");
			const formData = c.req.valid("form");
			const file = formData.file;

			try {
				const uploaded = await profileServices.replaceDocument(
					verificationId,
					file,
				);

				return c.json(
					{
						success: true,
						message: "Document replaced successfully",
						data: { url: uploaded.url, key: uploaded.key },
					},
					200,
				);
			} catch (error) {
				console.error("Error replacing document:", error);
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
	// Update verification details (only for PENDING status)
	.patch(
		"/verification/:verificationId",
		zValidator("param", z.object({ verificationId: z.string() })),
		zValidator("json", doctorVerificationUpdateSchema),
		async (c) => {
			const { verificationId } = c.req.valid("param");
			const data = c.req.valid("json");

			try {
				await profileServices.updateDoctorVerificationDetails(
					verificationId,
					data,
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
