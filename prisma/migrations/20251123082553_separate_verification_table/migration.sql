/*
  Warnings:

  - You are about to drop the column `apcDocumentUrl` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `apcNumber` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `fullId` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `provisionalId` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `reviewAt` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `specialty` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `verificationStatus` on the `doctor_profile` table. All the data in the column will be lost.
  - You are about to drop the column `yearsOfExperience` on the `doctor_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctor_profile" DROP COLUMN "apcDocumentUrl",
DROP COLUMN "apcNumber",
DROP COLUMN "fullId",
DROP COLUMN "fullName",
DROP COLUMN "location",
DROP COLUMN "phoneNumber",
DROP COLUMN "provisionalId",
DROP COLUMN "rejectionReason",
DROP COLUMN "reviewAt",
DROP COLUMN "specialty",
DROP COLUMN "submittedAt",
DROP COLUMN "verificationStatus",
DROP COLUMN "yearsOfExperience";

-- AlterTable
ALTER TABLE "facility_verification" ADD COLUMN     "allowAppeal" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "doctor_verification" (
    "id" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
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
    "allowAppeal" BOOLEAN NOT NULL DEFAULT true,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctor_verification_doctorProfileId_key" ON "doctor_verification"("doctorProfileId");

-- AddForeignKey
ALTER TABLE "doctor_verification" ADD CONSTRAINT "doctor_verification_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
