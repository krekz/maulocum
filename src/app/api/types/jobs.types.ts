import { z } from "zod";
import type { Prisma } from "../../../../prisma/generated/prisma/client";

export type GetJobsPromiseReturn = Promise<
	| {
			jobs: Array<{
				id: string;
				title: string;
				description: string | null;
				location: string;
				payRate: string;
				payBasis: string;
				startTime: string;
				endTime: string;
				startDate: Date;
				endDate: Date;
				jobType: string;
				urgency: string;
				status: string;
				requiredSpecialists: string[];
				facilityId: string;
				createdAt: Date;
				updatedAt: Date;
				facility: {
					id: string;
					name: string;
					address: string;
					contactEmail: string;
					contactPhone: string;
					profileImage: string | null;
					description: string | null;
					createdAt: Date;
					updatedAt: Date;
					ownerId: string;
					reviews: Array<{
						id: string;
						rating: number;
						comment: string | null;
						createdAt: Date;
					}>;
					contactInfo: Array<{
						id: string;
						name: string;
						position: string;
						contact: string;
					}>;
				};
				_count: {
					applicants: number;
				};
			}>;
			pagination: {
				total: number;
				page: number;
				limit: number;
				totalPages: number;
			};
	  }
	| {
			jobs: Array<{
				id: string;
				payBasis: string;
				startDate: Date;
				endDate: Date;
			}>;
			pagination: {
				total: number;
				page: number;
				limit: number;
				totalPages: number;
			};
	  }
>;
// @/api/services/jobs.service.ts
export const fullAccessSelect: Prisma.JobSelect = {
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
			createdAt: true,
			updatedAt: true,
			ownerId: true,
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
} as const;

// @/api/services/jobs.service.ts
export const limitedAccessSelect: Prisma.JobSelect = {
	id: true,
	payBasis: true,
	startDate: true,
	endDate: true,
} as const;

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

// Form validation schema
export const jobPostSchema = z
	.object({
		title: z.string().optional(),
		description: z.string().optional(),
		location: z.string(),
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
	jobId: z.cuid(),
	applicantId: z.cuid(),
	status: z.string().default("pending"),
	coverLetter: z.string().optional(),
});

export const updateJobApplicationSchema = z.object({
	status: z.string(),
	coverLetter: z.string().optional(),
});

// Type exports
export type JobQuery = z.infer<typeof jobQuerySchema>;
export type CreateJobApplicationInput = z.infer<
	typeof createJobApplicationSchema
>;
export type UpdateJobApplicationInput = z.infer<
	typeof updateJobApplicationSchema
>;

export type JobPostFormValues = z.infer<typeof jobPostSchema>;
