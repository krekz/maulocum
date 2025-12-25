"use client";

import {
	ArrowRight,
	BadgeCheck,
	Calendar,
	ChevronRight,
	Clock,
	MapPin,
	Search,
	ShieldCheck,
	Star,
	Stethoscope,
	TrendingUp,
	Users,
	Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const stats = [
	{ value: "5,000+", label: "Active Doctors" },
	{ value: "500+", label: "Partner Facilities" },
	{ value: "50,000+", label: "Shifts Completed" },
	{ value: "4.9/5", label: "Average Rating" },
];

const features = [
	{
		title: "Instant Job Matching",
		description:
			"Our smart algorithm matches you with shifts that fit your schedule, specialty, and location preferences.",
		icon: Search,
		color: "text-blue-600",
		bg: "bg-blue-50",
	},
	{
		title: "Verified Credentials",
		description:
			"One-time APC & MMC verification. Apply to unlimited jobs without repetitive paperwork.",
		icon: ShieldCheck,
		color: "text-emerald-600",
		bg: "bg-emerald-50",
	},
	{
		title: "Flexible Scheduling",
		description:
			"Pick shifts that work for you. Day, night, weekends—you're in complete control of your time.",
		icon: Calendar,
		color: "text-purple-600",
		bg: "bg-purple-50",
	},
	{
		title: "Fast Payments",
		description:
			"Get paid within 7 days of completing your shift. No chasing invoices, no delays.",
		icon: Wallet,
		color: "text-amber-600",
		bg: "bg-amber-50",
	},
	{
		title: "Nationwide Coverage",
		description:
			"Access opportunities across all Malaysian states—from KL to Sabah and everywhere in between.",
		icon: MapPin,
		color: "text-rose-600",
		bg: "bg-rose-50",
	},
	{
		title: "Career Growth",
		description:
			"Build your reputation with ratings and reviews. Top-rated doctors get priority access to premium shifts.",
		icon: TrendingUp,
		color: "text-cyan-600",
		bg: "bg-cyan-50",
	},
];

const testimonials = [
	{
		name: "Dr. Lim Mei Ling",
		role: "Cardiologist",
		location: "Kuala Lumpur",
		content:
			"MauLocum transformed how I manage my career. I can pick up extra shifts at top hospitals while maintaining my work-life balance. The verification was seamless!",
		avatar: "https://randomuser.me/api/portraits/women/28.jpg",
		rating: 5,
	},
	{
		name: "Dr. Ahmad Razak",
		role: "Emergency Medicine",
		location: "Penang",
		content:
			"Finally, a platform that respects doctors' time. No more endless phone calls with agencies. I browse, apply, and get confirmed—all in minutes.",
		avatar: "https://randomuser.me/api/portraits/men/42.jpg",
		rating: 5,
	},
	{
		name: "Dr. Nurul Huda",
		role: "Family Medicine",
		location: "Johor Bahru",
		content:
			"I've expanded my clinical experience across multiple healthcare settings. The payment is always on time, and the support team is incredibly responsive.",
		avatar: "https://randomuser.me/api/portraits/women/36.jpg",
		rating: 5,
	},
];

const faqs = [
	{
		question: "How do I get started as a locum doctor?",
		answer:
			"Simply create an account, upload your APC certificate and IC for verification, and you can start browsing and applying to jobs immediately. Most verifications are completed within 24 hours.",
	},
	{
		question: "Is there a fee to use MauLocum?",
		answer:
			"MauLocum is completely free for doctors. We charge a small service fee to healthcare facilities, not to you. You keep 100% of your earnings.",
	},
	{
		question: "How quickly will I get paid?",
		answer:
			"Payments are processed within 7 working days after shift completion. We handle all the invoicing and payment collection so you can focus on patient care.",
	},
	{
		question: "Can I choose my own shifts?",
		answer:
			"Absolutely! You have full control over which shifts you apply to. Filter by location, date, specialty, and pay rate to find opportunities that match your preferences.",
	},
	{
		question: "What types of facilities are on the platform?",
		answer:
			"We partner with private hospitals, government clinics, specialist centres, and GP practices across Malaysia. From major hospital groups to independent clinics.",
	},
];

const trustedBy = [
	"KPJ Healthcare",
	"Pantai Hospitals",
	"Sunway Medical",
	"Gleneagles",
	"Columbia Asia",
];

export default function Home() {
	const fadeInUp = {
		initial: { opacity: 0, y: 24 },
		whileInView: { opacity: 1, y: 0 },
		viewport: { once: true },
		transition: { duration: 0.5 },
	};

	return (
		<div className="flex flex-col min-h-screen bg-white">
			{/* Hero Section */}
			<section className="relative pt-10 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
				{/* Background gradient */}
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-100/60 via-white to-white" />
				<div className="absolute top-0 right-0 -z-10 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-emerald-100/40 to-transparent blur-3xl" />

				<div className="container mx-auto px-4">
					<div className="max-w-5xl mx-auto">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-center"
						>
							<Badge className="mb-6 px-4 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full border-0">
								<Stethoscope className="w-3.5 h-3.5 mr-1.5" />
								Malaysia's #1 Locum Platform
							</Badge>

							<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6">
								Malaysian healthcare gigs
								<br />
								<span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-cyan-500 to-emerald-500">
									made simple
								</span>
							</h1>

							<p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
								Join thousands of doctors finding flexible locum opportunities
								at Malaysia's top healthcare facilities. Verified once, apply
								anywhere.
							</p>

							<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
								<Link href="/register">
									<Button
										size="lg"
										className="h-14 px-8 text-lg rounded-full shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all"
									>
										Start Finding Shifts
										<ArrowRight className="ml-2 h-5 w-5" />
									</Button>
								</Link>
								<Link href="/jobs">
									<Button
										variant="outline"
										size="lg"
										className="h-14 px-8 text-lg rounded-full"
									>
										Browse Jobs
									</Button>
								</Link>
							</div>

							{/* Trust indicators */}
							<div className="flex flex-col items-center gap-4">
								<p className="text-sm text-slate-500 font-medium">
									Trusted by doctors at
								</p>
								<div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
									{trustedBy.map((company) => (
										<span
											key={company}
											className="text-slate-400 font-semibold text-sm"
										>
											{company}
										</span>
									))}
								</div>
							</div>
						</motion.div>

						{/* Product Preview - Dashboard Mockup */}
						<motion.div
							initial={{ opacity: 0, y: 40 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.3 }}
							className="mt-16 lg:mt-20 hidden md:block"
						>
							<div className="relative mx-auto max-w-5xl">
								{/* Glow effects */}
								<div className="absolute -inset-4 bg-linear-to-r from-blue-500/20 via-cyan-500/20 to-emerald-500/20 rounded-3xl blur-2xl opacity-60" />

								{/* Browser frame */}
								<div className="relative bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-800">
									{/* Browser header */}
									<div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-slate-700">
										<div className="flex gap-1.5">
											<div className="w-3 h-3 rounded-full bg-red-500" />
											<div className="w-3 h-3 rounded-full bg-amber-500" />
											<div className="w-3 h-3 rounded-full bg-green-500" />
										</div>
										<div className="flex-1 flex justify-center">
											<div className="flex items-center gap-2 px-4 py-1 bg-slate-700/50 rounded-lg text-xs text-slate-400">
												<div className="w-3 h-3 rounded-full bg-green-500/80" />
												maulocum.com/jobs
											</div>
										</div>
									</div>

									{/* Browse Jobs content */}
									<div className="p-3 md:p-4 bg-slate-50">
										<div className="flex gap-3">
											{/* Left - Jobs List */}
											<div className="w-[280px] shrink-0 space-y-2">
												{/* Search bar */}
												<div className="bg-white rounded-lg px-3 py-2 border border-slate-200 flex items-center gap-2">
													<Search className="w-3.5 h-3.5 text-slate-400" />
													<span className="text-xs text-slate-400">
														Search jobs...
													</span>
												</div>

												{/* Job cards */}
												<div className="space-y-2 max-h-[320px] overflow-hidden">
													{/* Job 1 - Selected */}
													<div className="bg-white rounded-lg p-3 border-2 border-blue-500 shadow-sm cursor-pointer">
														<div className="flex items-start justify-between mb-2">
															<h4 className="font-semibold text-slate-900 text-xs leading-tight">
																Pantai Hospital KL
															</h4>
															<span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded">
																New
															</span>
														</div>
														<div className="text-sm font-bold text-blue-600 mb-1.5">
															RM 800
															<span className="text-[10px] font-normal text-slate-400">
																/day
															</span>
														</div>
														<div className="flex items-center gap-1 text-[10px] text-slate-500">
															<Calendar className="w-3 h-3" />
															<span>Dec 15 - Dec 17</span>
														</div>
													</div>

													{/* Job 2 */}
													<div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm cursor-pointer hover:border-slate-200 transition-colors">
														<div className="flex items-start justify-between mb-2">
															<h4 className="font-semibold text-slate-900 text-xs leading-tight">
																Sunway Medical Centre
															</h4>
															<span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded">
																Urgent
															</span>
														</div>
														<div className="text-sm font-bold text-slate-700 mb-1.5">
															RM 1,200
															<span className="text-[10px] font-normal text-slate-400">
																/day
															</span>
														</div>
														<div className="flex items-center gap-1 text-[10px] text-slate-500">
															<Calendar className="w-3 h-3" />
															<span>Dec 20 - Dec 22</span>
														</div>
													</div>

													{/* Job 3 */}
													<div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm cursor-pointer hover:border-slate-200 transition-colors">
														<div className="flex items-start justify-between mb-2">
															<h4 className="font-semibold text-slate-900 text-xs leading-tight">
																KPJ Damansara
															</h4>
														</div>
														<div className="text-sm font-bold text-slate-700 mb-1.5">
															RM 650
															<span className="text-[10px] font-normal text-slate-400">
																/day
															</span>
														</div>
														<div className="flex items-center gap-1 text-[10px] text-slate-500">
															<Calendar className="w-3 h-3" />
															<span>Dec 25 - Dec 26</span>
														</div>
													</div>

													{/* Job 4 */}
													<div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm cursor-pointer hover:border-slate-200 transition-colors opacity-60">
														<div className="flex items-start justify-between mb-2">
															<h4 className="font-semibold text-slate-900 text-xs leading-tight">
																Gleneagles Hospital
															</h4>
														</div>
														<div className="text-sm font-bold text-slate-700 mb-1.5">
															RM 900
															<span className="text-[10px] font-normal text-slate-400">
																/day
															</span>
														</div>
														<div className="flex items-center gap-1 text-[10px] text-slate-500">
															<Calendar className="w-3 h-3" />
															<span>Jan 2 - Jan 4</span>
														</div>
													</div>
												</div>
											</div>

											{/* Right - Job Details */}
											<div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
												{/* Header */}
												<div className="p-4 border-b border-slate-100">
													<div className="flex items-start justify-between mb-3">
														<div>
															<h3 className="font-bold text-slate-900 text-base mb-1">
																GP Locum - Weekend Shift
															</h3>
															<p className="text-sm text-slate-500">
																Pantai Hospital Kuala Lumpur
															</p>
														</div>
														<div className="text-right">
															<div className="text-xl font-bold text-emerald-600">
																RM 800
															</div>
															<div className="text-[10px] text-slate-400 uppercase">
																per day
															</div>
														</div>
													</div>
													<div className="flex items-center gap-3 text-xs">
														<span className="flex items-center gap-1 text-slate-500">
															<MapPin className="w-3.5 h-3.5" />
															Kuala Lumpur
														</span>
														<span className="flex items-center gap-1 text-slate-500">
															<Clock className="w-3.5 h-3.5" />
															8:00 AM - 5:00 PM
														</span>
														<span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full">
															General Practice
														</span>
													</div>
												</div>

												{/* Content */}
												<div className="p-4 space-y-4">
													{/* Date & Duration */}
													<div className="flex gap-3">
														<div className="flex-1 bg-slate-50 rounded-lg p-3">
															<div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">
																Start Date
															</div>
															<div className="text-sm font-semibold text-slate-900">
																Dec 15, 2024
															</div>
														</div>
														<div className="flex-1 bg-slate-50 rounded-lg p-3">
															<div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">
																End Date
															</div>
															<div className="text-sm font-semibold text-slate-900">
																Dec 17, 2024
															</div>
														</div>
														<div className="flex-1 bg-slate-50 rounded-lg p-3">
															<div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">
																Duration
															</div>
															<div className="text-sm font-semibold text-slate-900">
																3 Days
															</div>
														</div>
													</div>

													{/* Description */}
													<div>
														<h4 className="text-xs font-semibold text-slate-700 mb-2">
															Job Description
														</h4>
														<p className="text-xs text-slate-500 leading-relaxed">
															We are looking for an experienced GP to cover
															weekend shifts at our outpatient clinic. The role
															involves general consultations, minor procedures,
															and patient follow-ups.
														</p>
													</div>

													{/* Requirements */}
													<div>
														<h4 className="text-xs font-semibold text-slate-700 mb-2">
															Requirements
														</h4>
														<div className="flex flex-wrap gap-1.5">
															<span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] rounded-md">
																Valid APC
															</span>
															<span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] rounded-md">
																2+ Years Experience
															</span>
															<span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] rounded-md">
																BLS Certified
															</span>
														</div>
													</div>

													{/* Apply Button */}
													<button
														type="button"
														className="w-full py-2.5 bg-linear-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
													>
														Apply Now
														<ArrowRight className="w-4 h-4" />
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-12 border-y border-slate-100 bg-slate-50/50">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
						{stats.map((stat, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								className="text-center"
							>
								<div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
									{stat.value}
								</div>
								<div className="text-sm font-medium text-slate-500">
									{stat.label}
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-24 bg-white">
				<div className="container mx-auto px-4">
					<div className="text-center max-w-3xl mx-auto mb-16">
						<Badge className="mb-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0">
							Why MauLocum
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
							Built for doctors, by doctors
						</h2>
						<p className="text-lg text-slate-600">
							We understand the challenges of locum work. That's why we built a
							platform that puts you first.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{features.map((feature, index) => (
							<motion.div
								key={index}
								{...fadeInUp}
								transition={{ delay: index * 0.08 }}
							>
								<Card className="h-full border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300">
									<CardHeader>
										<div
											className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4`}
										>
											<feature.icon className="h-6 w-6" />
										</div>
										<CardTitle className="text-xl">{feature.title}</CardTitle>
									</CardHeader>
									<CardContent>
										<CardDescription className="text-base leading-relaxed">
											{feature.description}
										</CardDescription>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-24 bg-slate-50">
				<div className="container mx-auto px-4">
					<div className="text-center max-w-3xl mx-auto mb-16">
						<Badge className="mb-4 bg-purple-50 text-purple-700 hover:bg-purple-100 border-0">
							How It Works
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
							From signup to shift in 3 steps
						</h2>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						{[
							{
								step: "01",
								title: "Create Your Profile",
								description:
									"Sign up and complete your profile with your qualifications, specialties, and availability preferences.",
								icon: Users,
							},
							{
								step: "02",
								title: "Get Verified",
								description:
									"Only uplaod your APC. Our team verifies your credentials within 24 hours—just once, for all jobs.",
								icon: BadgeCheck,
							},
							{
								step: "03",
								title: "Start Working",
								description:
									"Browse available shifts, apply with one click, and get instant confirmations. It's that simple.",
								icon: Stethoscope,
							},
						].map((item, index) => (
							<motion.div
								key={index}
								{...fadeInUp}
								transition={{ delay: index * 0.15 }}
								className="relative"
							>
								<div className="text-center">
									<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg shadow-slate-200/50 mb-6">
										<item.icon className="h-8 w-8 text-blue-600" />
									</div>
									<div className="text-sm font-bold text-blue-600 mb-2">
										STEP {item.step}
									</div>
									<h3 className="text-xl font-bold text-slate-900 mb-3">
										{item.title}
									</h3>
									<p className="text-slate-600 leading-relaxed">
										{item.description}
									</p>
								</div>
								{index < 2 && (
									<div className="hidden md:block absolute top-8 left-[60%] w-[80%]">
										<ChevronRight className="h-6 w-6 text-slate-300" />
									</div>
								)}
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials */}
			<section className="py-24 bg-white">
				<div className="container mx-auto px-4">
					<div className="text-center max-w-3xl mx-auto mb-16">
						<Badge className="mb-4 bg-amber-50 text-amber-700 hover:bg-amber-100 border-0">
							Testimonials
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
							Loved by doctors across Malaysia
						</h2>
					</div>

					<div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
						{testimonials.map((testimonial, index) => (
							<motion.div
								key={index}
								{...fadeInUp}
								transition={{ delay: index * 0.1 }}
							>
								<Card className="h-full border-slate-100">
									<CardContent className="pt-6">
										<div className="flex gap-1 mb-4">
											{Array.from({ length: testimonial.rating }).map(
												(_, i) => (
													<Star
														key={i}
														className="h-4 w-4 fill-amber-400 text-amber-400"
													/>
												),
											)}
										</div>
										<p className="text-slate-600 mb-6 leading-relaxed">
											"{testimonial.content}"
										</p>
										<div className="flex items-center gap-3">
											<Avatar>
												<AvatarImage src={testimonial.avatar} />
												<AvatarFallback>
													{testimonial.name
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<div>
												<div className="font-semibold text-slate-900">
													{testimonial.name}
												</div>
												<div className="text-sm text-slate-500">
													{testimonial.role} • {testimonial.location}
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-24 bg-slate-50">
				<div className="container mx-auto px-4 max-w-3xl">
					<div className="text-center mb-12">
						<Badge className="mb-4 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-0">
							FAQ
						</Badge>
						<h2 className="text-3xl font-bold text-slate-900 mb-4">
							Frequently asked questions
						</h2>
					</div>
					<Accordion type="single" collapsible className="w-full">
						{faqs.map((faq, index) => (
							<AccordionItem key={index} value={`item-${index}`}>
								<AccordionTrigger className="text-left text-lg font-medium text-slate-900 hover:no-underline">
									{faq.question}
								</AccordionTrigger>
								<AccordionContent className="text-slate-600 text-base leading-relaxed">
									{faq.answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24 bg-slate-900 text-white relative overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--tw-gradient-stops))] from-blue-900/50 to-transparent" />
				<div className="container mx-auto px-4 relative z-10">
					<div className="max-w-4xl mx-auto text-center">
						<motion.div {...fadeInUp}>
							<h2 className="text-3xl md:text-5xl font-bold mb-6">
								Ready to take control of your career?
							</h2>
							<p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
								Join Malaysia's fastest-growing community of locum doctors. Your
								next opportunity is waiting.
							</p>
							<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
								<Link href="/register">
									<Button
										size="lg"
										className="h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-100 rounded-full"
									>
										Create Free Account
										<ArrowRight className="ml-2 h-5 w-5" />
									</Button>
								</Link>
								<Link href="/employer">
									<Button
										variant="outline"
										size="lg"
										className="h-14 px-8 text-lg bg-transparent border-slate-700 text-white hover:bg-slate-800 rounded-full"
									>
										For Healthcare Facility
									</Button>
								</Link>
							</div>
						</motion.div>
					</div>
				</div>
			</section>
		</div>
	);
}
