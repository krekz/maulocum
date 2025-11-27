import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
	customSession,
	emailOTP,
	magicLink,
	phoneNumber,
} from "better-auth/plugins";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	basePath: "/api/v2/auth",
	database: prismaAdapter(prisma, {
		provider: "postgresql", // or "mysql", "postgresql", ...etc
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	plugins: [
		customSession(async ({ user, session }) => {
			const isEmployer = await prisma.user.findUnique({
				where: {
					id: user.id,
				},
				select: {
					staffProfile: {
						select: {
							isActive: true,
						},
					},
					phoneNumber: true,
					phoneNumberVerified: true,
				},
			});

			return {
				user: {
					...user,
					isEmployer: isEmployer?.staffProfile?.isActive ?? false,
					phoneNumber: isEmployer?.phoneNumber,
					phoneNumberVerified: isEmployer?.phoneNumberVerified,
				},
				session,
			};
		}),
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				// TODO: Implement email sending service (e.g., Resend, SendGrid, etc.)
				console.log(`Sending ${type} OTP to ${email}: ${otp}`);

				// For development, log the OTP
				// In production, send this via email service
				// Example with Resend:
				// await resend.emails.send({
				//   from: 'noreply@yourdomain.com',
				//   to: email,
				//   subject: type === 'sign-in' ? 'Sign in code' : 'Verification code',
				//   html: `Your verification code is: <strong>${otp}</strong>`,
				// });
			},
			otpLength: 6,
			expiresIn: 300, // 5 minutes
		}),
		magicLink({
			sendMagicLink: async ({ email, token, url }, _request) => {
				// TODO: Implement email sending service (e.g., Resend, SendGrid, etc.)
				console.log("Magic link for", email);
				console.log("URL:", url);
				console.log("Token:", token);

				// For development, log the magic link URL
				// In production, send this via email service
			},
			expiresIn: 300, // 5 minutes
			disableSignUp: false, // Allow new users to sign up via magic link
		}),
		phoneNumber({
			async sendOTP({ phoneNumber, code }) {
				// TODO: Implement SMS service (e.g., Twilio, AWS SNS, etc.)
				console.log(`Sending OTP to ${phoneNumber}: ${code}`);

				// For development, log the OTP
				// In production, send this via SMS service
				// Example with Twilio:
				// await twilioClient.messages.create({
				//   body: `Your verification code is: ${code}`,
				//   to: phoneNumber,
				//   from: process.env.TWILIO_PHONE_NUMBER,
				// });
			},
			otpLength: 6,
			expiresIn: 300, // 5 minutes
			allowedAttempts: 3,
		}),
	],
});

export type UserType = typeof auth.$Infer.Session.user;
