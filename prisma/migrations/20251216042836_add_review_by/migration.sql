-- CreateEnum
CREATE TYPE "Reviewer" AS ENUM ('AUTOMATED', 'ADMIN');

-- AlterTable
ALTER TABLE "doctor_verification" ADD COLUMN     "reviewedBy" "Reviewer";
