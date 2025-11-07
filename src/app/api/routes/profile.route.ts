import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
	deleteFromR2,
	extractKeyFromUrl,
	generateFileKey,
	uploadToR2,
} from "@/lib/r2";
import {
	doctorVerificationApiSchema,
	doctorVerificationUpdateSchema,
} from "@/lib/schemas/doctor-verification.schema";

const app = new Hono()
	// Get user profile with verification status
	.get(
		"/user/:userId",
		zValidator("param", z.object({ userId: z.string() })),
		async (c) => {
			const { userId } = c.req.valid("param");

			try {
				const user = await prisma.user.findUnique({
					where: { id: userId },
					include: {
						doctorProfile: true,
					},
				});

				if (!user) {
					return c.json({ error: "User not found" }, 404);
				}

				return c.json({ user });
			} catch (error) {
				console.error("Error fetching user profile:", error);
				return c.json({ error: "Failed to fetch user profile" }, 500);
			}
		},
	)
	// Upload APC document to R2
	.post("/upload-apc", async (c) => {
		try {
			const formData = await c.req.formData();
			const file = formData.get("file") as File;
			const userId = formData.get("userId") as string;

			if (!file || !userId) {
				return c.json({ error: "File and userId are required" }, 400);
			}

			// Verify user exists and phone is verified
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					phoneNumberVerified: true,
					doctorProfile: true,
				},
			});

			if (!user) {
				return c.json({ error: "User not found" }, 404);
			}

			// Check if phone number is verified
			if (!user.phoneNumberVerified) {
				return c.json(
					{ error: "Phone number must be verified before uploading documents" },
					403,
				);
			}

			// Prevent spam: Check if user already has a verification submitted
			if (user.doctorProfile) {
				return c.json(
					{
						error:
							"You have already submitted a verification. Cannot upload more documents.",
					},
					403,
				);
			}

			// Validate file type
			const allowedTypes = ["application/pdf"];
			if (!allowedTypes.includes(file.type)) {
				return c.json({ error: "Invalid file type. Only PDF is allowed" }, 400);
			}

			// Validate file size (1MB max)
			const maxSize = 1 * 1024 * 1024;
			if (file.size > maxSize) {
				return c.json({ error: "File size must be less than 1MB" }, 400);
			}

			// Validate file name (prevent path traversal)
			// const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
			// if (sanitizedFileName !== file.name) {
			// 	return c.json({ error: "Invalid file name" }, 400);
			// }

			// Convert file to buffer
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			// Generate unique key and upload to R2
			const fileKey = generateFileKey(userId, file.name);
			const result = await uploadToR2(buffer, fileKey, file.type);

			return c.json({ url: result.url, key: result.key }, 200);
		} catch (error) {
			console.error("Error uploading file:", error);
			return c.json({ error: "Failed to upload file" }, 500);
		}
	})
	// Submit doctor verification
	.post(
		"/verify-doctor",
		zValidator("json", doctorVerificationApiSchema),
		async (c) => {
			const data = c.req.valid("json");

			try {
				// Check if user exists
				const user = await prisma.user.findUnique({
					where: { id: data.userId },
					include: { doctorProfile: true },
				});

				if (!user) {
					return c.json({ error: "User not found" }, 404);
				}

				// Check if phone number is verified
				if (!user.phoneNumberVerified) {
					return c.json(
						{
							error:
								"Phone number must be verified before submitting verification",
						},
						403,
					);
				}

				// Check if verification already exists
				if (user.doctorProfile) {
					return c.json({ error: "Verification already submitted" }, 400);
				}

				// Get user's phone number from their account
				const userPhone = user.phoneNumber;

				if (!userPhone) {
					return c.json(
						{ error: "Phone number is required but not found in user account" },
						400,
					);
				}

				// Update user and create verification in a single nested write
				const updatedUser = await prisma.user.update({
					where: { id: data.userId },
					data: {
						location: data.location,
						doctorProfile: {
							create: {
								fullName: data.fullName,
								phoneNumber: userPhone,
								location: data.location,
								specialty: data.specialty,
								yearsOfExperience: data.yearsOfExperience,
								provisionalId: data.provisionalId,
								fullId: data.fullId,
								apcNumber: data.apcNumber,
								apcDocumentUrl: data.apcDocumentUrl,
								verificationStatus: "PENDING",
							},
						},
					},
					include: {
						doctorProfile: true,
					},
				});

				const verification = updatedUser.doctorProfile;

				return c.json(
					{
						verification,
						message:
							"Verification submitted successfully. Please wait for admin approval.",
					},
					201,
				);
			} catch (error) {
				console.error("Error submitting verification:", error);
				return c.json({ error: "Failed to submit verification" }, 500);
			}
		},
	)
	// Replace APC document for existing verification
	.post(
		"/verification/:verificationId/replace-document",
		zValidator("param", z.object({ verificationId: z.string() })),
		async (c) => {
			const { verificationId } = c.req.valid("param");

			try {
				const formData = await c.req.formData();
				const file = formData.get("file") as File;

				if (!file) {
					return c.json({ error: "File is required" }, 400);
				}

				// Get existing verification
				const verification = await prisma.doctorProfile.findUnique({
					where: { id: verificationId },
				});

				if (!verification) {
					return c.json({ error: "Verification not found" }, 404);
				}

				if (
					verification.verificationStatus !== "PENDING" &&
					verification.verificationStatus !== "REJECTED"
				) {
					return c.json(
						{
							error:
								"Can only replace document while verification is pending or rejected",
						},
						400,
					);
				}

				// Validate file type
				const allowedTypes = ["application/pdf"];
				if (!allowedTypes.includes(file.type)) {
					return c.json(
						{ error: "Invalid file type. Only PDF is allowed" },
						400,
					);
				}

				// Validate file size (1MB max)
				const maxSize = 1 * 1024 * 1024;
				if (file.size > maxSize) {
					return c.json({ error: "File size must be less than 1MB" }, 400);
				}

				// Convert file to buffer
				const arrayBuffer = await file.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);

				// Upload new file
				const fileKey = generateFileKey(verification.userId, file.name);
				const result = await uploadToR2(buffer, fileKey, file.type);

				// Delete old file
				try {
					const oldKey = extractKeyFromUrl(verification.apcDocumentUrl);
					await deleteFromR2(oldKey);
				} catch (error) {
					console.error("Failed to delete old file:", error);
					// Continue even if deletion fails
				}

				// Update verification with new URL
				await prisma.doctorProfile.update({
					where: { id: verificationId },
					data: {
						apcDocumentUrl: result.url,
					},
				});

				return c.json({ url: result.url, key: result.key }, 200);
			} catch (error) {
				console.error("Error replacing document:", error);
				return c.json({ error: "Failed to replace document" }, 500);
			}
		},
	)
	// Update verification details (only for PENDING status)
	.patch(
		"/verification/:verificationId",
		zValidator("json", doctorVerificationUpdateSchema),
		async (c) => {
			const verificationId = c.req.param("verificationId");
			const data = c.req.valid("json");

			try {
				// Check if verification exists and is PENDING or REJECTED
				const verification = await prisma.doctorProfile.findUnique({
					where: { id: verificationId },
				});

				if (!verification) {
					return c.json({ error: "Verification not found" }, 404);
				}

				if (
					verification.verificationStatus !== "PENDING" &&
					verification.verificationStatus !== "REJECTED"
				) {
					return c.json(
						{
							error:
								"Can only edit verification while it's pending or rejected",
						},
						400,
					);
				}

				// Update verification
				await prisma.doctorProfile.update({
					where: { id: verificationId },
					data: {
						fullName: data.fullName,
						location: data.location,
						specialty: data.specialty || null,
						yearsOfExperience: data.yearsOfExperience,
						provisionalId: data.provisionalId || null,
						fullId: data.fullId || null,
						apcNumber: data.apcNumber,
					},
				});

				return c.json({ ok: true });
			} catch (error) {
				console.error("Error updating verification:", error);
				return c.json({ error: "Failed to update verification" }, 500);
			}
		},
	)
	// Update user role (admin only)
	.patch("/user/:userId/role", async (c) => {
		const userId = c.req.param("userId");
		const { role } = await c.req.json();

		try {
			const user = await prisma.user.update({
				where: { id: userId },
				data: { role },
			});

			return c.json({ user });
		} catch (error) {
			console.error("Error updating user role:", error);
			return c.json({ error: "Failed to update user role" }, 500);
		}
	});

export default app;
