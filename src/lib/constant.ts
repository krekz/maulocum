// Location and specialty options
const STATE_OPTIONS = [
	{ value: "all", label: "All States" },
	{ value: "johor", label: "Johor" },
	{ value: "kedah", label: "Kedah" },
	{ value: "kelantan", label: "Kelantan" },
	{ value: "melaka", label: "Melaka" },
	{ value: "negeri sembilan", label: "Negeri Sembilan" },
	{ value: "pahang", label: "Pahang" },
	{ value: "perak", label: "Perak" },
	{ value: "perlis", label: "Perlis" },
	{ value: "penang", label: "Pulau Pinang" },
	{ value: "sabah", label: "Sabah" },
	{ value: "sarawak", label: "Sarawak" },
	{ value: "selangor", label: "Selangor" },
	{ value: "terengganu", label: "Terengganu" },
	{ value: "kuala lumpur", label: "Kuala Lumpur" },
];

const SPECIALIST_OPTIONS = [
	{ value: "all", label: "All Specialists" },
	{ value: "ortho", label: "Orthopaedics" },
	{ value: "ed", label: "Emergency Medicine" },
	{ value: "anaesthetic", label: "Anaesthetics" },
	{ value: "cardio", label: "Cardiology" },
	{ value: "gensurg", label: "General Surgery" },
	{ value: "paeds", label: "Paediatrics" },
	{ value: "psych", label: "Psychiatry" },
	{ value: "radio", label: "Radiology" },
];

// Job listing interfaces
export interface JobListing {
	id: string;
	clinicName: string;
	location: string;
	description: string;
	requirements: string;
	specialist: string;
	payRate: string;
	duration: string;
	date: string;
}

export interface JobDetail {
	id: string;
	clinicName: string;
	description: string;
	responsibilities: string[];
	facilities: string;
	payment: string;
	contacts: {
		name: string;
		role: string;
		phone: string;
	}[];
	rating: number;
	reviewCount: number;
	address: string;
	gmapLink: string;
	dateNeeded: string;
	urgency: string;
	createdAt: string;
	workingHours: string;
}

// Sample job listings data (simplified version for listings)
export const jobListingsData: JobListing[] = [
	{
		id: "job1",
		clinicName: "HealthFirst Family Clinic",
		location: "Petaling Jaya, Selangor",
		description:
			"Weekend coverage needed for busy family clinic in Petaling Jaya with moderate patient flow.",
		requirements:
			"General practice experience required. APC certificate must be presented.",
		specialist: "General Practitioner",
		payRate: "RM40/hour",
		duration: "9:00 AM - 6:00 PM",
		date: "May 20, 2025",
	},
	{
		id: "job2",
		clinicName: "Medilife Center",
		location: "Subang Jaya, Selangor",
		description:
			"Seeking locum doctor for weekday evening shifts at our busy primary care clinic in Subang Jaya.",
		requirements:
			"Family medicine experience preferred. Electronic medical records knowledge.",
		specialist: "General Practitioner",
		payRate: "RM45/hour",
		duration: "6:00 PM - 10:00 PM",
		date: "May 11, 2025",
	},
	{
		id: "job3",
		clinicName: "Wellness Hub Medical Center",
		location: "Bangsar, Kuala Lumpur",
		description:
			"Looking for weekend locum coverage at our multi-specialty clinic in Bangsar.",
		requirements:
			"Ability to handle diverse patient cases. Basic procedure skills required.",
		specialist: "General Practitioner",
		payRate: "RM50/hour",
		duration: "10:00 AM - 7:00 PM",
		date: "Feb 31, 2025",
	},
	{
		id: "job4",
		clinicName: "CarePlus Medical",
		location: "Ampang, Selangor",
		description:
			"Urgent need for weekday morning locum (8am-2pm) at our established clinic in Ampang.",
		requirements:
			"Experience with geriatric patients preferred. Pre-employment exam skills.",
		specialist: "General Practitioner",
		payRate: "RM42/hour",
		duration: "8:00 AM - 2:00 PM",
		date: "May 18, 2025",
	},
	{
		id: "job5",
		clinicName: "FamilyCare Medical Center",
		location: "Shah Alam, Selangor",
		description:
			"Weekend locum position available at our family-oriented clinic in Shah Alam.",
		requirements:
			"Minor surgical procedure skills. Vaccination experience required.",
		specialist: "General Practitioner",
		payRate: "RM48/hour",
		duration: "9:00 AM - 5:00 PM",
		date: "June 12, 2025",
	},
];

// Detailed job information (for job details page)
export const jobDetailsArray: JobDetail[] = [
	{
		id: "job1",
		clinicName: "HealthFirst Family Clinic",
		description:
			"Weekend coverage needed for busy family clinic in Petaling Jaya with moderate patient flow. We offer a supportive environment with experienced nursing staff and modern facilities. The ideal candidate should be comfortable handling a variety of general practice cases including minor emergencies.",
		responsibilities: [
			"General outpatient consultations and treatments",
			"Basic wound care and minor procedures",
			"Prescription management and follow-up care",
			"Medical documentation in clinic EMR system",
		],
		facilities:
			"Full nursing support team available. Modern clinic with digital X-ray, basic lab services, and computerized medical records.",
		payment:
			"RM40/hour with additional RM100 transportation allowance. Payment processed within 7 days via bank transfer.",
		contacts: [
			{
				name: "Dr. Sarah Tan",
				role: "Clinic Director",
				phone: "+60 12-345-6789",
			},
			{
				name: "Ms. Lily Wong",
				role: "Clinic Manager",
				phone: "+60 13-987-6543",
			},
		],
		rating: 4.2,
		reviewCount: 28,
		address:
			"45, Jalan PJU 5/11, Dataran Sunway, 47810 Petaling Jaya, Selangor",
		gmapLink:
			"https://maps.google.com/?q=45,+Jalan+PJU+5/11,+Dataran+Sunway,+47810+Petaling+Jaya,+Selangor",
		dateNeeded: "20 May 2025",
		urgency: "Medium",
		createdAt: "5 days ago",
		workingHours: "9:00 AM - 6:00",
	},
	{
		id: "job2",
		clinicName: "Medilife Center",
		description:
			"Seeking locum doctor for weekday evening shifts at our busy primary care clinic in Subang Jaya. Our clinic specializes in family medicine with a focus on chronic disease management and preventive care.",
		responsibilities: [
			"Manage acute and chronic conditions",
			"Perform basic health screenings",
			"Provide health education to patients",
			"Coordinate with specialists for referrals",
		],
		facilities:
			"Well-equipped clinic with in-house pharmacy, ECG, and basic laboratory services. Electronic medical records system for efficient documentation.",
		payment:
			"RM45/hour with performance bonus based on patient volume. Payments made biweekly.",
		contacts: [
			{
				name: "Dr. Ahmad Razak",
				role: "Medical Director",
				phone: "+60 19-876-5432",
			},
			{
				name: "Mr. Jason Lee",
				role: "Administrative Officer",
				phone: "+60 16-543-2109",
			},
		],
		rating: 4.5,
		reviewCount: 42,
		address:
			"Block D-12-3, Subang Square, Jalan SS15/4, 47500 Subang Jaya, Selangor",
		gmapLink:
			"https://maps.google.com/?q=Block+D-12-3,+Subang+Square,+Jalan+SS15/4,+47500+Subang+Jaya,+Selangor",
		dateNeeded: "11 May 2025",
		urgency: "High",
		createdAt: "2 days ago",
		workingHours: "6:00 PM - 10:00 PM",
	},
	{
		id: "job3",
		clinicName: "Wellness Hub Medical Center",
		description:
			"Looking for weekend locum coverage at our multi-specialty clinic in Bangsar. We serve a diverse patient population and offer comprehensive primary care services alongside specialty consultations.",
		responsibilities: [
			"Handle walk-in consultations and appointments",
			"Provide acute care for common illnesses",
			"Perform basic procedures including suturing",
			"Manage patient follow-ups and referrals",
		],
		facilities:
			"Modern facility with digital imaging, comprehensive lab services, and procedure rooms. Full administrative and nursing support provided.",
		payment:
			"RM50/hour plus meal allowance. Monthly payment via bank transfer.",
		contacts: [
			{
				name: "Dr. Michelle Lim",
				role: "Lead Physician",
				phone: "+60 17-234-5678",
			},
			{
				name: "Ms. Priya Nair",
				role: "Operations Manager",
				phone: "+60 12-876-5432",
			},
		],
		rating: 4.7,
		reviewCount: 35,
		address: "17, Jalan Telawi 3, Bangsar Baru, 59100 Kuala Lumpur",
		gmapLink:
			"https://maps.google.com/?q=17,+Jalan+Telawi+3,+Bangsar+Baru,+59100+Kuala+Lumpur",
		dateNeeded: "31 February 2025",
		urgency: "Medium",
		createdAt: "1 week ago",
		workingHours: "10:00 AM - 7:00 PM",
	},
	{
		id: "job4",
		clinicName: "CarePlus Medical",
		description:
			"Urgent need for weekday morning locum (8am-2pm) at our established clinic in Ampang. We focus on providing quality care to local residents with emphasis on geriatric and chronic disease management.",
		responsibilities: [
			"Provide primary care services to all age groups",
			"Manage chronic disease patients",
			"Conduct pre-employment medical examinations",
			"Supervise nursing staff for basic procedures",
		],
		facilities:
			"Clinic equipped with basic diagnostic tools, vaccination facilities, and computerized record system. Pharmacy services available on-site.",
		payment:
			"RM42/hour with transportation reimbursement. Payment processed every two weeks.",
		contacts: [
			{ name: "Dr. Kumar Rajan", role: "Owner", phone: "+60 11-2345-6789" },
			{
				name: "Ms. Farah Lim",
				role: "Front Office Manager",
				phone: "+60 14-765-4321",
			},
		],
		rating: 3.9,
		reviewCount: 18,
		address:
			"123, Jalan Ampang Utama 2/2, Taman Ampang Utama, 68000 Ampang, Selangor",
		gmapLink:
			"https://maps.google.com/?q=123,+Jalan+Ampang+Utama+2/2,+Taman+Ampang+Utama,+68000+Ampang,+Selangor",
		dateNeeded: "18 May 2025",
		urgency: "Critical",
		createdAt: "12 hours ago",
		workingHours: "8:00 AM - 2:00 PM",
	},
	{
		id: "job5",
		clinicName: "FamilyCare Medical Center",
		description:
			"Weekend locum position available at our family-oriented clinic in Shah Alam. We provide comprehensive care to patients of all ages with a focus on preventive medicine and health education.",
		responsibilities: [
			"Conduct regular patient consultations",
			"Perform minor surgical procedures",
			"Provide vaccination services",
			"Counsel patients on lifestyle modifications",
		],
		facilities:
			"Spacious clinic with separate consultation rooms, treatment area, and waiting lounge. Complete with ultrasound, ECG, and spirometry equipment.",
		payment:
			"RM48/hour with meal and transport allowance. Payment within 3 days of service.",
		contacts: [
			{
				name: "Dr. Hafiz Abdullah",
				role: "Clinic Owner",
				phone: "+60 18-765-4321",
			},
		],
		rating: 4.3,
		reviewCount: 26,
		address: "45, Jalan Plumbum S7/S, Seksyen 7, 40000 Shah Alam, Selangor",
		gmapLink:
			"https://maps.google.com/?q=45,+Jalan+Plumbum+S7/S,+Seksyen+7,+40000+Shah+Alam,+Selangor",
		dateNeeded: "26-27 May 2025",
		urgency: "Medium",
		createdAt: "3 days ago",
		workingHours: "9:00 AM - 5:00 PM",
	},
];

// Mock data for doctors
const DOCTORS = [
	{
		id: 1,
		name: "Dr. Sarah Johnson",
		specialty: "General Practice",
		rating: 4.8,
		location: "Kuala Lumpur",
		availability: "Weekdays",
		image: "/avatars/doctor-1.jpg",
	},
	{
		id: 2,
		name: "Dr. Michael Chen",
		specialty: "Pediatrics",
		rating: 4.5,
		location: "Penang",
		availability: "Weekends",
		image: "/avatars/doctor-2.jpg",
	},
	{
		id: 3,
		name: "Dr. Emily Rodriguez",
		specialty: "Emergency Medicine",
		rating: 4.9,
		location: "Johor Bahru",
		availability: "Full-time",
		image: "/avatars/doctor-3.jpg",
	},
	{
		id: 4,
		name: "Dr. James Wilson",
		specialty: "Cardiology",
		rating: 4.2,
		location: "Kuala Lumpur",
		availability: "Part-time",
		image: "/avatars/doctor-4.jpg",
	},
];

export { STATE_OPTIONS, SPECIALIST_OPTIONS, DOCTORS };
