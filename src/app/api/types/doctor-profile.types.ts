import { z } from "zod";

// DoctorProfile schema
export const doctorProfileSchema = z.object({
	id: z.cuid(),
	userId: z.string(),
	fullName: z.string().min(1, "Full name is required"),
	phoneNumber: z.string().min(1, "Phone number is required"),
	location: z.string().min(1, "Location is required"),
	specialty: z.string().optional(),
	yearsOfExperience: z
		.number()
		.int()
		.min(0, "Years of experience must be 0 or greater"),
	provisionalId: z.string().optional(),
	fullId: z.string().optional(),
	apcNumber: z.string().min(1, "APC number is required"),
	apcDocumentUrl: z.url("Invalid APC document URL"),
	verificationStatus: z
		.enum(["PENDING", "APPROVED", "REJECTED"])
		.default("PENDING"),
	rejectionReason: z.string().optional(),
	submittedAt: z.date(),
	reviewedAt: z.date().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Create doctor profile schema
export const createDoctorProfileSchema = doctorProfileSchema.omit({
	id: true,
	verificationStatus: true,
	submittedAt: true,
	reviewedAt: true,
	createdAt: true,
	updatedAt: true,
	rejectionReason: true,
});

// Update doctor profile schema (doctor can update their info)
export const updateDoctorProfileSchema = z.object({
	fullName: z.string().min(1, "Full name is required").optional(),
	phoneNumber: z.string().min(1, "Phone number is required").optional(),
	location: z.string().min(1, "Location is required").optional(),
	specialty: z.string().optional(),
	yearsOfExperience: z.number().int().min(0).optional(),
	provisionalId: z.string().optional(),
	fullId: z.string().optional(),
	apcNumber: z.string().min(1, "APC number is required").optional(),
	apcDocumentUrl: z.url("Invalid APC document URL").optional(),
});

// Admin update doctor profile schema (admin can update verification status)
export const adminUpdateDoctorProfileSchema = z.object({
	verificationStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
	rejectionReason: z.string().optional(),
	reviewedAt: z.date().optional(),
});

// Doctor profile query schema
export const doctorProfileQuerySchema = z.object({
	userId: z.string().optional(),
	verificationStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
	specialty: z.string().optional(),
	location: z.string().optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Type exports
export type CreateDoctorProfileInput = z.infer<
	typeof createDoctorProfileSchema
>;
export type UpdateDoctorProfileInput = z.infer<
	typeof updateDoctorProfileSchema
>;
export type AdminUpdateDoctorProfileInput = z.infer<
	typeof adminUpdateDoctorProfileSchema
>;
export type DoctorProfileQuery = z.infer<typeof doctorProfileQuerySchema>;
