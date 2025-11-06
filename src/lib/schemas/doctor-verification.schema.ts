import { z } from "zod";

// Base object schema without refinement (for extending)
const baseVerificationSchema = z.object({
	fullName: z.string().min(1, "Full name is required"),
	location: z.string().min(1, "Location is required"),
	specialty: z.string().optional(),
	yearsOfExperience: z.number().min(0, "Years of experience must be positive"),
	provisionalId: z.string().optional(),
	fullId: z.string().optional(),
	apcNumber: z.string().min(1, "APC number is required"),
});

// Refinement function for ID validation
const idRefinement = {
	message: "Either Provisional ID or Full ID must be provided",
	path: ["provisionalId"],
};

// Base schema for doctor verification form (client-side)
export const doctorVerificationFormSchema = baseVerificationSchema.refine(
	(data) => data.provisionalId || data.fullId,
	idRefinement,
);

// Schema for creating verification with file upload
export const doctorVerificationCreateSchema = baseVerificationSchema
	.extend({
		apcDocument: z.instanceof(File).optional(),
	})
	.refine((data) => data.provisionalId || data.fullId, idRefinement);

// Schema for API validation (server-side)
export const doctorVerificationApiSchema = baseVerificationSchema
	.extend({
		userId: z.string(),
		apcDocumentUrl: z.url("Valid document URL is required"),
	})
	.refine((data) => data.provisionalId || data.fullId, idRefinement)
	.transform((data) => ({
		...data,
		fullName: data.fullName.toUpperCase(),
		location: data.location.toUpperCase(),
		specialty: data.specialty?.toUpperCase(),
	}));

// Schema for updating verification (PATCH endpoint)
export const doctorVerificationUpdateSchema = baseVerificationSchema
	.partial()
	.refine(
		(data) => {
			// If either ID is provided, ensure at least one exists
			if (data.provisionalId !== undefined || data.fullId !== undefined) {
				return data.provisionalId || data.fullId;
			}
			return true;
		},
		{
			message: "Either Provisional ID or Full ID must be provided",
			path: ["provisionalId"],
		},
	)
	.transform((data) => ({
		...data,
		fullName: data.fullName?.toUpperCase(),
		location: data.location?.toUpperCase(),
		specialty: data.specialty?.toUpperCase(),
	}));

export type DoctorVerificationFormData = z.infer<
	typeof doctorVerificationFormSchema
>;
export type DoctorVerificationCreateData = z.infer<
	typeof doctorVerificationCreateSchema
>;
export type DoctorVerificationApiData = z.infer<
	typeof doctorVerificationApiSchema
>;
export type DoctorVerificationUpdateData = z.infer<
	typeof doctorVerificationUpdateSchema
>;
