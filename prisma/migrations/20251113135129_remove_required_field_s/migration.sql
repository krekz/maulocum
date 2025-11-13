/*
  Warnings:

  - You are about to drop the column `documentUrls` on the `job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "job" DROP COLUMN "documentUrls",
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL;
