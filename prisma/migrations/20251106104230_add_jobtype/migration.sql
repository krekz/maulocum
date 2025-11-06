/*
  Warnings:

  - Added the required column `jobType` to the `job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'LOCUM', 'CONTRACT');

-- AlterTable
ALTER TABLE "job" ADD COLUMN     "jobType" "JobType" NOT NULL;
