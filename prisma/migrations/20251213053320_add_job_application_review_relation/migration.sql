/*
  Warnings:

  - A unique constraint covering the columns `[jobApplicationId]` on the table `review` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[doctorProfileId,jobApplicationId]` on the table `review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobApplicationId` to the `review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `review` table without a default value. This is not possible if the table is not empty.
  - Made the column `facilityId` on table `review` required. This step will fail if there are existing NULL values in that column.
  - Made the column `doctorProfileId` on table `review` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "review" ADD COLUMN     "jobApplicationId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "facilityId" SET NOT NULL,
ALTER COLUMN "comment" DROP NOT NULL,
ALTER COLUMN "doctorProfileId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "review_jobApplicationId_key" ON "review"("jobApplicationId");

-- CreateIndex
CREATE INDEX "review_facilityId_idx" ON "review"("facilityId");

-- CreateIndex
CREATE INDEX "review_doctorProfileId_idx" ON "review"("doctorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "review_doctorProfileId_jobApplicationId_key" ON "review"("doctorProfileId", "jobApplicationId");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "job_application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
