import { Badge } from "@/components/ui/badge";

export interface FaqItem {
	question: string;
	answer: string;
}

export interface Faq5Props {
	badge?: string;
	heading?: string;
	description?: string;
	faqs?: FaqItem[];
}
const defaultFaqs: FaqItem[] = [
	{
		question: "What is MauLocum?",
		answer:
			"MauLocum is a platform that connects healthcare professionals with locum tenens opportunities in Malaysia, allowing medical practitioners to find temporary positions that match their skills and availability.",
	},
	{
		question: "How do I apply for locum jobs on MauLocum?",
		answer:
			"To apply for locum jobs on MauLocum, create an account, complete your profile with your medical credentials and availability, then browse and apply for positions that match your qualifications and preferences.",
	},
	{
		question: "What types of healthcare facilities use MauLocum?",
		answer:
			"MauLocum partners with a variety of healthcare facilities including hospitals, clinics, medical centers, and specialty practices across Malaysia that are seeking qualified medical professionals for temporary positions.",
	},
	{
		question: "What are the benefits of working as a locum through MauLocum?",
		answer:
			"Working as a locum through MauLocum offers flexibility in scheduling, competitive compensation, diverse clinical experiences, and the opportunity to expand your professional network while maintaining work-life balance.",
	},
];

export const Faqs = ({
	badge = "FAQ",
	heading = "Common Questions & Answers",
	description = "Find out all the essential details about our platform and how it can serve your needs.",
	faqs = defaultFaqs,
}: Faq5Props) => {
	return (
		<section className="pt-10 pb-16">
			<div className="container px-8">
				<div className="text-center">
					<Badge className="text-xs font-medium">{badge}</Badge>
					<h1 className="mt-4 text-4xl font-semibold">{heading}</h1>
					<p className="mt-6 font-medium text-muted-foreground">
						{description}
					</p>
				</div>
				<div className="mx-auto mt-8 max-w-screen-sm w-full">
					{faqs.map((faq, index) => (
						<div key={index} className="mb-6 flex gap-3 items-start w-full">
							<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-secondary font-mono text-xs text-primary-foreground">
								{index + 1}
							</span>
							<div>
								<div className="mb-2 flex items-center justify-between">
									<h3 className="font-medium">{faq.question}</h3>
								</div>
								<p className="text-sm text-muted-foreground">{faq.answer}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};
