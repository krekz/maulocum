"use client";

import { motion, useAnimation, useInView } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";

export interface Testimonial {
	id: number;
	name: string;
	role: string;
	company: string;
	content: string;
	rating: number;
	avatar: string;
}

export interface AnimatedTestimonialsProps {
	title?: string;
	subtitle?: string;
	badgeText?: string;
	testimonials?: Testimonial[];
	autoRotateInterval?: number;
	trustedCompanies?: string[];
	trustedCompaniesTitle?: string;
	className?: string;
}

export function AnimatedTestimonials({
	title = "Trusted by healthcare professionals",
	subtitle = "Hear what healthcare professionals have to say about our locum tenens platform.",
	badgeText = "Medical professionals approved",
	testimonials = [],
	autoRotateInterval = 6000,
	trustedCompanies = [],
	trustedCompaniesTitle = "Trusted by physicians from leading healthcare institutions",
	className,
}: AnimatedTestimonialsProps) {
	const [activeIndex, setActiveIndex] = useState(0);

	// Refs for scroll animations
	const sectionRef = useRef(null);
	const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
	const controls = useAnimation();

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
			},
		},
	};

	// Trigger animations when section comes into view
	useEffect(() => {
		if (isInView) {
			controls.start("visible");
		}
	}, [isInView, controls]);

	// Auto rotate testimonials
	useEffect(() => {
		if (autoRotateInterval <= 0 || testimonials.length <= 1) return;

		const interval = setInterval(() => {
			setActiveIndex((current) => (current + 1) % testimonials.length);
		}, autoRotateInterval);

		return () => clearInterval(interval);
	}, [autoRotateInterval, testimonials.length]);

	if (testimonials.length === 0) {
		return null;
	}

	return (
		<section
			ref={sectionRef}
			id="testimonials"
			className={`pb-24 pt-5 overflow-hidden ${className || ""}`}
		>
			<div className="px-4 md:px-6 bg-muted/20 rounded-md py-5">
				<motion.div
					initial="hidden"
					animate={controls}
					variants={containerVariants}
					className="grid grid-cols-1 gap-16 w-full md:grid-cols-2 lg:gap-24"
				>
					{/* Left side: Heading and navigation */}
					<motion.div
						variants={itemVariants}
						className="flex flex-col justify-center"
					>
						<div className="space-y-6">
							{badgeText && (
								<div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
									<Star className="mr-1 h-3.5 w-3.5 fill-primary" />
									<span>{badgeText}</span>
								</div>
							)}

							<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
								{title}
							</h2>

							<p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
								{subtitle}
							</p>

							<div className="flex items-center gap-3 pt-4">
								{testimonials.map((_, index) => (
									<Button
										key={index}
										onClick={() => setActiveIndex(index)}
										className={`h-2.5 rounded-full transition-all duration-300 ${
											activeIndex === index
												? "w-10 bg-primary"
												: "w-2.5 bg-muted-foreground/30"
										}`}
										aria-label={`View testimonial ${index + 1}`}
									/>
								))}
							</div>
						</div>
					</motion.div>

					{/* Right side: Testimonial cards */}
					<motion.div
						variants={itemVariants}
						className="relative h-full mr-10 min-h-[300px] md:min-h-[400px]"
					>
						{testimonials.map((testimonial, index) => (
							<motion.div
								key={testimonial.id}
								className="absolute inset-0"
								initial={{ opacity: 0, x: 100 }}
								animate={{
									opacity: activeIndex === index ? 1 : 0,
									x: activeIndex === index ? 0 : 100,
									scale: activeIndex === index ? 1 : 0.9,
								}}
								transition={{ duration: 0.5, ease: "easeInOut" }}
								style={{ zIndex: activeIndex === index ? 10 : 0 }}
							>
								<div className="bg-card border shadow-lg rounded-xl p-4 sm:p-6 md:p-8 h-full flex flex-col">
									<div className="mb-4 md:mb-6 flex gap-1 sm:gap-2">
										{Array(testimonial.rating)
											.fill(0)
											.map((_, i) => (
												<Star
													key={i}
													className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-500 text-yellow-500"
												/>
											))}
									</div>

									<div className="relative mb-4 md:mb-6 flex-1">
										<Quote className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 h-6 w-6 sm:h-8 sm:w-8 text-primary/20 rotate-180" />
										<p className="relative z-10 text-base sm:text-lg font-medium leading-relaxed line-clamp-6 sm:line-clamp-none">
											"{testimonial.content}"
										</p>
									</div>

									<Separator className="my-3 sm:my-4" />

									<div className="flex items-center gap-3 sm:gap-4">
										<Avatar className="h-10 w-10 sm:h-12 sm:w-12 border">
											<AvatarImage
												src={testimonial.avatar}
												alt={testimonial.name}
											/>
											<AvatarFallback>
												{testimonial.name.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<div>
											<h3 className="font-semibold text-sm sm:text-base">
												{testimonial.name}
											</h3>
											<p className="text-xs sm:text-sm text-muted-foreground">
												{testimonial.role}, {testimonial.company}
											</p>
										</div>
									</div>
								</div>
							</motion.div>
						))}

						{/* Decorative elements */}
						<div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 h-16 w-16 sm:h-24 sm:w-24 rounded-xl bg-primary/5 hidden sm:block" />
						<div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 h-16 w-16 sm:h-24 sm:w-24 rounded-xl bg-primary/5 hidden sm:block" />
					</motion.div>
				</motion.div>

				{/* Logo cloud */}
				{trustedCompanies.length > 0 && (
					<motion.div
						variants={itemVariants}
						initial="hidden"
						animate={controls}
						className="mt-24 text-center"
					>
						<h3 className="text-sm font-medium text-muted-foreground mb-8">
							{trustedCompaniesTitle}
						</h3>
						<div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
							{trustedCompanies.map((company) => (
								<div
									key={company}
									className="text-2xl font-semibold text-muted-foreground/50"
								>
									{company}
								</div>
							))}
						</div>
					</motion.div>
				)}
			</div>
		</section>
	);
}
