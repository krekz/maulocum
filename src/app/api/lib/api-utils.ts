import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import "server-only";

// Token expiry constants
const TOKEN_EXPIRY_HOURS = 24;

interface TokenExpiryResult {
	isExpired: boolean;
	expiresAt: Date;
	remainingTime: { hours: number; minutes: number };
}

/**
 * Check if a confirmation token has expired based on employerApprovedAt timestamp
 * @param employerApprovedAt - The timestamp when employer approved the application
 * @returns Token expiry status and remaining time
 */
export function checkTokenExpiry(
	employerApprovedAt: Date | null,
): TokenExpiryResult {
	if (!employerApprovedAt) {
		throw new HTTPException(400, { message: "Invalid application state" });
	}

	const expiresAt = new Date(
		employerApprovedAt.getTime() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
	);
	const now = Date.now();
	const isExpired = now > expiresAt.getTime();

	const remainingMs = Math.max(0, expiresAt.getTime() - now);
	const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
	const remainingMinutes = Math.floor(
		(remainingMs % (1000 * 60 * 60)) / (1000 * 60),
	);

	return {
		isExpired,
		expiresAt,
		remainingTime: { hours: remainingHours, minutes: remainingMinutes },
	};
}

/**
 * Handle expired token - clears token and rejects application if not already done
 * @param applicationId - The application ID
 * @param hasToken - Whether the application still has a token
 */
export async function handleExpiredToken(
	applicationId: string,
	hasToken: boolean,
): Promise<void> {
	if (hasToken) {
		await prisma.jobApplication.update({
			where: { id: applicationId },
			data: {
				confirmationToken: null,
				status: "REJECTED",
				rejectedAt: new Date(),
				rejectionReason: "Confirmation link expired (24 hours)",
			},
		});
	}

	throw new HTTPException(410, {
		message:
			"This confirmation link has expired. Please contact the facility for a new invitation.",
	});
}

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
	const staffProfile = await prisma.staffProfile.findUnique({
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
	if (!staffProfile || !staffProfile.isActive) {
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
		staffProfile.facility.facilityVerification?.verificationStatus;

	if (!verificationStatus || verificationStatus !== "APPROVED") {
		console.error(
			`[ERROR] Middleware - Facility ${staffProfile.facilityId} not approved (status: ${verificationStatus || "NONE"})`,
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
	c.set("staffProfile", staffProfile);
	c.set("session", session);
	c.set("user", session.user);

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

	c.set("session", session.session);
	c.set("user", session.user);

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
			doctorVerification: true,
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
	if (doctorProfile.doctorVerification?.verificationStatus !== "APPROVED") {
		console.error(
			`[ERROR] Middleware - Doctor profile ${doctorProfile.id} not approved (status: ${doctorProfile.doctorVerification?.verificationStatus})`,
		);
		return c.json(
			{
				success: false,
				data: null,
				message: `Forbidden - Your doctor profile is ${doctorProfile.doctorVerification?.verificationStatus?.toLowerCase() || "pending"}. Please wait for approval.`,
			},
			403,
		);
	}

	// Store doctor profile in context for downstream use
	c.set("doctorProfile", doctorProfile);
	c.set("session", session.session);
	c.set("user", session.user);

	await next();
};
