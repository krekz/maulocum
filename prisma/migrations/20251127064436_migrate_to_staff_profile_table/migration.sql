/*
  Warnings:

  - You are about to drop the column `userFacilityProfileId` on the `job` table. All the data in the column will be lost.
  - You are about to drop the `facility_profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "facility_profile" DROP CONSTRAINT "facility_profile_facilityId_fkey";

-- DropForeignKey
ALTER TABLE "facility_profile" DROP CONSTRAINT "facility_profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "job" DROP CONSTRAINT "job_userFacilityProfileId_fkey";

-- AlterTable
ALTER TABLE "job" DROP COLUMN "userFacilityProfileId",
ADD COLUMN     "staffId" TEXT;

-- DropTable
DROP TABLE "facility_profile";

-- CreateTable
CREATE TABLE "StaffProfile" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StaffProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffProfile_userId_key" ON "StaffProfile"("userId");

-- CreateIndex
CREATE INDEX "StaffProfile_facilityId_idx" ON "StaffProfile"("facilityId");

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffProfile" ADD CONSTRAINT "StaffProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
