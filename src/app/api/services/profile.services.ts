import { HTTPException } from "hono/http-exception";
import { prisma } from "@/lib/prisma";
import {
	deleteFromR2,
	extractKeyFromUrl,
	generateFileKey,
	uploadToR2,
} from "@/lib/r2";
import type {
	DoctorVerificationApiData,
	DoctorVerificationEditData,
} from "@/lib/schemas/doctor-verification.schema";
import type { UserRole } from "../../../../prisma/generated/prisma/enums";
import { automatedDoctorVerification } from "../lib/automated-doctor-verification";

class ProfileServices {
	async getUserProfile(userId: string) {
		try {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				include: {
					doctorProfile: {
						include: {
							doctorVerification: true,
						},
					},
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
				data: { roles: { set: [role] } },
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
		data: DoctorVerificationEditData,
	) {
		try {
			// Check if verification exists and is PENDING or REJECTED
			const verification = await prisma.doctorVerification.findUnique({
				where: { id: verificationId },
			});

			if (!verification) {
				throw new HTTPException(404, { message: "Verification not found" });
			}

			if (
				verification.verificationStatus !== "PENDING" &&
				!(
					verification.verificationStatus === "REJECTED" &&
					verification.allowAppeal
				)
			) {
				throw new HTTPException(400, {
					message: "You are not allowed to edit this verification",
				});
			}

			// Update verification
			await prisma.doctorVerification.update({
				where: { id: verificationId },
				data: {
					fullName: data.fullName,
					location: data.location,
					specialty: data.specialty || null,
					yearsOfExperience: data.yearsOfExperience,
					provisionalId: data.provisionalId || null,
					fullId: data.fullId || null,
					apcNumber: data.apcNumber,
					verificationStatus: "PENDING",
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
			const verification = await prisma.doctorVerification.findUnique({
				where: { id: verificationId },
				include: {
					doctorProfile: {
						select: { userId: true },
					},
				},
			});

			if (!verification) {
				throw new HTTPException(404, { message: "Verification not found" });
			}
			if (
				verification.verificationStatus !== "PENDING" &&
				!(
					verification.verificationStatus === "REJECTED" &&
					verification.allowAppeal
				)
			) {
				throw new HTTPException(400, {
					message:
						"You are not allowed to replace document for this verification",
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
			const fileKey = generateFileKey(
				verification.doctorProfile.userId,
				file.name,
			);
			const result = await uploadToR2(buffer, fileKey, file.type);

			const oldKey = extractKeyFromUrl(verification.apcDocumentUrl);
			await deleteFromR2(oldKey);

			// Update verification with new URL and reset to PENDING
			await prisma.doctorVerification.update({
				where: { id: verificationId },
				data: {
					apcDocumentUrl: result.url,
					verificationStatus: "PENDING",
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

			const automatedVerification = await automatedDoctorVerification(
				data.apcDocumentUrl,
				{
					name: data.fullName.trim(),
					fullId: data.fullId,
					provisionalId: data.provisionalId,
				},
			);

			const verificationStatus =
				automatedVerification.success === true ? "APPROVED" : "PENDING";

			// Update user and create doctor profile with verification in a single nested write
			const updatedUser = await prisma.user.update({
				where: { id: data.userId },
				data: {
					location: data.location,
					doctorProfile: {
						create: {
							doctorVerification: {
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
									verificationStatus,
									reviewedBy:
										verificationStatus === "APPROVED" ? "AUTOMATED" : "ADMIN",
								},
							},
						},
					},
				},
				include: {
					doctorProfile: {
						include: {
							doctorVerification: true,
						},
					},
				},
			});

			return updatedUser.doctorProfile?.doctorVerification;
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
