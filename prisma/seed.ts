import { prisma } from "@/lib/prisma";
import {
	UserRole,
	JobType,
	JobUrgency,
	JobStatus,
	PayBasis,
	VerificationStatus,
} from "../prisma/generated/prisma/client";

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
			name: "DEFAULT_Klinik Kesihatan Utama",
		},
	});

	if (!clinic) {
		clinic = await prisma.facility.create({
			data: {
				name: "DEFAULT_Klinik Kesihatan Utama",
				address: "123 Jalan Sehat, Taman Medik, 50000 Kuala Lumpur, Malaysia",
				contactEmail: "info@klinikutama.com",
				contactPhone: "+60321234567",
				description:
					"A premier healthcare facility providing comprehensive medical services with state-of-the-art equipment and experienced medical professionals.",
				profileImage:
					"https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
				ownerId: clinicOwner.id,
			},
		});
		console.log("✅ Created clinic:", clinic.name);
	} else {
		console.log("✅ Clinic already exists:", clinic.name);
	}

	// Create or get UserFacilityProfile for the owner
	const staffProfile = await prisma.staffProfile.upsert({
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
			businessDocumentUrl:
				"https://example.com/documents/business-registration.pdf",
			licenseNumber: "MOH-KL-2024-5678",
			licenseDocumentUrl: "https://example.com/documents/medical-license.pdf",
			verificationStatus: VerificationStatus.APPROVED,
			submittedAt: new Date(),
			reviewedAt: new Date(),
		},
		create: {
			facilityId: clinic.id,
			businessRegistrationNo: "ROC-2024-KL-001234",
			businessDocumentUrl:
				"https://example.com/documents/business-registration.pdf",
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
			description:
				"We are seeking an experienced General Practitioner for morning shift coverage. The ideal candidate will handle routine consultations, minor procedures, and provide comprehensive primary care services. This is a great opportunity for doctors looking for flexible locum work in a well-established clinic.",
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
			description:
				"Looking for a qualified Pediatrician to provide weekend coverage at our busy family clinic. Responsibilities include examining children, diagnosing common pediatric conditions, administering vaccinations, and providing health education to parents. Experience with newborns to adolescents required.",
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
			description:
				"Urgent requirement for an Emergency Medicine Physician to cover night shifts. Must be able to handle acute medical emergencies, trauma cases, and provide critical care. ACLS and ATLS certification required. This position offers competitive compensation for experienced emergency medicine specialists.",
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
			description:
				"Seeking a skilled Dermatologist with experience in both medical and aesthetic dermatology. Responsibilities include treating skin conditions, performing cosmetic procedures, laser treatments, and providing skincare consultations. Modern equipment and supportive team environment provided.",
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
			description:
				"We need an Internal Medicine Specialist to manage patients with chronic conditions such as diabetes, hypertension, and cardiovascular diseases. The role involves conducting thorough assessments, developing treatment plans, and coordinating with other healthcare professionals. Perfect for doctors passionate about long-term patient care.",
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
				staffId: staffProfile.id,
			},
		});
		console.log(`✅ Created job: ${job.title}`);
	}

	// Create doctor users with profiles and verifications
	const doctors = [
		{
			user: {
				id: "default_doctor_001",
				name: "Dr. Sarah Lee",
				email: "sarah.lee@maulocum.com",
				emailVerified: true,
				roles: [UserRole.DOCTOR],
				phoneNumber: "+60123456001",
				phoneNumberVerified: true,
				location: "Kuala Lumpur, Malaysia",
			},
			verification: {
				fullName: "Dr. Sarah Lee Mei Ling",
				phoneNumber: "+60123456001",
				location: "Kuala Lumpur, Malaysia",
				specialty: "General Practice",
				yearsOfExperience: 8,
				provisionalId: "PROV-2016-001234",
				fullId: "FULL-2018-001234",
				apcNumber: "APC-2024-001234",
				apcDocumentUrl: "https://example.com/documents/apc-sarah-lee.pdf",
				verificationStatus: VerificationStatus.APPROVED,
				submittedAt: new Date("2024-01-15"),
				reviewedAt: new Date("2024-01-20"),
			},
		},
		{
			user: {
				id: "default_doctor_002",
				name: "Dr. Ahmad Razak",
				email: "ahmad.razak@maulocum.com",
				emailVerified: true,
				roles: [UserRole.DOCTOR],
				phoneNumber: "+60123456002",
				phoneNumberVerified: true,
				location: "Petaling Jaya, Malaysia",
			},
			verification: {
				fullName: "Dr. Ahmad Razak bin Abdullah",
				phoneNumber: "+60123456002",
				location: "Petaling Jaya, Malaysia",
				specialty: "Pediatrics",
				yearsOfExperience: 12,
				provisionalId: "PROV-2012-005678",
				fullId: "FULL-2014-005678",
				apcNumber: "APC-2024-005678",
				apcDocumentUrl: "https://example.com/documents/apc-ahmad-razak.pdf",
				verificationStatus: VerificationStatus.APPROVED,
				submittedAt: new Date("2024-02-10"),
				reviewedAt: new Date("2024-02-15"),
			},
		},
		{
			user: {
				id: "default_doctor_003",
				name: "Dr. Priya Sharma",
				email: "priya.sharma@maulocum.com",
				emailVerified: true,
				roles: [UserRole.DOCTOR],
				phoneNumber: "+60123456003",
				phoneNumberVerified: true,
				location: "Subang Jaya, Malaysia",
			},
			verification: {
				fullName: "Dr. Priya Sharma",
				phoneNumber: "+60123456003",
				location: "Subang Jaya, Malaysia",
				specialty: "Emergency Medicine",
				yearsOfExperience: 6,
				provisionalId: "PROV-2018-009876",
				fullId: "FULL-2020-009876",
				apcNumber: "APC-2024-009876",
				apcDocumentUrl: "https://example.com/documents/apc-priya-sharma.pdf",
				verificationStatus: VerificationStatus.PENDING,
				submittedAt: new Date("2024-11-01"),
				reviewedAt: null,
			},
		},
		{
			user: {
				id: "default_doctor_004",
				name: "Dr. Tan Wei Ming",
				email: "tan.weiming@maulocum.com",
				emailVerified: true,
				roles: [UserRole.DOCTOR],
				phoneNumber: "+60123456004",
				phoneNumberVerified: true,
				location: "Shah Alam, Malaysia",
			},
			verification: {
				fullName: "Dr. Tan Wei Ming",
				phoneNumber: "+60123456004",
				location: "Shah Alam, Malaysia",
				specialty: "Dermatology",
				yearsOfExperience: 10,
				provisionalId: "PROV-2014-002468",
				fullId: "FULL-2016-002468",
				apcNumber: "APC-2024-002468",
				apcDocumentUrl: "https://example.com/documents/apc-tan-weiming.pdf",
				verificationStatus: VerificationStatus.REJECTED,
				rejectionReason: "APC document expired. Please upload a valid APC.",
				allowAppeal: true,
				submittedAt: new Date("2024-10-15"),
				reviewedAt: new Date("2024-10-20"),
			},
		},
		{
			user: {
				id: "default_doctor_005",
				name: "Dr. Nurul Aisyah",
				email: "nurul.aisyah@maulocum.com",
				emailVerified: true,
				roles: [UserRole.DOCTOR],
				phoneNumber: "+60123456005",
				phoneNumberVerified: true,
				location: "Ampang, Malaysia",
			},
			verification: {
				fullName: "Dr. Nurul Aisyah binti Hassan",
				phoneNumber: "+60123456005",
				location: "Ampang, Malaysia",
				specialty: "Internal Medicine",
				yearsOfExperience: 15,
				provisionalId: "PROV-2009-001357",
				fullId: "FULL-2011-001357",
				apcNumber: "APC-2024-001357",
				apcDocumentUrl: "https://example.com/documents/apc-nurul-aisyah.pdf",
				verificationStatus: VerificationStatus.APPROVED,
				submittedAt: new Date("2024-01-05"),
				reviewedAt: new Date("2024-01-10"),
			},
		},
	];

	let doctorCount = 0;
	let verificationCount = 0;

	for (const doctorData of doctors) {
		// Create or update doctor user
		const doctor = await prisma.user.upsert({
			where: { email: doctorData.user.email },
			update: {},
			create: doctorData.user,
		});
		doctorCount++;

		// Create doctor profile
		const doctorProfile = await prisma.doctorProfile.upsert({
			where: { userId: doctor.id },
			update: {},
			create: {
				userId: doctor.id,
			},
		});

		// Create doctor verification
		await prisma.doctorVerification.upsert({
			where: { doctorProfileId: doctorProfile.id },
			update: {
				...doctorData.verification,
			},
			create: {
				doctorProfileId: doctorProfile.id,
				...doctorData.verification,
			},
		});
		verificationCount++;

		console.log(
			`✅ Created doctor: ${doctor.name} (${doctorData.verification.verificationStatus})`,
		);
	}

	console.log("\n🎉 Database seeding completed successfully!");
	console.log("\n📊 Summary:");
	console.log(`   - 1 Clinic Owner created`);
	console.log(`   - 1 Clinic/Facility created (${clinic.name})`);
	console.log(`   - 1 Facility Profile created`);
	console.log(`   - 1 Facility Verification created`);
	console.log(`   - 1 Contact Info created`);
	console.log(`   - 5 Jobs created`);
	console.log(`   - ${doctorCount} Doctors created`);
	console.log(`   - ${verificationCount} Doctor Verifications created`);
	console.log(
		`     • ${doctors.filter((d) => d.verification.verificationStatus === VerificationStatus.APPROVED).length} Approved`,
	);
	console.log(
		`     • ${doctors.filter((d) => d.verification.verificationStatus === VerificationStatus.PENDING).length} Pending`,
	);
	console.log(
		`     • ${doctors.filter((d) => d.verification.verificationStatus === VerificationStatus.REJECTED).length} Rejected`,
	);
}

main()
	.catch((e) => {
		console.error("❌ Error during seeding:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
