import { z } from "zod";

// FacilityVerification schema
export const facilityVerificationSchema = z.object({
	id: z.cuid(),
	facilityId: z.cuid(),
	businessRegistrationNo: z
		.string()
		.min(1, "Business registration number is required"),
	businessDocumentUrl: z.url("Invalid business document URL"),
	licenseNumber: z.string().optional(),
	licenseDocumentUrl: z.url("Invalid license document URL").optional(),
	verificationStatus: z
		.enum(["PENDING", "APPROVED", "REJECTED"])
		.default("PENDING"),
	rejectionReason: z.string().optional(),
	submittedAt: z.date(),
	reviewedAt: z.date().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Create facility verification schema
export const createFacilityVerificationSchema = facilityVerificationSchema.omit(
	{
		id: true,
		verificationStatus: true,
		submittedAt: true,
		reviewedAt: true,
		createdAt: true,
		updatedAt: true,
		rejectionReason: true,
	},
);

// Update facility verification schema (admin use)
export const updateFacilityVerificationSchema = z.object({
	verificationStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
	rejectionReason: z.string().optional(),
	reviewedAt: z.date().optional(),
});

// Type exports
export type CreateFacilityVerificationInput = z.infer<
	typeof createFacilityVerificationSchema
>;
export type UpdateFacilityVerificationInput = z.infer<
	typeof updateFacilityVerificationSchema
>;
