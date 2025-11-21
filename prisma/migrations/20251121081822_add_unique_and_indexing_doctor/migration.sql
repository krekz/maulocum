/*
  Warnings:

  - A unique constraint covering the columns `[jobId,doctorProfileId]` on the table `job_application` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "job_application_jobId_key";

-- CreateIndex
CREATE INDEX "job_application_doctorProfileId_idx" ON "job_application"("doctorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "job_application_jobId_doctorProfileId_key" ON "job_application"("jobId", "doctorProfileId");
