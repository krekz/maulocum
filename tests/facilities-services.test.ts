import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { FacilityService } from "../src/app/api/services/facilities.service";
import { prisma } from "@/lib/prisma";
import { HTTPException } from "hono/http-exception";

// Mock the prisma client
mock.module("@/lib/prisma", () => ({
    prisma: {
        jobApplication: {
            findMany: mock(),
        },
    },
}));

describe("FacilityService - getJobApplicants", () => {
    let service: FacilityService;

    beforeEach(() => {
        service = new FacilityService();
        // Reset the mock before each test to ensure clean state
        (prisma.jobApplication.findMany as any).mockReset();
    });

    afterEach(() => {
        mock.restore();
    });

    it("should successfully fetch job applicants for a valid facilityId", async () => {
        const facilityId = "facility-123";
        const mockData = [
            {
                id: "app-1",
                appliedAt: new Date("2023-01-01"),
                coverLetter: "Interested",
                status: "PENDING",
                updatedAt: new Date("2023-01-01"),
                job: {
                    id: "job-1",
                    title: "GP Locum",
                    startDate: new Date(),
                    endDate: new Date(),
                    startTime: "09:00",
                    endTime: "17:00",
                    location: "KL",
                    payRate: 100,
                    payBasis: "HOURLY",
                    jobType: "LOCUM",
                    urgency: "NORMAL",
                    status: "OPEN",
                },
                DoctorProfile: {
                    id: "doc-1",
                    user: {
                        id: "user-1",
                        name: "Dr. Strange",
                        email: "strange@marvel.com",
                        image: "url",
                        phoneNumber: "1234567890",
                    },
                    doctorVerification: {
                        fullName: "Stephen Strange",
                        phoneNumber: "1234567890",
                        location: "NY",
                        specialty: "Magic",
                        yearsOfExperience: 10,
                        apcNumber: "APC123",
                        verificationStatus: "VERIFIED",
                    },
                },
            },
        ];

        // Setup mock return value
        (prisma.jobApplication.findMany as any).mockResolvedValue(mockData);

        const result = await service.getJobApplicants(facilityId);

        // Assertions
        expect(result).toEqual(mockData);
        expect(prisma.jobApplication.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.jobApplication.findMany).toHaveBeenCalledWith({
            where: {
                job: {
                    facilityId: facilityId,
                },
            },
            select: {
                id: true,
                appliedAt: true,
                coverLetter: true,
                status: true,
                updatedAt: true,
                job: {
                    select: {
                        id: true,
                        title: true,
                        startDate: true,
                        endDate: true,
                        startTime: true,
                        endTime: true,
                        location: true,
                        payRate: true,
                        payBasis: true,
                        jobType: true,
                        urgency: true,
                        status: true,
                    },
                },
                DoctorProfile: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                                phoneNumber: true,
                            },
                        },
                        doctorVerification: {
                            select: {
                                fullName: true,
                                phoneNumber: true,
                                location: true,
                                specialty: true,
                                yearsOfExperience: true,
                                apcNumber: true,
                                verificationStatus: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                appliedAt: "desc",
            },
        });
    });

    it("should return an empty array when no applicants found", async () => {
        const facilityId = "facility-empty";
        (prisma.jobApplication.findMany as any).mockResolvedValue([]);

        const result = await service.getJobApplicants(facilityId);

        expect(result).toEqual([]);
        expect(result).toBeArray();
        expect(result.length).toBe(0);
    });

    it("should handle database connection errors gracefully", async () => {
        const facilityId = "facility-error";
        const dbError = new Error("Database connection failed");
        
        // Mock a database failure
        (prisma.jobApplication.findMany as any).mockRejectedValue(dbError);

        // Expect the service to throw an HTTPException
        try {
            await service.getJobApplicants(facilityId);
            // If it doesn't throw, fail the test
            expect(true).toBe(false); 
        } catch (error: any) {
            expect(error).toBeInstanceOf(HTTPException);
            expect(error.status).toBe(500);
            expect(error.message).toBe("Failed to fetch job applicants");
        }
    });

    it("should handle known HTTPExceptions thrown during execution", async () => {
        const facilityId = "facility-http-error";
        const knownError = new HTTPException(401, { message: "Unauthorized" });
        
        (prisma.jobApplication.findMany as any).mockRejectedValue(knownError);

        try {
            await service.getJobApplicants(facilityId);
            expect(true).toBe(false);
        } catch (error: any) {
            expect(error).toBeInstanceOf(HTTPException);
            // Should preserve the original error status and message
            expect(error.status).toBe(401); 
            expect(error.message).toBe("Unauthorized");
        }
    });

    it("should verify correct ordering of applicants", async () => {
        const facilityId = "facility-order";
        (prisma.jobApplication.findMany as any).mockResolvedValue([]);

        await service.getJobApplicants(facilityId);

        // Verify the orderBy clause specifically
        const callArgs = (prisma.jobApplication.findMany as any).mock.lastCall[0];
        expect(callArgs.orderBy).toEqual({
            appliedAt: "desc",
        });
    });

    it("should verify specific selection of fields to avoid over-fetching", async () => {
        const facilityId = "facility-select";
        (prisma.jobApplication.findMany as any).mockResolvedValue([]);

        await service.getJobApplicants(facilityId);

        const callArgs = (prisma.jobApplication.findMany as any).mock.lastCall[0];
        
        // Verify sensitive fields are NOT selected (like password, etc from user)
        const doctorUserSelect = callArgs.select.DoctorProfile.select.user.select;
        expect(doctorUserSelect).not.toHaveProperty("password");
        expect(doctorUserSelect).not.toHaveProperty("hash");
        expect(doctorUserSelect).toHaveProperty("name");
        expect(doctorUserSelect).toHaveProperty("email");
    });
});