-- AlterTable
ALTER TABLE "facility" ADD COLUMN     "facilitiesServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "operatingHours" TEXT,
ADD COLUMN     "website" TEXT;
