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

type TJobApplicantsResponse = InferResponseType<
	typeof backendApi.api.v2.facilities.jobs.applicants.$get
>;
// Extract the single applicant type from the data array
export type TJobApplicant = NonNullable<TJobApplicantsResponse["data"]>[number];
