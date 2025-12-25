"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-xl font-semibold">
						Privacy Policy
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						Effective Date: {new Date().toLocaleDateString()}
					</p>
				</CardHeader>

				<CardContent className="space-y-6 text-sm leading-relaxed">
					<section>
						<p>
							MauLocum (“we”, “our”, or “the Platform”) is committed to
							protecting your personal data and respecting your privacy. This
							Privacy Policy explains how we collect, use, store, and protect
							your information when you use our web-based locum hiring platform.
						</p>
					</section>

					<section>
						<h2 className="font-medium">1. Information We Collect</h2>
						<ul className="list-disc pl-5 space-y-1">
							<li>
								Personal information such as name, email, and phone number
							</li>
							<li>
								User role (locum professional, healthcare provider, admin)
							</li>
							<li>Professional credentials (e.g. APC, certificates)</li>
							<li>
								System data such as IP address, browser type, and activity logs
							</li>
						</ul>
					</section>

					<section>
						<h2 className="font-medium">2. Purpose of Data Collection</h2>
						<ul className="list-disc pl-5 space-y-1">
							<li>Account registration and authentication</li>
							<li>Verification of healthcare professionals</li>
							<li>Locum job posting, browsing, and applications</li>
							<li>Platform communication and notifications</li>
							<li>System security, analytics, and improvements</li>
						</ul>
					</section>

					<section>
						<h2 className="font-medium">3. PDPA Compliance</h2>
						<p>
							MauLocum complies with the Personal Data Protection Act 2010
							(PDPA) of Malaysia. Personal data is processed only with user
							consent, for contractual necessity, or to comply with legal
							obligations.
						</p>
					</section>

					<section>
						<h2 className="font-medium">4. Data Sharing</h2>
						<p>
							Your data is only shared with verified users (e.g. clinics viewing
							applicants), system administrators, or trusted service providers
							under strict confidentiality. We do not sell or trade user data.
						</p>
					</section>

					<section>
						<h2 className="font-medium">5. Data Security</h2>
						<p>
							We implement security measures including encryption, secure
							authentication, role-based access control, and administrative
							moderation to protect user data.
						</p>
					</section>

					<section>
						<h2 className="font-medium">6. Data Retention</h2>
						<p>
							Personal data is retained only for as long as necessary to provide
							platform services, comply with regulations, and support audit or
							dispute resolution.
						</p>
					</section>

					<section>
						<h2 className="font-medium">7. User Rights</h2>
						<ul className="list-disc pl-5 space-y-1">
							<li>Access and update personal information</li>
							<li>Request data deletion (subject to legal obligations)</li>
							<li>Withdraw consent</li>
							<li>Submit privacy-related complaints</li>
						</ul>
					</section>

					<section>
						<h2 className="font-medium">8. Cookies</h2>
						<p>
							MauLocum uses cookies to maintain sessions, improve usability, and
							analyze traffic. Disabling cookies may affect certain features.
						</p>
					</section>

					<section>
						<h2 className="font-medium">9. Policy Updates</h2>
						<p>
							This Privacy Policy may be updated periodically. Continued use of
							the platform constitutes acceptance of the updated policy.
						</p>
					</section>

					<section>
						<h2 className="font-medium">10. Contact</h2>
						<p>For privacy-related inquiries, please contact:</p>
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
