import { Building, FileText, Search, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function EmployerPage() {
	return (
		<div className="flex flex-col min-h-screen">
			{/* Hero Section */}
			<section className="relative bg-primary/90 py-16 sm:py-20 md:py-24">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center">
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6">
							Find the Perfect Healthcare Professionals for Your Facility
						</h1>
						<p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8">
							MauLocum connects healthcare facilities with qualified locum
							professionals across Malaysia
						</p>
						<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
							<Button size="lg" variant="secondary">
								Learn More
							</Button>
							<Link href="/employer/register">
								<Button size="lg" variant="default">
									Register
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-16 sm:py-20 bg-white">
				<div className="container mx-auto px-4">
					<h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
						How MauLocum Works for Employers
					</h2>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<div className="bg-blue-50 p-4 sm:p-6 rounded-xl">
							<FileText className="h-10 w-10 sm:h-12 sm:w-12 mb-3" />
							<h3 className="text-lg sm:text-xl font-semibold mb-1">
								Post Job Listings
							</h3>
							<p className="text-gray-600 text-sm sm:text-base">
								Create detailed job postings to attract qualified healthcare
								professionals.
							</p>
						</div>

						<div className="bg-blue-50 p-4 sm:p-6 rounded-xl">
							<Search className="h-10 w-10 sm:h-12 sm:w-12 mb-3" />
							<h3 className="text-lg sm:text-xl font-semibold mb-1">
								Search Talent
							</h3>
							<p className="text-gray-600 text-sm sm:text-base">
								Browse our database of verified healthcare professionals.
							</p>
						</div>

						<div className="bg-blue-50 p-4 sm:p-6 rounded-xl">
							<Building className="h-10 w-10 sm:h-12 sm:w-12 mb-3" />
							<h3 className="text-lg sm:text-xl font-semibold mb-1">
								Employer Branding
							</h3>
							<p className="text-gray-600 text-sm sm:text-base">
								Showcase your facility to attract the best talent in the
								industry.
							</p>
						</div>

						<div className="bg-blue-50 p-4 sm:p-6 rounded-xl">
							<Users className="h-10 w-10 sm:h-12 sm:w-12 mb-3" />
							<h3 className="text-lg sm:text-xl font-semibold mb-1">
								Staffing Solutions
							</h3>
							<p className="text-gray-600 text-sm sm:text-base">
								Get personalized assistance finding the right professionals.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-12 sm:py-16 bg-gray-50">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-2xl sm:text-3xl font-bold mb-4">
						Ready to find your next healthcare professional?
					</h2>
					<p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto">
						Join hundreds of healthcare facilities across Malaysia using
						MauLocum to find qualified professionals.
					</p>
					<Link href="/employer/post-job">
						<Button size="lg">Get Started Today</Button>
					</Link>
				</div>
			</section>
		</div>
	);
}

export default EmployerPage;
