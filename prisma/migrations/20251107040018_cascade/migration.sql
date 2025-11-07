-- DropForeignKey
ALTER TABLE "public"."job_application" DROP CONSTRAINT "job_application_doctorProfileId_fkey";

-- AddForeignKey
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "doctor_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
