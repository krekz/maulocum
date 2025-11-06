import { z } from "zod";

// Enums
export const JobUrgency = {
	HIGH: "HIGH",
	MEDIUM: "MEDIUM",
	LOW: "LOW",
} as const;

export const JobStatus = {
	OPEN: "OPEN",
	CLOSED: "CLOSED",
	FILLED: "FILLED",
} as const;

export const PayBasis = {
	HOURLY: "HOURLY",
	DAILY: "DAILY",
	WEEKLY: "WEEKLY",
	MONTHLY: "MONTHLY",
} as const;

export const JobType = {
	FULL_TIME: "FULL_TIME",
	PART_TIME: "PART_TIME",
	LOCUM: "LOCUM",
	CONTRACT: "CONTRACT",
} as const;

// Job schema
export const jobSchema = z
	.object({
		id: z.cuid(),
		title: z.string().min(1, "Job title is required"),
		description: z.string().optional(),
		location: z.string().min(1, "Location is required"),
		payRate: z.string().min(1, "Pay rate is required"),
		payBasis: z.enum(["HOURLY", "DAILY", "WEEKLY", "MONTHLY"]),
		startTime: z
			.string()
			.regex(
				/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
				"Invalid time format (HH:MM)",
			),
		endTime: z
			.string()
			.regex(
				/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
				"Invalid time format (HH:MM)",
			),
		startDate: z.coerce.date(),
		endDate: z.coerce.date(),
		urgency: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
		status: z.enum(["OPEN", "CLOSED", "FILLED"]).default("OPEN"),
		requiredSpecialists: z.array(z.string()).default([]),
		documentUrls: z.array(z.url()).default([]),
		facilityId: z.cuid(),
		createdAt: z.date(),
		updatedAt: z.date(),
		jobType: z.enum(JobType),
	})
	.refine((data) => data.endDate >= data.startDate, {
		message: "End date must be after or equal to start date",
		path: ["endDate"],
	});

// Create job schema (omit auto-generated fields)
export const createJobSchema = jobSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	status: true,
	createdBy: true,
});

// Update job schema (all fields optional)
export const updateJobSchema = createJobSchema.partial();

// Job query/filter schema
export const jobQuerySchema = z.object({
	status: z.enum(["OPEN", "CLOSED", "FILLED"]).optional(),
	urgency: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
	facilityId: z.string().cuid().optional(),
	location: z.string().optional(),
	payBasis: z.enum(["HOURLY", "DAILY", "WEEKLY", "MONTHLY"]).optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(10),
});

// Job application schema
export const jobApplicationSchema = z.object({
	id: z.cuid(),
	jobId: z.cuid(),
	applicantId: z.string(),
	status: z.string().default("pending"),
	coverLetter: z.string().optional(),
	appliedAt: z.date(),
	updatedAt: z.date(),
});

export const createJobApplicationSchema = jobApplicationSchema.omit({
	id: true,
	appliedAt: true,
	updatedAt: true,
});

export const updateJobApplicationSchema = z.object({
	status: z.string(),
	coverLetter: z.string().optional(),
});

// Type exports
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobQuery = z.infer<typeof jobQuerySchema>;
export type CreateJobApplicationInput = z.infer<
	typeof createJobApplicationSchema
>;
export type UpdateJobApplicationInput = z.infer<
	typeof updateJobApplicationSchema
>;
