import { z } from "zod";
import type { Prisma } from "../../../../prisma/generated/prisma/client";

// Select objects defined first
export const fullAccessSelect = {
	id: true,
	title: true,
	description: true,
	location: true,
	payRate: true,
	payBasis: true,
	startTime: true,
	endTime: true,
	startDate: true,
	endDate: true,
	jobType: true,
	urgency: true,
	status: true,
	requiredSpecialists: true,
	facilityId: true,
	createdAt: true,
	updatedAt: true,
	facility: {
		select: {
			id: true,
			name: true,
			address: true,
			contactEmail: true,
			contactPhone: true,
			profileImage: true,
			description: true,
			reviews: {
				select: {
					id: true,
					rating: true,
					comment: true,
					createdAt: true,
				},
			},
			contactInfo: {
				select: {
					id: true,
					name: true,
					position: true,
					contact: true,
				},
			},
		},
	},
	_count: {
		select: {
			applicants: true,
		},
	},
} satisfies Prisma.JobSelect;

export const limitedAccessSelect = {
	id: true,
	payBasis: true,
	startDate: true,
	endDate: true,
	location: true,
	facility: {
		select: {
			address: true,
		},
	},
} satisfies Prisma.JobSelect;

// Dynamic types derived from select objects
export type FullAccessJob = Prisma.JobGetPayload<{
	select: typeof fullAccessSelect;
}>;

export type LimitedAccessJob = Prisma.JobGetPayload<{
	select: typeof limitedAccessSelect;
}>;

type Pagination = {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
};

export type GetJobsPromiseReturn = Promise<
	| { jobs: FullAccessJob[]; pagination: Pagination }
	| { jobs: LimitedAccessJob[]; pagination: Pagination }
>;

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

// API input schema (accepts string dates from HTTP)
export const jobPostInputSchema = z
	.object({
		title: z.string().optional(),
		description: z.string().optional(),
		location: z.string().optional(),
		payRate: z.string().min(1, "Pay rate is required"),
		payBasis: z.enum(PayBasis),
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
		startDate: z.string(),
		endDate: z.string(),
		jobType: z.enum(JobType),
		urgency: z.enum(JobUrgency),
		requiredSpecialists: z.array(z.string()),
	})
	.refine(
		(data) => {
			const start = new Date(data.startDate);
			const end = new Date(data.endDate);
			return end >= start;
		},
		{
			message: "End date must be after or equal to start date",
			path: ["endDate"],
		},
	);

// Form validation schema (uses Date objects for client-side forms)
export const jobPostSchema = z
	.object({
		title: z.string().optional(),
		description: z.string().optional(),
		location: z.string().optional(),
		payRate: z.string().min(1, "Pay rate is required"),
		payBasis: z.enum(PayBasis),
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
		startDate: z.date(),
		endDate: z.date(),
		jobType: z.enum(JobType),
		urgency: z.enum(JobUrgency),
		requiredSpecialists: z.array(z.string()),
	})
	.refine((data) => data.endDate >= data.startDate, {
		message: "End date must be after or equal to start date",
		path: ["endDate"],
	});

// Job query/filter schema
export const jobQuerySchema = z.object({
	status: z.enum(JobStatus).optional(),
	urgency: z.enum(JobUrgency).optional(),
	facilityId: z.cuid().optional(),
	location: z.string().optional(),
	payBasis: z.enum(PayBasis).optional(),
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(10),
});

// Job application schema
export const createJobApplicationSchema = z.object({
	jobId: z.string().min(1, "Job ID is required"),
	coverLetter: z
		.string()
		.max(1000, "Cover letter must be less than 1000 characters")
		.optional(),
});

// Type exports
export type JobQuery = z.infer<typeof jobQuerySchema>;
export type CreateJobApplicationInput = z.infer<
	typeof createJobApplicationSchema
>;

export type JobPostFormValues = z.infer<typeof jobPostSchema>;
