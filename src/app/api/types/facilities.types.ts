import { z } from "zod";

// Base schemas (DRY - reusable components)
export const contactInfoSchema = z.object({
	id: z.cuid(),
	name: z.string().min(1, "Contact name is required"),
	position: z.string().min(1, "Position is required"),
	contact: z.string().min(1, "Contact is required"),
	facilityId: z.cuid(),
	createdAt: z.date(),
});

export const reviewSchema = z.object({
	id: z.cuid(),
	name: z.string().min(1, "Reviewer name is required"),
	rating: z.number().int().min(1).max(5),
	comment: z.string().min(1, "Comment is required"),
	facilityId: z.cuid(),
	createdAt: z.date(),
});

// Facility query/filter schema
export const facilityQuerySchema = z.object({
	ownerId: z.string().optional(),
	search: z.string().optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(10),
});

// Create contact info schema
export const createContactInfoSchema = contactInfoSchema.omit({
	id: true,
	createdAt: true,
});

// Create review schema
export const createReviewSchema = reviewSchema.omit({
	id: true,
	createdAt: true,
});

export const facilityRegistrationSchema = z.object({
	companyName: z
		.string()
		.min(2, "Company name must be at least 2 characters")
		.max(100, "Company name must not exceed 100 characters"),
	address: z
		.string()
		.min(10, "Address must be at least 10 characters")
		.max(200, "Address must not exceed 200 characters"),
	companyEmail: z.email("Invalid email address").toLowerCase(),
	companyPhone: z
		.string()
		.min(10, "Phone number must be at least 10 characters")
		.max(15, "Phone number must not exceed 15 characters")
		.regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
	ssmDocument: z
		.instanceof(File)
		.refine(
			(file) => file.size <= 5 * 1024 * 1024,
			"SSM document must be less than 5MB",
		)
		.refine(
			(file) =>
				["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(
					file.type,
				),
			"SSM document must be PDF or image (JPEG, PNG)",
		),
	clinicLicense: z
		.instanceof(File)
		.refine(
			(file) => file.size <= 5 * 1024 * 1024,
			"Clinic license must be less than 5MB",
		)
		.refine(
			(file) =>
				["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(
					file.type,
				),
			"Clinic license must be PDF or image (JPEG, PNG)",
		),
});

export type FacilityRegistrationInput = z.infer<
	typeof facilityRegistrationSchema
>;

// API schema for facility registration (with Files for form data)
export const facilityRegistrationApiSchema = z.object({
	companyName: z.string().min(2).max(100),
	address: z.string().min(10).max(200),
	companyEmail: z.string().email().toLowerCase(),
	companyPhone: z.string().min(10).max(15),
	ssmDocument: z.instanceof(File),
	clinicLicense: z.instanceof(File),
});

export type FacilityRegistrationApiInput = z.infer<
	typeof facilityRegistrationApiSchema
>;

export type FacilityQuery = z.infer<typeof facilityQuerySchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type CreateContactInfoInput = z.infer<typeof createContactInfoSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
