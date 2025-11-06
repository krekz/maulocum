/*
  Warnings:

  - You are about to drop the column `approvedAt` on the `doctor_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctor_profile" DROP COLUMN "approvedAt",
ADD COLUMN     "reviewAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "job" ADD COLUMN     "userFacilityProfileId" TEXT;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_userFacilityProfileId_fkey" FOREIGN KEY ("userFacilityProfileId") REFERENCES "facility_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
