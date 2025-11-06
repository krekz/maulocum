import { z } from "zod";

// FacilityProfile schema
export const facilityProfileSchema = z.object({
	id: z.cuid(),
	userId: z.string(),
	facilityId: z.cuid(),
	role: z.string().min(1, "Role is required"),
	isActive: z.boolean().default(true),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Create facility profile schema
export const createFacilityProfileSchema = facilityProfileSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

// Update facility profile schema
export const updateFacilityProfileSchema = z.object({
	role: z.string().min(1, "Role is required").optional(),
	isActive: z.boolean().optional(),
});

// Facility profile query schema
export const facilityProfileQuerySchema = z.object({
	userId: z.string().optional(),
	facilityId: z.cuid().optional(),
	role: z.string().optional(),
	isActive: z.boolean().optional(),
});

// Type exports
export type CreateFacilityProfileInput = z.infer<
	typeof createFacilityProfileSchema
>;
export type UpdateFacilityProfileInput = z.infer<
	typeof updateFacilityProfileSchema
>;
export type FacilityProfileQuery = z.infer<typeof facilityProfileQuerySchema>;

// Common role constants
export const FACILITY_ROLES = {
	ADMIN: "admin",
	MANAGER: "manager",
	HR: "hr",
	STAFF: "staff",
} as const;

export type FacilityRole = (typeof FACILITY_ROLES)[keyof typeof FACILITY_ROLES];
