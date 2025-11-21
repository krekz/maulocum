import { Hono } from "hono";
import { logger } from "hono/logger";
import adminRoute from "@/app/api/routes/admin.route";
import doctorsRoute from "@/app/api/routes/doctors.route";
import facilitiesRoute from "@/app/api/routes/facilities.route";
import jobsRoute from "@/app/api/routes/jobs.route";
import profileRoute from "@/app/api/routes/profile.route";
import { auth } from "@/lib/auth";

const app = new Hono().basePath("/api/v2");

app.use(logger());

app.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));

const routes = app
	.route("/jobs", jobsRoute)
	.route("/facilities", facilitiesRoute)
	.route("/profile", profileRoute)
	.route("/doctors", doctorsRoute)
	.route("/admin", adminRoute);

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;
export const PATCH = app.fetch;

export type APIType = typeof routes;
