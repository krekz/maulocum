import { hc, type InferResponseType } from "hono/client";
import type { APIType } from "@/app/api/[...route]/route";

export const client = hc<APIType>("/", {
	init: {
		credentials: "include",
	},
});
export const backendApi = hc<APIType>(process.env.BETTER_AUTH_URL as string);

export type JobResponse = InferResponseType<typeof backendApi.api.v2.jobs.$get>;
const $getJob = backendApi.api.v2.facilities.jobs[":id"].$get;
export type JobDetailProps = InferResponseType<typeof $getJob>;

// All applicants (includes job data)
type TJobApplicantsResponse = InferResponseType<
	typeof backendApi.api.v2.facilities.jobs.applicants.$get
>;
export type TJobApplicant = NonNullable<TJobApplicantsResponse["data"]>[number];

// Single job applicants - infer from useJobApplicants hook return type
// The API returns different fields than TJobApplicant, so we define it separately
export interface TSingleJobApplicant {
	id: string;
	appliedAt: string;
	status: string;
	coverLetter: string | null;
	updatedAt: string;
	DoctorProfile: {
		id: string;
		user: {
			email: string;
			image: string | null;
		} | null;
		doctorVerification: {
			fullName: string;
			phoneNumber: string;
			location: string;
			specialty: string | null;
			yearsOfExperience: number;
			verificationStatus: string;
		} | null;
		avgRating: number | null;
	} | null;
	doctorReview: {
		id: string;
		rating: number;
	} | null;
}
