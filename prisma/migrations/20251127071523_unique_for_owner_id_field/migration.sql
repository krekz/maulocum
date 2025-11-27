/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `facility` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "facility_ownerId_key" ON "facility"("ownerId");
