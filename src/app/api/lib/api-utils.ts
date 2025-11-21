import type { Context, Next } from "hono";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import "server-only";

export const requireActiveEmployer = async (c: Context, next: Next) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session?.user) {
		console.error("[ERROR] Middleware - No user session found");
		return c.json(
			{
				success: false,
				data: null,
				message: "Unauthorized - Please login",
			},
			401,
		);
	}

	// Fetch full facility profile with verification status
	const facilityProfile = await prisma.userFacilityProfile.findUnique({
		where: { userId: session.user.id },
		include: {
			user: true,
			facility: {
				include: {
					facilityVerification: true,
					contactInfo: true,
					reviews: true,
				},
			},
		},
	});

	// Security: Check facility profile exists and is active
	if (!facilityProfile || !facilityProfile.isActive) {
		console.error(
			`[ERROR] Middleware - No active facility profile for user ${session.user.id}`,
		);
		return c.json(
			{
				success: false,
				data: null,
				message: "Forbidden - Access denied",
			},
			403,
		);
	}

	// Security: Verify facility verification exists and is approved
	const verificationStatus =
		facilityProfile.facility.facilityVerification?.verificationStatus;

	if (!verificationStatus || verificationStatus !== "APPROVED") {
		console.error(
			`[ERROR] Middleware - Facility ${facilityProfile.facilityId} not approved (status: ${verificationStatus || "NONE"})`,
		);
		return c.json(
			{
				success: false,
				data: null,
				message: "Forbidden - Access denied",
			},
			403,
		);
	}

	// Store facility profile in context for downstream use
	c.set("facilityProfile", facilityProfile);
	c.set("session", session);

	await next();
};

export const requireAuth = async (c: Context, next: Next) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session?.user) {
		console.error("[ERROR] Middleware - No user session found");
		return c.json(
			{
				success: false,
				data: null,
				message: "Unauthorized - Please login",
			},
			401,
		);
	}

	await next();
};

export const requireValidDoctorProfile = async (c: Context, next: Next) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session?.user) {
		console.error("[ERROR] Middleware - No user session found");
		return c.json(
			{
				success: false,
				data: null,
				message: "Unauthorized - Please login",
			},
			401,
		);
	}

	// Fetch doctor profile with verification status
	const doctorProfile = await prisma.doctorProfile.findUnique({
		where: { userId: session.user.id },
		include: {
			user: true,
		},
	});

	// Security: Check doctor profile exists
	if (!doctorProfile) {
		console.error(
			`[ERROR] Middleware - No doctor profile found for user ${session.user.id}`,
		);
		return c.json(
			{
				success: false,
				data: null,
				message:
					"Forbidden - Doctor profile not found. Please complete your profile.",
			},
			403,
		);
	}

	// Security: Verify doctor profile is approved
	if (doctorProfile.verificationStatus !== "APPROVED") {
		console.error(
			`[ERROR] Middleware - Doctor profile ${doctorProfile.id} not approved (status: ${doctorProfile.verificationStatus})`,
		);
		return c.json(
			{
				success: false,
				data: null,
				message: `Forbidden - Your doctor profile is ${doctorProfile.verificationStatus.toLowerCase()}. Please wait for approval.`,
			},
			403,
		);
	}

	// Store doctor profile in context for downstream use
	c.set("doctorProfile", doctorProfile);
	c.set("session", session);

	await next();
};
