"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditionsPage() {
	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-xl font-semibold">
						Terms & Conditions
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						Last updated: {new Date().toLocaleDateString()}
					</p>
				</CardHeader>

				<CardContent className="space-y-6 text-sm leading-relaxed">
					<section>
						<p>
							These Terms and Conditions ("Terms") govern your access to and use
							of the MauLocum platform ("the Platform"). By accessing or using
							this Platform, you agree to be bound by these Terms. If you do not
							agree, please discontinue use of the Platform.
						</p>
					</section>

					<section>
						<h2 className="font-medium">1. Platform Purpose</h2>
						<p>
							MauLocum is a web-based locum hiring platform designed to connect
							healthcare facilities with verified locum professionals in
							Malaysia. The Platform facilitates job posting, browsing,
							applications, and communication but does not act as an employer or
							recruitment agency.
						</p>
					</section>

					<section>
						<h2 className="font-medium">2. User Eligibility</h2>
						<ul className="list-disc pl-5 space-y-1">
							<li>Users must be at least 18 years old</li>
							<li>Healthcare professionals must provide valid credentials</li>
							<li>
								Healthcare facilities must provide accurate business information
							</li>
							<li>Users are responsible for maintaining account security</li>
						</ul>
					</section>

					<section>
						<h2 className="font-medium">3. Account Registration</h2>
						<p>
							Users are required to register an account to access full platform
							features. You agree to provide accurate and complete information
							and to update it when necessary. MauLocum reserves the right to
							suspend or terminate accounts that provide false or misleading
							information.
						</p>
					</section>

					<section>
						<h2 className="font-medium">4. Verification & Credentials</h2>
						<p>
							Healthcare professionals may be required to submit professional
							documents such as APC or licenses for verification. MauLocum
							verifies credentials for platform access but does not guarantee
							employment or job placement.
						</p>
					</section>

					<section>
						<h2 className="font-medium">5. Job Listings & Applications</h2>
						<p>
							Healthcare facilities are responsible for the accuracy of job
							postings, including pay rates, schedules, and job requirements.
							MauLocum is not responsible for disputes arising from job
							agreements between users.
						</p>
					</section>

					<section>
						<h2 className="font-medium">6. Reviews & Ratings</h2>
						<p>
							Users may submit reviews and ratings based on genuine work
							experiences. Reviews must be truthful, respectful, and free from
							offensive content. MauLocum reserves the right to moderate or
							remove content that violates these Terms.
						</p>
					</section>

					<section>
						<h2 className="font-medium">7. Prohibited Use</h2>
						<ul className="list-disc pl-5 space-y-1">
							<li>Providing false credentials or impersonating others</li>
							<li>Posting misleading or fraudulent job listings</li>
							<li>Harassing or abusing other users</li>
							<li>Attempting to breach platform security</li>
							<li>Using the Platform for unlawful activities</li>
						</ul>
					</section>

					<section>
						<h2 className="font-medium">8. Data Protection</h2>
						<p>
							All personal data is handled in accordance with the MauLocum
							Privacy Policy and Malaysia’s Personal Data Protection Act 2010
							(PDPA).
						</p>
					</section>

					<section>
						<h2 className="font-medium">9. Limitation of Liability</h2>
						<p>
							MauLocum shall not be liable for any indirect, incidental, or
							consequential damages arising from the use of the Platform. The
							Platform is provided on an "as-is" basis.
						</p>
					</section>

					<section>
						<h2 className="font-medium">10. Termination</h2>
						<p>
							MauLocum reserves the right to suspend or terminate user accounts
							that violate these Terms, without prior notice.
						</p>
					</section>

					<section>
						<h2 className="font-medium">11. Changes to Terms</h2>
						<p>
							These Terms may be updated periodically. Continued use of the
							Platform after changes indicates acceptance of the revised Terms.
						</p>
					</section>

					<section>
						<h2 className="font-medium">12. Governing Law</h2>
						<p>
							These Terms shall be governed by and construed in accordance with
							the laws of Malaysia.
						</p>
					</section>

					<section>
						<h2 className="font-bold mb-2">Disclaimer</h2>
						<p>
							MauLocum is a digital platform designed to facilitate connections
							between healthcare facilities and locum professionals. MauLocum
							does not act as an employer, recruitment agency, or medical
							authority.
						</p>
						<p className="mt-2">
							The Platform does not guarantee job placement, availability, or
							outcomes. MauLocum does not assess or certify the clinical
							competence, performance, or suitability of any healthcare
							professional.
						</p>
						<p className="mt-2">
							All agreements, payments, and professional engagements are entered
							into directly between users. MauLocum shall not be responsible for
							disputes, losses, or liabilities arising from such arrangements.
						</p>
					</section>

					<section>
						<h2 className="font-medium">Contact</h2>
						<p>For questions regarding these Terms, please contact:</p>
						<p className="mt-1">
							<strong>MauLocum Project Team</strong>
							<br />
							Kulliyyah of Information & Communication Technology
							<br />
							International Islamic University Malaysia (IIUM)
						</p>
						<p>
							Email:{" "}
							<a
								href="mailto:maulocum.project@iium.edu.my"
								className="underline underline-offset-2 hover:text-foreground"
							>
								maulocum.project@iium.edu.my
							</a>
						</p>
					</section>
				</CardContent>
			</Card>
		</div>
	);
}
