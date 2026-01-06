-- AlterTable
ALTER TABLE "job" ADD COLUMN     "doctorsNeeded" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "job_accepted_doctor" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_accepted_doctor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_accepted_doctor_applicationId_key" ON "job_accepted_doctor"("applicationId");

-- CreateIndex
CREATE INDEX "job_accepted_doctor_jobId_idx" ON "job_accepted_doctor"("jobId");

-- CreateIndex
CREATE INDEX "job_accepted_doctor_doctorProfileId_idx" ON "job_accepted_doctor"("doctorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "job_accepted_doctor_jobId_doctorProfileId_key" ON "job_accepted_doctor"("jobId", "doctorProfileId");

-- AddForeignKey
ALTER TABLE "job_accepted_doctor" ADD CONSTRAINT "job_accepted_doctor_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_accepted_doctor" ADD CONSTRAINT "job_accepted_doctor_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
