/*
  Warnings:

  - A unique constraint covering the columns `[confirmationToken]` on the table `job_application` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JobApplicationStatus" ADD VALUE 'EMPLOYER_APPROVED';
ALTER TYPE "JobApplicationStatus" ADD VALUE 'DOCTOR_CONFIRMED';

-- AlterTable
ALTER TABLE "job_application" ADD COLUMN     "confirmationToken" TEXT,
ADD COLUMN     "doctorConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "employerApprovedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "job_application_confirmationToken_key" ON "job_application"("confirmationToken");

-- CreateIndex
CREATE INDEX "job_application_confirmationToken_idx" ON "job_application"("confirmationToken");
