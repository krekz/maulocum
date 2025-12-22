import { z } from "zod";

// Base object schema without refinement (for extending)
const pdfFileSchema = z
	.instanceof(File)
	.refine(
		(file) =>
			file.type === "application/pdf" ||
			file.name.toLowerCase().endsWith(".pdf"),
		"Only PDF files are allowed",
	);

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
		apcDocument: pdfFileSchema,
	})
	.refine((data) => data.provisionalId || data.fullId, {
		message: "Either Provisional ID or Full ID must be provided",
		path: ["provisionalId"],
	});

export const doctorCreateExtendedVerificationSchemaAPI =
	doctorVerificationSchema.omit({ yearsOfExperience: true }).extend({
		yearsOfExperience: z.string().min(1, "Years of experience is required"),
	});

export const doctorVerificationEditSchema = doctorVerificationSchema
	.omit({ apcDocument: true })
	.extend({
		apcDocument: pdfFileSchema.optional(),
	});

export const doctorVerificationEditSchemaAPI = doctorVerificationEditSchema
	.omit({ yearsOfExperience: true })
	.extend({
		yearsOfExperience: z.string().min(1, "Years of experience is required"),
		apcDocument: z.preprocess((value) => {
			if (value === "" || value == null || value === "undefined")
				return undefined;
			return value;
		}, pdfFileSchema.optional()),
	});

export type DoctorVerificationSchema = z.infer<typeof doctorVerificationSchema>;
export type DoctorVerificationEditSchema = z.infer<
	typeof doctorVerificationEditSchema
>;
export type DoctorVerificationEditSchemaAPI = z.infer<
	typeof doctorVerificationEditSchemaAPI
>;
