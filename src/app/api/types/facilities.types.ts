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

// Facility schema
export const facilitySchema = z.object({
	name: z.string().min(1, "Facility name is required"),
	address: z.string().min(1, "Address is required"),
	contactEmail: z.email("Invalid email address"),
	contactPhone: z.string().min(1, "Contact phone is required"),
	profileImage: z.url().optional(),
	description: z.string().optional(),
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

// Type exports
export type Facility = z.infer<typeof facilitySchema>;
export type CreateFacilityInput = z.infer<typeof facilitySchema>;
export type UpdateFacilityInput = z.infer<typeof facilitySchema>;
export type FacilityQuery = z.infer<typeof facilityQuerySchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type CreateContactInfoInput = z.infer<typeof createContactInfoSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
