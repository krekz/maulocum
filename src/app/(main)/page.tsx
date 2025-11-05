"use client";
import { BellIcon, CalendarIcon, FileTextIcon, GlobeIcon } from "lucide-react";
import Image from "next/image";
import { BentoCard, BentoGrid } from "@/components/bento-grid";
import Hero from "@/components/hero";
import { AnimatedTestimonials } from "@/components/testimonials";

const features = [
	{
		Icon: GlobeIcon,
		name: "Browse Locum Jobs Across Malaysia",
		description:
			"Access locum positions in all Malaysian states and territories with our comprehensive nationwide job board.",
		href: "/",
		cta: "Find jobs",
		background: (
			<Image
				width={2069}
				height={2069}
				src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
				alt="malaysia-map"
				className="h-full w-full object-cover opacity-60"
			/>
		),
		className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
	},
	{
		Icon: FileTextIcon,
		name: "Fast Profile Verification",
		description:
			"Simple verification process requiring only your APC and IC for quick onboarding and job applications.",
		href: "/",
		cta: "Learn more",
		background: (
			<Image
				width={500}
				height={500}
				src="https://plus.unsplash.com/premium_photo-1669323926579-4b60e62282e6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHZlcmlmaWNhdGlvbnxlbnwwfHwwfHx8MA%3D%3D"
				alt="verification"
				className="h-full w-full object-cover opacity-60"
			/>
		),
		className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
	},
	{
		Icon: CalendarIcon,
		name: "Flexible Scheduling",
		description:
			"Easily manage your availability and pick up shifts that fit your lifestyle and preferences.",
		href: "/",
		cta: "Try it out",
		background: (
			<Image
				width={500}
				height={500}
				src="https://images.unsplash.com/photo-1642359085898-d9fde39507c9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2NoZWR1bGV8ZW58MHx8MHx8fDA%3D"
				alt="scheduling"
				className="h-full w-full object-cover opacity-60"
			/>
		),
		className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
	},
	{
		Icon: BellIcon,
		name: "Smart Notifications",
		description:
			"Receive instant alerts for new positions matching your preferences and application updates.",
		href: "/",
		cta: "Learn more",
		background: (
			<Image
				width={500}
				height={500}
				src="https://images.unsplash.com/photo-1643845892686-30c241c3938c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bm90aWZpY2F0aW9uc3xlbnwwfHwwfHx8MA%3D%3D"
				alt="notifications"
				className="h-full w-full object-cover opacity-60"
			/>
		),
		className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
	},
	{
		Icon: FileTextIcon,
		name: "Anonymous Rating System",
		description:
			"Transparent two-way feedback system for both locum applicants and healthcare providers.",
		href: "/",
		cta: "See how it works",
		background: (
			<Image
				width={500}
				height={500}
				src="https://plus.unsplash.com/premium_photo-1682309504951-43bae484e04d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cmF0aW5nfGVufDB8fDB8fHww"
				alt="ratings"
				className="h-full w-full object-cover opacity-60"
			/>
		),
		className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
	},
];

export default function Home() {
	return (
		<section className="lg:container">
			<Hero />
			<BentoGrid className="lg:grid-rows-3">
				{features.map((feature) => (
					<BentoCard key={feature.name} {...feature} />
				))}
			</BentoGrid>
			<AnimatedTestimonials
				testimonials={[
					{
						id: 1,
						name: "Dr. Lim Mei Ling",
						role: "Kardiologi",
						company: "Hospital Kuala Lumpur",
						content:
							"Platform locum ini telah mengubah cara saya mencari jawatan sementara. Sistem penjadualan sangat intuitif, dan saya boleh mengurus ketersediaan dengan mudah. Ia benar-benar mengubah keseimbangan kerja-hidup saya!",
						rating: 5,
						avatar: "https://randomuser.me/api/portraits/women/28.jpg",
					},
					{
						id: 2,
						name: "Dr. Ahmad Razak",
						role: "Emergency Medicine",
						company: "Sunway Medical Centre",
						content:
							"After trying several locum services, this platform stands out for its reliability and transparency. The payment system is efficient and the staff are always helpful when I have questions.",
						rating: 5,
						avatar: "https://randomuser.me/api/portraits/men/42.jpg",
					},
					{
						id: 3,
						name: "Dr. Nurul Huda",
						role: "Perubatan Keluarga",
						company: "Klinik Kesihatan Putrajaya",
						content:
							"Saya dapat meluaskan pengalaman klinikal dan memperoleh pendedahan yang berharga di pelbagai pusat kesihatan berkat platform ini. Staf yang responsif dan algoritma pemadanan yang sangat tepat!",
						rating: 5,
						avatar: "https://randomuser.me/api/portraits/women/36.jpg",
					},
				]}
				trustedCompanies={[
					"Hospital Universiti Malaya",
					"KPJ Healthcare",
					"Pantai Hospitals",
					"Gleneagles Hospitals",
					"Thomson Medical",
				]}
			/>
		</section>
	);
}
