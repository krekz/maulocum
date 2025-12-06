"use client";

import {
	ArrowRight,
	BadgeCheck,
	BarChart3,
	Bell,
	Building2,
	Calendar,
	Clock,
	FileText,
	Play,
	Search,
	ShieldCheck,
	Star,
	TrendingUp,
	UserCheck,
	Users,
	Zap,
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
	{ value: "2,500+", label: "Verified Doctors", icon: UserCheck },
	{ value: "98%", label: "Fill Rate", icon: TrendingUp },
	{ value: "< 2hrs", label: "Avg. Response", icon: Clock },
	{ value: "500+", label: "Facilities", icon: Building2 },
];

const features = [
	{
		title: "Smart Candidate Matching",
		description:
			"AI-powered matching finds the most qualified professionals based on specialty, experience, and availability.",
		icon: Search,
		color: "text-violet-600",
		bg: "bg-violet-50",
	},
	{
		title: "Verified Credentials",
		description:
			"Every professional is pre-verified with APC, MMC, and insurance checks. No manual verification needed.",
		icon: ShieldCheck,
		color: "text-emerald-600",
		bg: "bg-emerald-50",
	},
	{
		title: "Real-time Availability",
		description:
			"See who's available instantly. No more phone tag or waiting for agency callbacks.",
		icon: Calendar,
		color: "text-blue-600",
		bg: "bg-blue-50",
	},
	{
		title: "Automated Compliance",
		description:
			"Digital logbooks, attendance tracking, and audit-ready documentation generated automatically.",
		icon: FileText,
		color: "text-amber-600",
		bg: "bg-amber-50",
	},
	{
		title: "Performance Analytics",
		description:
			"Track fill rates, response times, and staff performance with detailed dashboards.",
		icon: BarChart3,
		color: "text-rose-600",
		bg: "bg-rose-50",
	},
	{
		title: "Instant Notifications",
		description:
			"Get alerts when candidates apply, shifts are filled, or action is needed.",
		icon: Bell,
		color: "text-cyan-600",
		bg: "bg-cyan-50",
	},
];

const testimonials = [
	{
		name: "Dr. Tan Wei Ming",
		role: "Medical Director",
		company: "Pantai Hospital KL",
		content:
			"MauLocum cut our locum sourcing time by 80%. We used to spend hours calling agencies—now we post a shift and get qualified applicants within minutes.",
		avatar: "https://randomuser.me/api/portraits/men/32.jpg",
	},
	{
		name: "Puan Siti Aminah",
		role: "HR Manager",
		company: "KPJ Damansara",
		content:
			"The verification system gives us peace of mind. Every doctor comes pre-vetted, and the digital logbooks make compliance audits a breeze.",
		avatar: "https://randomuser.me/api/portraits/women/44.jpg",
	},
	{
		name: "Mr. Rajesh Kumar",
		role: "Operations Head",
		company: "Sunway Medical Centre",
		content:
			"We've reduced our agency fees by 60% since switching to MauLocum. The platform pays for itself many times over.",
		avatar: "https://randomuser.me/api/portraits/men/67.jpg",
	},
];

const faqs = [
	{
		question: "How does the verification process work?",
		answer:
			"All healthcare professionals on MauLocum undergo rigorous verification including APC certificate validation, MMC registration check, and professional indemnity insurance verification. This happens before they can apply to any job, so you receive only pre-qualified candidates.",
	},
	{
		question: "What does it cost to use MauLocum?",
		answer:
			"Posting jobs is completely free. We operate on a success-based model—you only pay a small platform fee when a shift is successfully completed. No subscription fees, no hidden charges.",
	},
	{
		question: "How quickly can I fill an urgent shift?",
		answer:
			"Our average response time is under 2 hours. For urgent shifts, we have a priority matching system that immediately notifies qualified professionals in your area. Many facilities fill urgent shifts within 30 minutes.",
	},
	{
		question: "Can I hire for permanent positions too?",
		answer:
			"Yes! While MauLocum specializes in locum placements, many facilities use our platform to trial professionals before offering permanent positions. We support single shifts, recurring schedules, and long-term placements.",
	},
	{
		question: "How do payments and invoicing work?",
		answer:
			"We handle all payment processing. You receive a single consolidated invoice, and we manage individual disbursements to locums. This saves your finance team hours of administrative work each month.",
	},
];

const trustedBy = [
	"KPJ Healthcare",
	"Pantai Hospitals",
	"Sunway Medical",
	"Gleneagles",
	"Columbia Asia",
	"TMC Fertility",
];

export default function EmployerPage() {
	const fadeInUp = {
		initial: { opacity: 0, y: 24 },
		whileInView: { opacity: 1, y: 0 },
		viewport: { once: true },
		transition: { duration: 0.5 },
	};

	return (
		<div className="flex flex-col min-h-screen">
			{/* Hero Section */}
			<section className="relative pt-12 pb-8 lg:pt-20 lg:pb-12 overflow-hidden">
				{/* Background - Warm dark with orange/amber glow */}
				<div className="absolute inset-0 -z-10 bg-orange-50" />
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-orange-900/30 via-slate-950 to-slate-950" />
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-amber-500/15 to-transparent blur-3xl" />

				<div className="container mx-auto px-4">
					<div className="max-w-6xl mx-auto">
						{/* Hero Content */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-center mb-12 lg:mb-16"
						>
							<Badge className="mb-6 px-4 py-2 text-sm font-medium hover:bg-white/15 rounded-full border border-white/10">
								<Building2 className="w-4 h-4 mr-2" />
								For Healthcare Facilities
							</Badge>

							<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
								Hire verified locums
								<br />
								<span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 via-amber-400 to-yellow-400">
									in minutes, not days
								</span>
							</h1>

							<p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
								Stop chasing agencies. Access Malaysia's largest network of
								pre-verified healthcare professionals and fill shifts faster
								than ever.
							</p>

							<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
								<Link href="/employer/register">
									<Button
										size="lg"
										className="h-12 px-6 text-base bg-white text-slate-900 hover:bg-slate-100 rounded-full font-semibold"
									>
										Start Hiring Free
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</Link>
								<Button
									variant="outline"
									size="lg"
									className="h-12 px-6 text-base bg-transparent border-slate-700 text-black hover:bg-slate-800 rounded-full"
								>
									<Play className="mr-2 h-4 w-4 " />
									Watch Demo
								</Button>
							</div>
						</motion.div>

						{/* Dashboard Preview */}
						<motion.div
							initial={{ opacity: 0, y: 40 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
							className="relative hidden md:block"
						>
							{/* Glow effect */}
							<div className="absolute -inset-4 bg-linear-to-r from-orange-500/20 via-amber-500/20 to-teal-500/20 rounded-3xl blur-2xl" />

							{/* Browser Frame */}
							<div className="relative bg-slate-900 rounded-xl lg:rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
								{/* Browser Header */}
								<div className="flex items-center gap-2 px-4 py-3 bg-slate-800/80 border-b border-slate-700/50">
									<div className="flex gap-1.5">
										<div className="w-3 h-3 rounded-full bg-red-500/80" />
										<div className="w-3 h-3 rounded-full bg-amber-500/80" />
										<div className="w-3 h-3 rounded-full bg-green-500/80" />
									</div>
									<div className="flex-1 flex justify-center">
										<div className="flex items-center gap-2 px-4 py-1.5 bg-slate-700/50 rounded-lg text-xs text-slate-400 font-mono">
											<div className="w-2 h-2 rounded-full bg-green-500" />
											maulocum.com/dashboard
										</div>
									</div>
								</div>

								{/* Dashboard Content */}
								<div className="p-3 md:p-5 bg-slate-100">
									<div className="grid lg:grid-cols-12 gap-4">
										{/* Sidebar */}
										<div className="lg:col-span-3 space-y-3">
											{/* Facility Card */}
											<div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60">
												<div className="flex items-center gap-3 mb-4">
													<div className="w-11 h-11 rounded-xl bg-linear-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20">
														KPJ
													</div>
													<div>
														<div className="font-semibold text-slate-900 text-sm">
															KPJ Damansara
														</div>
														<div className="text-xs text-slate-500">
															Specialist Hospital
														</div>
													</div>
												</div>
												<div className="grid grid-cols-2 gap-2 text-center">
													<div className="bg-slate-50 rounded-lg p-2">
														<div className="text-lg font-bold text-slate-900">
															24
														</div>
														<div className="text-[10px] text-slate-500 uppercase tracking-wide">
															Active Jobs
														</div>
													</div>
													<div className="bg-slate-50 rounded-lg p-2">
														<div className="text-lg font-bold text-emerald-600">
															18
														</div>
														<div className="text-[10px] text-slate-500 uppercase tracking-wide">
															Filled
														</div>
													</div>
												</div>
											</div>

											{/* Quick Actions */}
											<div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60">
												<div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
													Quick Actions
												</div>
												<div className="space-y-1.5">
													<button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg bg-violet-50 text-violet-700 font-medium">
														<Zap className="w-4 h-4" />
														Post Urgent Shift
													</button>
													<button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg hover:bg-slate-50 text-slate-600">
														<Users className="w-4 h-4" />
														Browse Doctors
													</button>
												</div>
											</div>
										</div>

										{/* Main Content */}
										<div className="lg:col-span-9 space-y-4">
											{/* Stats Row */}
											<div className="grid grid-cols-4 gap-3">
												{[
													{
														label: "Pending Review",
														value: "12",
														color: "text-amber-600",
														bg: "bg-amber-50",
													},
													{
														label: "Interviews",
														value: "5",
														color: "text-blue-600",
														bg: "bg-blue-50",
													},
													{
														label: "Confirmed",
														value: "18",
														color: "text-emerald-600",
														bg: "bg-emerald-50",
													},
													{
														label: "This Month",
														value: "RM 45K",
														color: "text-violet-600",
														bg: "bg-violet-50",
													},
												].map((stat, i) => (
													<div
														key={i}
														className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60"
													>
														<div className={`text-xl font-bold ${stat.color}`}>
															{stat.value}
														</div>
														<div className="text-[10px] text-slate-500 uppercase tracking-wide">
															{stat.label}
														</div>
													</div>
												))}
											</div>

											{/* Applicants Table */}
											<div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
												<div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
													<div className="flex items-center gap-3">
														<h3 className="font-semibold text-slate-900 text-sm">
															Recent Applicants
														</h3>
														<Badge className="bg-violet-100 text-violet-700 text-xs">
															12 new
														</Badge>
													</div>
													<div className="flex gap-1 text-xs">
														<span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-medium">
															All
														</span>
														<span className="px-2 py-1 text-slate-500 rounded-md hover:bg-slate-50">
															Pending
														</span>
														<span className="px-2 py-1 text-slate-500 rounded-md hover:bg-slate-50">
															Shortlisted
														</span>
													</div>
												</div>

												<div className="divide-y divide-slate-50">
													{/* Applicant Row 1 */}
													<div className="px-4 py-3 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
														<Avatar className="h-10 w-10 border-2 border-white shadow-sm">
															<AvatarImage src="https://randomuser.me/api/portraits/women/28.jpg" />
															<AvatarFallback>SA</AvatarFallback>
														</Avatar>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2">
																<span className="font-medium text-slate-900 text-sm">
																	Dr. Sarah Ahmad
																</span>
																<BadgeCheck className="w-4 h-4 text-blue-500" />
																<div className="flex items-center gap-0.5 text-amber-500">
																	<Star className="w-3 h-3 fill-current" />
																	<span className="text-xs font-medium">
																		4.9
																	</span>
																</div>
															</div>
															<div className="text-xs text-slate-500">
																Family Medicine • 8 yrs exp
															</div>
														</div>
														<div className="text-right">
															<div className="text-xs font-medium text-slate-900">
																GP Locum - Weekend
															</div>
															<div className="text-[10px] text-slate-400">
																Applied 2 mins ago
															</div>
														</div>
														<div className="flex gap-1.5">
															<Button
																size="sm"
																variant="outline"
																className="h-7 text-xs"
															>
																View
															</Button>
															<Button
																size="sm"
																className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
															>
																Accept
															</Button>
														</div>
													</div>

													{/* Applicant Row 2 */}
													<div className="px-4 py-3 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
														<Avatar className="h-10 w-10 border-2 border-white shadow-sm">
															<AvatarImage src="https://randomuser.me/api/portraits/men/42.jpg" />
															<AvatarFallback>AR</AvatarFallback>
														</Avatar>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2">
																<span className="font-medium text-slate-900 text-sm">
																	Dr. Ahmad Razak
																</span>
																<BadgeCheck className="w-4 h-4 text-blue-500" />
																<div className="flex items-center gap-0.5 text-amber-500">
																	<Star className="w-3 h-3 fill-current" />
																	<span className="text-xs font-medium">
																		4.8
																	</span>
																</div>
															</div>
															<div className="text-xs text-slate-500">
																Emergency Medicine • 12 yrs exp
															</div>
														</div>
														<div className="text-right">
															<div className="text-xs font-medium text-slate-900">
																ED Night Shift
															</div>
															<div className="text-[10px] text-slate-400">
																Applied 15 mins ago
															</div>
														</div>
														<div className="flex gap-1.5">
															<Button
																size="sm"
																variant="outline"
																className="h-7 text-xs"
															>
																View
															</Button>
															<Button
																size="sm"
																className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
															>
																Accept
															</Button>
														</div>
													</div>

													{/* Applicant Row 3 */}
													<div className="px-4 py-3 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
														<Avatar className="h-10 w-10 border-2 border-white shadow-sm">
															<AvatarImage src="https://randomuser.me/api/portraits/women/36.jpg" />
															<AvatarFallback>NH</AvatarFallback>
														</Avatar>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2">
																<span className="font-medium text-slate-900 text-sm">
																	Dr. Nurul Huda
																</span>
																<BadgeCheck className="w-4 h-4 text-blue-500" />
																<div className="flex items-center gap-0.5 text-amber-500">
																	<Star className="w-3 h-3 fill-current" />
																	<span className="text-xs font-medium">
																		5.0
																	</span>
																</div>
															</div>
															<div className="text-xs text-slate-500">
																Paediatrics • 6 yrs exp
															</div>
														</div>
														<div className="text-right">
															<div className="text-xs font-medium text-slate-900">
																Paeds Clinic
															</div>
															<div className="text-[10px] text-slate-400">
																Applied 1 hour ago
															</div>
														</div>
														<div className="flex gap-1.5">
															<Button
																size="sm"
																variant="outline"
																className="h-7 text-xs"
															>
																View
															</Button>
															<Button
																size="sm"
																className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
															>
																Accept
															</Button>
														</div>
													</div>
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

			{/* Trusted By */}
			<section className="py-8 bg-slate-50 border-y border-slate-100">
				<div className="container mx-auto px-4">
					<div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
						<span className="text-sm text-slate-500 font-medium shrink-0">
							Trusted by leading facilities
						</span>
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
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-16 bg-white">
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
								<div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 text-slate-600 mb-4">
									<stat.icon className="w-6 h-6" />
								</div>
								<div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
									{stat.value}
								</div>
								<div className="text-sm text-slate-500">{stat.label}</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 bg-slate-50">
				<div className="container mx-auto px-4">
					<div className="text-center max-w-3xl mx-auto mb-16">
						<Badge className="mb-4 bg-violet-100 text-violet-700 hover:bg-violet-200 border-0">
							Platform Features
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
							Everything you need to manage locum staffing
						</h2>
						<p className="text-lg text-slate-600">
							Replace spreadsheets, phone calls, and agency middlemen with one
							powerful platform.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
						{features.map((feature, index) => (
							<motion.div
								key={index}
								{...fadeInUp}
								transition={{ delay: index * 0.08 }}
							>
								<Card className="h-full border-slate-200/60 hover:border-slate-300 hover:shadow-lg transition-all duration-300 bg-white">
									<CardHeader>
										<div
											className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4`}
										>
											<feature.icon className="h-6 w-6" />
										</div>
										<CardTitle className="text-lg">{feature.title}</CardTitle>
									</CardHeader>
									<CardContent>
										<CardDescription className="text-sm leading-relaxed">
											{feature.description}
										</CardDescription>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials */}
			<section className="py-20 bg-white">
				<div className="container mx-auto px-4">
					<div className="text-center max-w-3xl mx-auto mb-16">
						<Badge className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-200 border-0">
							Testimonials
						</Badge>
						<h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
							Trusted by Malaysia's top healthcare facilities
						</h2>
					</div>

					<div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
						{testimonials.map((testimonial, index) => (
							<motion.div
								key={index}
								{...fadeInUp}
								transition={{ delay: index * 0.1 }}
							>
								<Card className="h-full border-slate-200/60 bg-slate-50">
									<CardContent className="pt-6">
										<p className="text-slate-600 mb-6 leading-relaxed text-sm">
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
												<div className="font-semibold text-slate-900 text-sm">
													{testimonial.name}
												</div>
												<div className="text-xs text-slate-500">
													{testimonial.role}, {testimonial.company}
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
			<section className="py-20 bg-slate-50">
				<div className="container mx-auto px-4 max-w-3xl">
					<div className="text-center mb-12">
						<Badge className="mb-4 bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-0">
							FAQ
						</Badge>
						<h2 className="text-3xl font-bold text-slate-900 mb-4">
							Frequently asked questions
						</h2>
					</div>
					<Accordion type="single" collapsible className="w-full">
						{faqs.map((faq, index) => (
							<AccordionItem
								key={index}
								value={`item-${index}`}
								className="bg-white mb-2 rounded-lg border border-slate-200/60 px-4"
							>
								<AccordionTrigger className="text-left text-base font-medium text-slate-900 hover:no-underline py-4">
									{faq.question}
								</AccordionTrigger>
								<AccordionContent className="text-slate-600 text-sm leading-relaxed pb-4">
									{faq.answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-slate-900 text-white relative overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--tw-gradient-stops))] from-orange-900/40 to-transparent" />
				<div className="container mx-auto px-4 relative z-10">
					<div className="max-w-4xl mx-auto text-center">
						<motion.div {...fadeInUp}>
							<h2 className="text-3xl md:text-4xl font-bold mb-6">
								Ready to transform your staffing?
							</h2>
							<p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
								Join 500+ healthcare facilities already using MauLocum to hire
								faster and smarter.
							</p>
							<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
								<Link href="/employer/register">
									<Button
										size="lg"
										className="h-12 px-8 text-base bg-white text-slate-900 hover:bg-slate-100 rounded-full font-semibold"
									>
										Get Started Free
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</Link>
								<Link href="/contact">
									<Button
										variant="outline"
										size="lg"
										className="h-12 px-8 text-base bg-transparent border-slate-700 text-white hover:bg-slate-800 rounded-full"
									>
										Talk to Sales
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
