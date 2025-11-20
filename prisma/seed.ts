import { PrismaClient, UserRole, JobType, JobUrgency, JobStatus, PayBasis, VerificationStatus } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create default clinic owner user
  const clinicOwner = await prisma.user.upsert({
    where: { email: "clinic.owner@maulocum.com" },
    update: {},
    create: {
      id: "default_clinic_owner_001",
      name: "Dr. Ahmad Clinic Owner",
      email: "clinic.owner@maulocum.com",
      emailVerified: true,
      roles: [UserRole.EMPLOYER],
      phoneNumber: "+60123456789",
      phoneNumberVerified: true,
      location: "Kuala Lumpur, Malaysia",
    },
  });

  console.log("✅ Created clinic owner:", clinicOwner.email);

  // Create or get default clinic/facility
  let clinic = await prisma.facility.findFirst({
    where: { 
      ownerId: clinicOwner.id,
      name: "DEFAULT_Klinik Kesihatan Utama"
    },
  });

  if (!clinic) {
    clinic = await prisma.facility.create({
      data: {
        name: "DEFAULT_Klinik Kesihatan Utama",
        address: "123 Jalan Sehat, Taman Medik, 50000 Kuala Lumpur, Malaysia",
        contactEmail: "info@klinikutama.com",
        contactPhone: "+60321234567",
        description: "A premier healthcare facility providing comprehensive medical services with state-of-the-art equipment and experienced medical professionals.",
        profileImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
        ownerId: clinicOwner.id,
      },
    });
    console.log("✅ Created clinic:", clinic.name);
  } else {
    console.log("✅ Clinic already exists:", clinic.name);
  }

  // Create or get UserFacilityProfile for the owner
  const facilityProfile = await prisma.userFacilityProfile.upsert({
    where: { userId: clinicOwner.id },
    update: {
      facilityId: clinic.id,
      role: "owner",
      isActive: true,
    },
    create: {
      userId: clinicOwner.id,
      facilityId: clinic.id,
      role: "owner",
      isActive: true,
    },
  });

  console.log("✅ Created/Updated facility profile for owner");

  // Create or update facility verification
  await prisma.facilityVerification.upsert({
    where: { facilityId: clinic.id },
    update: {
      businessRegistrationNo: "ROC-2024-KL-001234",
      businessDocumentUrl: "https://example.com/documents/business-registration.pdf",
      licenseNumber: "MOH-KL-2024-5678",
      licenseDocumentUrl: "https://example.com/documents/medical-license.pdf",
      verificationStatus: VerificationStatus.APPROVED,
      submittedAt: new Date(),
      reviewedAt: new Date(),
    },
    create: {
      facilityId: clinic.id,
      businessRegistrationNo: "ROC-2024-KL-001234",
      businessDocumentUrl: "https://example.com/documents/business-registration.pdf",
      licenseNumber: "MOH-KL-2024-5678",
      licenseDocumentUrl: "https://example.com/documents/medical-license.pdf",
      verificationStatus: VerificationStatus.APPROVED,
      submittedAt: new Date(),
      reviewedAt: new Date(),
    },
  });

  console.log("✅ Created/Updated facility verification");

  // Check if contact info exists, if not create it
  const existingContact = await prisma.contactInfo.findFirst({
    where: { facilityId: clinic.id },
  });

  if (!existingContact) {
    await prisma.contactInfo.create({
      data: {
        facilityId: clinic.id,
        name: "Dr. Siti Nurhaliza",
        position: "Clinic Manager",
        contact: "+60321234568",
      },
    });
    console.log("✅ Created contact info");
  } else {
    console.log("✅ Contact info already exists");
  }

  // Create 5 different jobs
  const jobs = [
    {
      title: "General Practitioner - Morning Shift",
      description: "We are seeking an experienced General Practitioner for morning shift coverage. The ideal candidate will handle routine consultations, minor procedures, and provide comprehensive primary care services. This is a great opportunity for doctors looking for flexible locum work in a well-established clinic.",
      location: "Kuala Lumpur, Malaysia",
      payRate: "150",
      payBasis: PayBasis.HOURLY,
      startTime: "08:00",
      endTime: "14:00",
      startDate: new Date("2024-12-01"),
      endDate: new Date("2024-12-31"),
      jobType: JobType.LOCUM,
      urgency: JobUrgency.HIGH,
      status: JobStatus.OPEN,
      requiredSpecialists: ["General Practice", "Family Medicine"],
    },
    {
      title: "Pediatrician - Weekend Coverage",
      description: "Looking for a qualified Pediatrician to provide weekend coverage at our busy family clinic. Responsibilities include examining children, diagnosing common pediatric conditions, administering vaccinations, and providing health education to parents. Experience with newborns to adolescents required.",
      location: "Kuala Lumpur, Malaysia",
      payRate: "2500",
      payBasis: PayBasis.DAILY,
      startTime: "09:00",
      endTime: "17:00",
      startDate: new Date("2024-12-07"),
      endDate: new Date("2024-12-08"),
      jobType: JobType.PART_TIME,
      urgency: JobUrgency.MEDIUM,
      status: JobStatus.OPEN,
      requiredSpecialists: ["Pediatrics", "Child Health"],
    },
    {
      title: "Emergency Medicine Physician - Night Shift",
      description: "Urgent requirement for an Emergency Medicine Physician to cover night shifts. Must be able to handle acute medical emergencies, trauma cases, and provide critical care. ACLS and ATLS certification required. This position offers competitive compensation for experienced emergency medicine specialists.",
      location: "Kuala Lumpur, Malaysia",
      payRate: "200",
      payBasis: PayBasis.HOURLY,
      startTime: "20:00",
      endTime: "08:00",
      startDate: new Date("2024-11-25"),
      endDate: new Date("2024-12-25"),
      jobType: JobType.CONTRACT,
      urgency: JobUrgency.HIGH,
      status: JobStatus.OPEN,
      requiredSpecialists: ["Emergency Medicine", "Critical Care"],
    },
    {
      title: "Dermatologist - Aesthetic Procedures",
      description: "Seeking a skilled Dermatologist with experience in both medical and aesthetic dermatology. Responsibilities include treating skin conditions, performing cosmetic procedures, laser treatments, and providing skincare consultations. Modern equipment and supportive team environment provided.",
      location: "Kuala Lumpur, Malaysia",
      payRate: "18000",
      payBasis: PayBasis.MONTHLY,
      startTime: "10:00",
      endTime: "18:00",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-03-31"),
      jobType: JobType.FULL_TIME,
      urgency: JobUrgency.LOW,
      status: JobStatus.OPEN,
      requiredSpecialists: ["Dermatology", "Aesthetic Medicine"],
    },
    {
      title: "Internal Medicine Specialist - Chronic Disease Management",
      description: "We need an Internal Medicine Specialist to manage patients with chronic conditions such as diabetes, hypertension, and cardiovascular diseases. The role involves conducting thorough assessments, developing treatment plans, and coordinating with other healthcare professionals. Perfect for doctors passionate about long-term patient care.",
      location: "Kuala Lumpur, Malaysia",
      payRate: "8000",
      payBasis: PayBasis.WEEKLY,
      startTime: "09:00",
      endTime: "17:00",
      startDate: new Date("2024-12-15"),
      endDate: new Date("2025-02-15"),
      jobType: JobType.CONTRACT,
      urgency: JobUrgency.MEDIUM,
      status: JobStatus.OPEN,
      requiredSpecialists: ["Internal Medicine", "Endocrinology", "Cardiology"],
    },
  ];

  // Delete existing jobs for this facility to ensure clean state
  await prisma.job.deleteMany({
    where: { facilityId: clinic.id },
  });

  console.log("🗑️  Cleared existing jobs");

  for (const jobData of jobs) {
    const job = await prisma.job.create({
      data: {
        ...jobData,
        facilityId: clinic.id,
        userFacilityProfileId: facilityProfile.id,
      },
    });
    console.log(`✅ Created job: ${job.title}`);
  }

  console.log("\n🎉 Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - 1 Clinic Owner created`);
  console.log(`   - 1 Clinic/Facility created (${clinic.name})`);
  console.log(`   - 1 Facility Profile created`);
  console.log(`   - 1 Facility Verification created`);
  console.log(`   - 1 Contact Info created`);
  console.log(`   - 5 Jobs created`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
