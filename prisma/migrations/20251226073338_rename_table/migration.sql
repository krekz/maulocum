/*
  Warnings:

  - You are about to drop the `JobBookmark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StaffProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contact_info` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `staff_invitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobBookmark" DROP CONSTRAINT "JobBookmark_doctorProfileId_fkey";

-- DropForeignKey
ALTER TABLE "JobBookmark" DROP CONSTRAINT "JobBookmark_jobId_fkey";

-- DropForeignKey
ALTER TABLE "StaffProfile" DROP CONSTRAINT "StaffProfile_facilityId_fkey";

-- DropForeignKey
ALTER TABLE "StaffProfile" DROP CONSTRAINT "StaffProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "contact_info" DROP CONSTRAINT "contact_info_facilityId_fkey";

-- DropForeignKey
ALTER TABLE "job" DROP CONSTRAINT "job_staffId_fkey";

-- DropForeignKey
ALTER TABLE "staff_invitation" DROP CONSTRAINT "staff_invitation_facilityId_fkey";

-- DropTable
DROP TABLE "JobBookmark";

-- DropTable
DROP TABLE "StaffProfile";

-- DropTable
DROP TABLE "contact_info";

-- DropTable
DROP TABLE "staff_invitation";

-- CreateTable
CREATE TABLE "facility_contact_info" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facility_contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_staff_profile" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "facility_staff_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_bookmark" (
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doctorProfileId" TEXT NOT NULL,

    CONSTRAINT "job_bookmark_pkey" PRIMARY KEY ("jobId","doctorProfileId")
);

-- CreateTable
CREATE TABLE "facility_staff_invitation" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facility_staff_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "facility_contact_info_facilityId_idx" ON "facility_contact_info"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "facility_staff_profile_userId_key" ON "facility_staff_profile"("userId");

-- CreateIndex
CREATE INDEX "facility_staff_profile_facilityId_idx" ON "facility_staff_profile"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "facility_staff_invitation_token_key" ON "facility_staff_invitation"("token");

-- CreateIndex
CREATE INDEX "facility_staff_invitation_token_idx" ON "facility_staff_invitation"("token");

-- CreateIndex
CREATE INDEX "facility_staff_invitation_facilityId_idx" ON "facility_staff_invitation"("facilityId");

-- CreateIndex
CREATE INDEX "facility_staff_invitation_email_idx" ON "facility_staff_invitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "facility_staff_invitation_facilityId_email_key" ON "facility_staff_invitation"("facilityId", "email");

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "facility_staff_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_contact_info" ADD CONSTRAINT "facility_contact_info_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_staff_profile" ADD CONSTRAINT "facility_staff_profile_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_staff_profile" ADD CONSTRAINT "facility_staff_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_bookmark" ADD CONSTRAINT "job_bookmark_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_bookmark" ADD CONSTRAINT "job_bookmark_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_staff_invitation" ADD CONSTRAINT "facility_staff_invitation_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
