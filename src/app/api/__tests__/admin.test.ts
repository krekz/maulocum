import { describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import adminRoute from "../routes/admin.route";

// Create test app
const app = new Hono().route("/api/v2/admin", adminRoute);

describe("Admin Route", () => {
	describe("POST /api/v2/admin/doctors/verifications/action", () => {
		test("should approve doctor verification successfully", async () => {
			const mockDoctorProfile = {
				id: "doctor-1",
				userId: "user-1",
				verificationStatus: "PENDING",
				user: {
					id: "user-1",
					name: "Dr. John Doe",
					email: "doctor@test.com",
					roles: [],
				},
			};

			mock.module("../services/admin.services", () => ({
				adminService: {
					createDoctorVerificationAction: mock(() =>
						Promise.resolve({
							doctorProfile: {
								...mockDoctorProfile,
								verificationStatus: "APPROVED",
							},
						}),
					),
				},
			}));

			const res = await app.request(
				"/api/v2/admin/doctors/verifications/action",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						verificationId: "doctor-1",
						action: "APPROVE",
					}),
				},
			);
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.message).toBe("Verification processed successfully");
			expect(data.data).toBeDefined();
		});

		test("should reject doctor verification with reason", async () => {
			const mockDoctorProfile = {
				id: "doctor-1",
				userId: "user-1",
				verificationStatus: "PENDING",
				user: {
					id: "user-1",
					name: "Dr. John Doe",
					email: "doctor@test.com",
					roles: [],
				},
			};

			mock.module("../services/admin.services", () => ({
				adminService: {
					createDoctorVerificationAction: mock(() =>
						Promise.resolve({
							doctorProfile: {
								...mockDoctorProfile,
								verificationStatus: "REJECTED",
								rejectionReason: "Incomplete documents",
							},
						}),
					),
				},
			}));

			const res = await app.request(
				"/api/v2/admin/doctors/verifications/action",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						verificationId: "doctor-1",
						action: "REJECT",
						rejectionReason: "Incomplete documents",
					}),
				},
			);
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.message).toBe("Verification processed successfully");
			expect(data.data).toBeDefined();
		});

		test("should fail when rejecting without rejection reason", async () => {
			mock.module("../services/admin.services", () => ({
				adminService: {
					createDoctorVerificationAction: mock(() => {
						throw new HTTPException(400, {
							message: "Rejection reason is required",
						});
					}),
				},
			}));

			const res = await app.request(
				"/api/v2/admin/doctors/verifications/action",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						verificationId: "doctor-1",
						action: "REJECT",
					}),
				},
			);
			const data = await res.json();

			expect(res.status).toBeGreaterThanOrEqual(400);
			expect(data.success).toBe(false);
			expect(data.message).toBe("Rejection reason is required");
		});

		test("should fail when verification already processed", async () => {
			mock.module("../services/admin.services", () => ({
				adminService: {
					createDoctorVerificationAction: mock(() => {
						throw new HTTPException(400, {
							message: "Verification has already been processed",
						});
					}),
				},
			}));

			const res = await app.request(
				"/api/v2/admin/doctors/verifications/action",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						verificationId: "doctor-1",
						action: "APPROVE",
					}),
				},
			);
			const data = await res.json();

			expect(res.status).toBe(400);
			expect(data.success).toBe(false);
			expect(data.message).toBe("Verification has already been processed");
		});

		test("should fail with invalid verification ID", async () => {
			mock.module("../services/admin.services", () => ({
				adminService: {
					createDoctorVerificationAction: mock(() => {
						throw new HTTPException(404, {
							message: "Doctor profile not found",
						});
					}),
				},
			}));

			const res = await app.request(
				"/api/v2/admin/doctors/verifications/action",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						verificationId: "non-existent-id",
						action: "APPROVE",
					}),
				},
			);
			const data = await res.json();

			expect(res.status).toBe(404);
			expect(data.success).toBe(false);
			expect(data.message).toBe("Doctor profile not found");
		});

		test("should fail with invalid action type", async () => {
			const res = await app.request(
				"/api/v2/admin/doctors/verifications/action",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						verificationId: "doctor-1",
						action: "INVALID_ACTION",
					}),
				},
			);

			expect(res.status).toBeGreaterThanOrEqual(400);
		});

		test("should fail with missing verificationId", async () => {
			const res = await app.request(
				"/api/v2/admin/doctors/verifications/action",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						action: "APPROVE",
					}),
				},
			);

			expect(res.status).toBeGreaterThanOrEqual(400);
		});

		test("should fail with missing action", async () => {
			const res = await app.request(
				"/api/v2/admin/doctors/verifications/action",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						verificationId: "doctor-1",
					}),
				},
			);

			expect(res.status).toBeGreaterThanOrEqual(400);
		});

		test("should handle service errors gracefully", async () => {
			mock.module("../services/admin.services", () => ({
				adminService: {
					createDoctorVerificationAction: mock(() => {
						throw new HTTPException(500, {
							message: "Failed to create verification action",
						});
					}),
				},
			}));

			const res = await app.request(
				"/api/v2/admin/doctors/verifications/action",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						verificationId: "doctor-1",
						action: "APPROVE",
					}),
				},
			);
			const data = await res.json();

			expect(res.status).toBe(500);
			expect(data.success).toBe(false);
			expect(data.message).toBe("Failed to create verification action");
		});

		test("should approve doctor with existing employer role", async () => {
			const mockDoctorProfile = {
				id: "doctor-1",
				userId: "user-1",
				verificationStatus: "PENDING",
				user: {
					id: "user-1",
					name: "Dr. Jane Doe",
					email: "doctor@test.com",
					roles: ["EMPLOYER"],
				},
			};

			mock.module("../services/admin.services", () => ({
				adminService: {
					createDoctorVerificationAction: mock(() =>
						Promise.resolve({
							doctorProfile: {
								...mockDoctorProfile,
								verificationStatus: "APPROVED",
								user: {
									...mockDoctorProfile.user,
									roles: ["EMPLOYER", "DOCTOR"],
								},
							},
						}),
					),
				},
			}));

			const res = await app.request(
				"/api/v2/admin/doctors/verifications/action",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						verificationId: "doctor-1",
						action: "APPROVE",
					}),
				},
			);
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.message).toBe("Verification processed successfully");
		});

		test("should handle empty request body", async () => {
			const res = await app.request(
				"/api/v2/admin/doctors/verifications/action",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({}),
				},
			);

			expect(res.status).toBeGreaterThanOrEqual(400);
		});

		test("should handle malformed JSON", async () => {
			const res = await app.request(
				"/api/v2/admin/doctors/verifications/action",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: "invalid json",
				},
			);

			expect(res.status).toBeGreaterThanOrEqual(400);
		});
	});
});
