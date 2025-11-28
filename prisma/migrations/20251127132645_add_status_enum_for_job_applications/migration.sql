/*
  Warnings:

  - The `status` column on the `job_application` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "JobApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "job_application" DROP COLUMN "status",
ADD COLUMN     "status" "JobApplicationStatus" NOT NULL DEFAULT 'PENDING';
