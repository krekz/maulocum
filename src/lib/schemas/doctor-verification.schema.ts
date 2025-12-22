import { z } from "zod";

// Base object schema without refinement (for extending)
export const doctorVerificationSchema = z
	.object({
		fullName: z.string("Full name is ").min(1, "Full name is required"),
		location: z.string("Location is required").min(1, "Location is required"),
		specialty: z.string().optional(),
		yearsOfExperience: z.number(),
		provisionalId: z.string().optional(),
		fullId: z.string().optional(),
		apcNumber: z
			.string("APC number is required")
			.min(3, "APC number must be at least 3 characters long"),
		apcDocument: z.instanceof(File),
	})
	.refine((data) => data.provisionalId || data.fullId, {
		message: "Either Provisional ID or Full ID must be provided",
		path: ["provisionalId"],
	});
export const doctorVerificationSchemaAPI = doctorVerificationSchema
	.omit({ yearsOfExperience: true })
	.extend({
		yearsOfExperience: z.string().min(1, "Years of experience is required"),
	});
export type DoctorVerificationSchema = z.infer<typeof doctorVerificationSchema>;
