import { HTTPException } from "hono/http-exception";
import type z from "zod";
import { prisma } from "@/lib/prisma";
import {
	deleteFromR2,
	extractKeyFromUrl,
	generateFileKey,
	uploadToR2,
} from "@/lib/r2";
import type {
	DoctorVerificationApiData,
	doctorVerificationUpdateSchema,
} from "@/lib/schemas/doctor-verification.schema";
import type { UserRole } from "../../../../prisma/generated/prisma/enums";

class ProfileServices {
	async getUserProfile(userId: string) {
		try {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				include: {
					doctorProfile: true,
				},
			});

			if (!user) {
				throw new HTTPException(404, { message: "User not found" });
			}

			return user;
		} catch (error) {
			console.error("Error fetching user profile:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, { message: "Failed to fetch user profile" });
		}
	}

	async updateUserRole(userId: string, role: UserRole) {
		try {
			const user = await prisma.user.update({
				where: { id: userId },
				data: { role },
			});

			if (!user) {
				throw new HTTPException(404, { message: "User not found" });
			}

			return user;
		} catch (error) {
			console.error("Error updating user role:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, { message: "Failed to update user role" });
		}
	}

	async updateDoctorVerificationDetails(
		verificationId: string,
		data: z.infer<typeof doctorVerificationUpdateSchema>,
	) {
		try {
			// Check if verification exists and is PENDING or REJECTED
			const verification = await prisma.doctorProfile.findUnique({
				where: { id: verificationId },
			});

			if (!verification) {
				throw new HTTPException(404, { message: "Verification not found" });
			}

			if (
				verification.verificationStatus !== "PENDING" &&
				verification.verificationStatus !== "REJECTED"
			) {
				throw new HTTPException(400, {
					message: "Can only edit verification while it's pending or rejected",
				});
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
		} catch (error) {
			console.error("Error updating verification:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to update verification",
			});
		}
	}

	async replaceDocument(verificationId: string, file: File) {
		try {
			if (!file) {
				throw new HTTPException(400, { message: "File is required" });
			}

			// Get existing verification
			const verification = await prisma.doctorProfile.findUnique({
				where: { id: verificationId },
			});

			if (!verification) {
				throw new HTTPException(404, { message: "Verification not found" });
			}

			if (
				verification.verificationStatus !== "PENDING" &&
				verification.verificationStatus !== "REJECTED"
			) {
				throw new HTTPException(400, {
					message:
						"Can only replace document while verification is pending or rejected",
				});
			}

			// Validate file type
			const allowedTypes = ["application/pdf"];
			if (!allowedTypes.includes(file.type)) {
				throw new HTTPException(400, {
					message: "Invalid file type. Only PDF is allowed",
				});
			}

			// Validate file size (1MB max)
			const maxSize = 1 * 1024 * 1024;
			if (file.size > maxSize) {
				throw new HTTPException(400, {
					message: "File size must be less than 1MB",
				});
			}

			// Convert file to buffer
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			// Upload new file
			const fileKey = generateFileKey(verification.userId, file.name);
			const result = await uploadToR2(buffer, fileKey, file.type);

			const oldKey = extractKeyFromUrl(verification.apcDocumentUrl);
			await deleteFromR2(oldKey);

			// Update verification with new URL
			await prisma.doctorProfile.update({
				where: { id: verificationId },
				data: {
					apcDocumentUrl: result.url,
				},
			});
			return result;
		} catch (error) {
			console.error("Error replacing document:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to replace document",
			});
		}
	}

	async submitDoctorVerification(data: DoctorVerificationApiData) {
		try {
			// Check if user exists
			const user = await prisma.user.findUnique({
				where: { id: data.userId },
				include: { doctorProfile: true },
			});

			if (!user) {
				throw new HTTPException(404, { message: "User not found" });
			}

			// Check if phone number is verified
			if (!user.phoneNumberVerified) {
				throw new HTTPException(403, {
					message:
						"Phone number must be verified before submitting verification",
				});
			}

			// Check if verification already exists
			if (user.doctorProfile) {
				throw new HTTPException(400, {
					message: "Verification already submitted",
				});
			}

			// Get user's phone number from their account
			const userPhone = user.phoneNumber;

			if (!userPhone) {
				throw new HTTPException(400, {
					message: "Phone number is required but not found in user account",
				});
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

			return updatedUser.doctorProfile;
		} catch (error) {
			console.error("Error submitting verification:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to submit verification",
			});
		}
	}

	async uploadDoctorAPC(file: File, userId: string) {
		try {
			if (!file || !userId) {
				throw new HTTPException(400, {
					message: "File and userId are required",
				});
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
				throw new HTTPException(404, {
					message: "User not found",
				});
			}

			// Check if phone number is verified
			if (!user.phoneNumberVerified) {
				throw new HTTPException(403, {
					message: "Phone number must be verified before uploading documents",
				});
			}

			// Prevent spam: Check if user already has a verification submitted
			if (user.doctorProfile) {
				throw new HTTPException(403, {
					message:
						"You have already submitted a verification. Cannot upload more documents.",
				});
			}

			// Validate file type
			const allowedTypes = ["application/pdf"];
			if (!allowedTypes.includes(file.type)) {
				throw new HTTPException(400, {
					message: "Invalid file type. Only PDF is allowed",
				});
			}

			// Validate file size (1MB max)
			const maxSize = 1 * 1024 * 1024;
			if (file.size > maxSize) {
				throw new HTTPException(400, {
					message: "File size must be less than 1MB",
				});
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
			return await uploadToR2(buffer, fileKey, file.type);
		} catch (error) {
			console.error("Error uploading file:", error);
			if (error instanceof HTTPException) throw error;
			throw new HTTPException(500, {
				message: "Failed to upload file",
			});
		}
	}
}
export const profileServices = new ProfileServices();
