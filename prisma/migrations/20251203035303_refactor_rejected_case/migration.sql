/*
  Warnings:

  - The values [ACCEPTED,REJECTED] on the enum `JobApplicationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "JobApplicationStatus_new" AS ENUM ('PENDING', 'EMPLOYER_APPROVED', 'DOCTOR_CONFIRMED', 'EMPLOYER_REJECTED', 'DOCTOR_REJECTED', 'CANCELLED', 'COMPLETED');
ALTER TABLE "public"."job_application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "job_application" ALTER COLUMN "status" TYPE "JobApplicationStatus_new" USING ("status"::text::"JobApplicationStatus_new");
ALTER TYPE "JobApplicationStatus" RENAME TO "JobApplicationStatus_old";
ALTER TYPE "JobApplicationStatus_new" RENAME TO "JobApplicationStatus";
DROP TYPE "public"."JobApplicationStatus_old";
ALTER TABLE "job_application" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
