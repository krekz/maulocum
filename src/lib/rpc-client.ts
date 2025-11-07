import { hc, type InferResponseType } from "hono/client";
import type { APIType } from "@/app/api/[...route]/route";

export const client = hc<APIType>("/");
export const backendApi = hc<APIType>(process.env.BETTER_AUTH_URL as string);

export type JobResponse = InferResponseType<typeof backendApi.api.v2.jobs.$get>;
