import { ArrowRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "./ui/button";

function Hero() {
	return (
		<div className="relative py-5 lg:py-24 overflow-hidden">
			{/* Gradient backgrounds */}
			{/* <div className="absolute top-20 left-20 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" /> */}
			<div className="absolute bottom-20 right-20 w-[250px] h-[250px] rounded-full bg-gradient-to-r from-green-400/20 to-teal-500/20 blur-3xl" />
			<div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full bg-gradient-to-r from-amber-300/20 to-pink-500/20 blur-3xl" />

			<div className="container mx-auto px-4">
				<div className="flex flex-col lg:flex-row items-center justify-between gap-12">
					{/* Left content section */}
					<div className="lg:w-1/2 flex flex-col items-start text-left z-10 space-y-6">
						<div className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
							<span className="inline-block h-2 w-2 rounded-full bg-primary" />
							<span>Qualified Experts</span>
						</div>

						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
							Explore Malaysian Healthcare Gigs
							<br />
							Made <span className="text-primary">Simple</span>
						</h1>

						<p className="text-muted-foreground text-lg max-w-xl">
							Empowering Malaysian doctors with smarter ways to find locum gigs,
							manage shifts, and grow in the healthcare industry.
						</p>

						<div className="flex flex-wrap gap-4 mt-2">
							<Link
								href="/jobs"
								className={buttonVariants({
									size: "lg",
									variant: "default",
									className:
										"bg-primary hover:bg-primary/90 text-white font-medium px-6",
								})}
							>
								Get Started
							</Link>
							<Link
								href="/about"
								className={buttonVariants({
									size: "lg",
									variant: "outline",
									className:
										"border-primary/20 text-foreground font-medium px-6",
								})}
							>
								More Details
							</Link>
						</div>

						{/* Stats card */}
						<div className="bg-background/80 backdrop-blur-sm shadow-lg rounded-2xl p-4 mt-8 border border-border/40">
							<div className="flex items-center gap-3">
								<div className="flex -space-x-2">
									<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">
										DR
									</div>
									<div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-primary text-xs">
										KL
									</div>
									<div className="w-8 h-8 rounded-full bg-primary/40 flex items-center justify-center text-primary text-xs">
										MN
									</div>
								</div>
								<div>
									<p className="font-bold text-xl">1.5K+</p>
									<p className="text-xs text-muted-foreground">
										Happy clients and successful placements
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Right image section with floating elements */}
					<div className="lg:w-1/2 relative">
						<div className="relative bg-linear-to-br from-primary/20 via-primary/10 to-transparent rounded-full w-[320px] h-[320px] lg:w-[500px] lg:h-[500px] flex items-center justify-center">
							{/* Main image */}
							<Image
								width={280}
								height={280}
								src="https://images.unsplash.com/photo-1550831107-1553da8c8464?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZG9jdG9yc3xlbnwwfHwwfHx8MA%3D%3D"
								alt="Healthcare professional"
								className="rounded-full w-[280px] h-[280px] lg:w-[420px] lg:h-[420px] object-cover border-4 border-background object-top"
							/>

							{/* Floating chart card */}
							<div className="absolute -left-10 top-1/4 bg-background/90 backdrop-blur-sm shadow-lg rounded-xl p-3 border border-border/40">
								<div className="flex items-center justify-between mb-2">
									<div className="w-2 h-2 rounded-full bg-red-500" />
									<div className="w-2 h-2 rounded-full bg-yellow-500" />
									<div className="w-2 h-2 rounded-full bg-green-500" />
								</div>
								<div className="flex h-12 items-end gap-1">
									<div className="w-3 bg-muted h-4" />
									<div className="w-3 bg-muted h-8" />
									<div className="w-3 bg-primary h-12" />
									<div className="w-3 bg-muted h-6" />
									<div className="w-3 bg-muted h-9" />
								</div>
							</div>

							{/* Floating message card */}
							<div className="absolute -right-5 top-1/2 bg-background/90 backdrop-blur-sm shadow-lg rounded-xl p-4 border border-border/40 max-w-[200px]">
								<div className="flex justify-between items-start mb-2">
									<p className="font-medium">Find easy locum jobs</p>
								</div>
								<div className="flex gap-2 mt-2">
									<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
										<MessageCircle size={16} />
									</div>
									<div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground">
										<ArrowRight size={16} />
									</div>
								</div>
							</div>

							{/* Floating chart/graph */}
							<div className="absolute -bottom-5 right-10 bg-background/90 backdrop-blur-sm shadow-lg rounded-xl p-3 border border-border/40">
								<svg
									width="100"
									height="40"
									viewBox="0 0 100 40"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M0 38H100" stroke="#E5E7EB" strokeWidth="1" />
									<path
										d="M10 30L30 20L50 25L70 10L90 15"
										stroke="#D1D5DB"
										strokeWidth="1.5"
									/>
									<path
										d="M10 30L30 20L50 25L70 10L90 15"
										stroke="#10B981"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<circle
										cx="30"
										cy="20"
										r="3"
										fill="white"
										stroke="#10B981"
										strokeWidth="1.5"
									/>
									<circle
										cx="70"
										cy="10"
										r="3"
										fill="white"
										stroke="#10B981"
										strokeWidth="1.5"
									/>
									<circle
										cx="90"
										cy="15"
										r="3"
										fill="#10B981"
										stroke="#10B981"
										strokeWidth="1.5"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Hero;
