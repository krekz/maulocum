/*
  Warnings:

  - You are about to drop the column `applicantId` on the `job_application` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `review` table. All the data in the column will be lost.
  - You are about to drop the `doctor_verification` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[jobId]` on the table `job_application` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."doctor_verification" DROP CONSTRAINT "doctor_verification_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_application" DROP CONSTRAINT "job_application_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."review" DROP CONSTRAINT "review_facilityId_fkey";

-- DropIndex
DROP INDEX "public"."job_application_applicantId_idx";

-- DropIndex
DROP INDEX "public"."job_application_jobId_applicantId_key";

-- DropIndex
DROP INDEX "public"."review_facilityId_idx";

-- AlterTable
ALTER TABLE "job_application" DROP COLUMN "applicantId",
ADD COLUMN     "doctorProfileId" TEXT;

-- AlterTable
ALTER TABLE "review" DROP COLUMN "name",
ADD COLUMN     "doctorProfileId" TEXT,
ALTER COLUMN "facilityId" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."doctor_verification";

-- CreateTable
CREATE TABLE "doctor_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "specialty" TEXT,
    "yearsOfExperience" INTEGER NOT NULL,
    "provisionalId" TEXT,
    "fullId" TEXT,
    "apcNumber" TEXT NOT NULL,
    "apcDocumentUrl" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_profile" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "facility_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_verification" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "businessRegistrationNo" TEXT NOT NULL,
    "businessDocumentUrl" TEXT NOT NULL,
    "licenseNumber" TEXT,
    "licenseDocumentUrl" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profile_userId_key" ON "doctor_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "facility_profile_userId_key" ON "facility_profile"("userId");

-- CreateIndex
CREATE INDEX "facility_profile_facilityId_idx" ON "facility_profile"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "facility_verification_facilityId_key" ON "facility_verification"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "job_application_jobId_key" ON "job_application"("jobId");

-- AddForeignKey
ALTER TABLE "doctor_profile" ADD CONSTRAINT "doctor_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_profile" ADD CONSTRAINT "facility_profile_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_profile" ADD CONSTRAINT "facility_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_verification" ADD CONSTRAINT "facility_verification_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
