-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('JOB_APPLICATION_RECEIVED', 'JOB_APPLICATION_APPROVED', 'JOB_APPLICATION_CONFIRMED', 'JOB_APPLICATION_REJECTED', 'JOB_APPLICATION_CANCELLED', 'JOB_POSTED', 'REVIEW_RECEIVED', 'VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'FACILITY_VERIFICATION_APPROVED', 'FACILITY_VERIFICATION_REJECTED', 'STAFF_INVITATION_RECEIVED', 'STAFF_INVITATION_ACCEPTED', 'STAFF_INVITATION_REJECTED', 'STAFF_REMOVED', 'REMINDER_UPCOMING_JOB', 'PAYMENT_RECEIVED', 'MESSAGE_RECEIVED');

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "doctorProfileId" TEXT,
    "facilityId" TEXT,
    "jobId" TEXT,
    "jobApplicationId" TEXT,
    "metadata" JSONB,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_userId_isRead_idx" ON "notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notification_doctorProfileId_isRead_idx" ON "notification"("doctorProfileId", "isRead");

-- CreateIndex
CREATE INDEX "notification_facilityId_isRead_idx" ON "notification"("facilityId", "isRead");

-- CreateIndex
CREATE INDEX "notification_createdAt_idx" ON "notification"("createdAt");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "job_application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
