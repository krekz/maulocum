/*
  Warnings:

  - You are about to drop the `review` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_doctorProfileId_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_facilityId_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_jobApplicationId_fkey";

-- DropTable
DROP TABLE "review";

-- CreateTable
CREATE TABLE "facility_review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,

    CONSTRAINT "facility_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,

    CONSTRAINT "doctor_review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facility_review_jobApplicationId_key" ON "facility_review"("jobApplicationId");

-- CreateIndex
CREATE INDEX "facility_review_facilityId_idx" ON "facility_review"("facilityId");

-- CreateIndex
CREATE INDEX "facility_review_doctorProfileId_idx" ON "facility_review"("doctorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "facility_review_doctorProfileId_jobApplicationId_key" ON "facility_review"("doctorProfileId", "jobApplicationId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_review_jobApplicationId_key" ON "doctor_review"("jobApplicationId");

-- CreateIndex
CREATE INDEX "doctor_review_facilityId_idx" ON "doctor_review"("facilityId");

-- CreateIndex
CREATE INDEX "doctor_review_doctorProfileId_idx" ON "doctor_review"("doctorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_review_facilityId_jobApplicationId_key" ON "doctor_review"("facilityId", "jobApplicationId");

-- AddForeignKey
ALTER TABLE "facility_review" ADD CONSTRAINT "facility_review_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_review" ADD CONSTRAINT "facility_review_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_review" ADD CONSTRAINT "facility_review_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "job_application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_review" ADD CONSTRAINT "doctor_review_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_review" ADD CONSTRAINT "doctor_review_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_review" ADD CONSTRAINT "doctor_review_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "job_application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
