import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface AboutItem {
	title: string;
	content: string;
}

const aboutItems: AboutItem[] = [
	{
		title: "What is MauLocum?",
		content:
			"MauLocum is a web-based locum hiring platform designed to connect verified healthcare professionals with clinics and healthcare facilities across Malaysia. The platform aims to simplify temporary staffing by centralizing job listings, applications, and verification processes.",
	},
	{
		title: "Why MauLocum Was Developed",
		content:
			"The platform was developed to address inefficiencies in Malaysia’s locum hiring process, which often relies on informal communication channels. MauLocum introduces a structured, transparent, and secure approach to locum recruitment.",
	},
	{
		title: "Who MauLocum Is For",
		content:
			"MauLocum serves healthcare professionals such as doctors and allied health workers, as well as clinics and healthcare facilities seeking qualified locum staff for short-term placements.",
	},
	{
		title: "How MauLocum Works",
		content:
			"Healthcare providers post locum job opportunities while verified professionals browse, apply, and manage applications through a single platform. Administrative verification ensures professional credibility and platform integrity.",
	},
	{
		title: "Platform Values & Responsibility",
		content:
			"MauLocum emphasizes data protection, user trust, and ethical system design. The platform is developed with awareness of healthcare sensitivity and compliance with Malaysia’s Personal Data Protection Act (PDPA).",
	},
];

export const AboutMauLocum = () => {
	return (
		<section className="pt-10 pb-16">
			<div className="container px-8">
				<div className="text-center min-h-[72px]">
					<Badge className="text-xs font-medium">About</Badge>
					<h1 className="mt-4 text-4xl font-semibold">About MauLocum</h1>
					<p className="mt-6 font-medium text-muted-foreground">
						Learn more about the purpose, users, and principles behind the
						MauLocum platform.
					</p>
				</div>

				<div className="mx-auto mt-8 max-w-screen-sm w-full">
					{aboutItems.map((item, index) => (
						<div key={index} className="mb-6 flex gap-3 items-start w-full">
							<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-secondary font-mono text-xs text-primary-foreground">
								{index + 1}
							</span>
							<div>
								<h3 className="mb-2 font-medium">{item.title}</h3>
								<p className="text-sm text-muted-foreground">{item.content}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="mx-auto max-w-5xl px-4 py-12">
				<div className="mb-10 text-center">
					<h2 className="text-3xl font-semibold">Developed By</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						This platform was designed and developed as part of an IIUM Final
						Year Project.
					</p>
				</div>

				<div className="flex flex-col justify-center mx-8 gap-8 sm:flex-row sm:justify-center">
					<Card className="w-full max-w-sm">
						<CardHeader className="flex flex-col items-center pt-6 text-center">
							<div className="w-24 h-24 rounded-full overflow-hidden mb-4 relative bg-muted">
								<Image
									src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVyc29ufGVufDB8fDB8fHww" // use local asset if possible
									alt="Muhammad Khairul Fitri"
									fill
									className="object-cover"
								/>
							</div>

							<CardTitle className="text-lg font-semibold">
								Muhammad Khairul Fitri
							</CardTitle>

							<CardDescription className="text-sm">
								Full-Stack Developer
							</CardDescription>
						</CardHeader>

						<CardContent className="space-y-3 text-sm text-muted-foreground">
							<p className="text-center min-h-[72px]">
								Final Year IT student at IIUM, responsible for full-stack
								development, including frontend interfaces, backend services,
								database design, and system integration for the MauLocum
								platform.
							</p>

							<div className="flex justify-center pt-2">
								<a
									href="https://github.com/krekz"
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm font-medium text-muted-foreground no-underline hover:underline hover:text-foreground visited:no-underline visited:text-muted-foreground focus:no-underline underline-offset-2"
								>
									github.com/krekz
								</a>
							</div>
						</CardContent>
					</Card>

					<Card className="w-full max-w-sm">
						<CardHeader className="flex flex-col items-center pt-6 text-center">
							<div className="w-24 h-24 rounded-full overflow-hidden mb-4 relative bg-muted">
								<Image
									src="https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D"
									alt="Muhammad Luqman bin Zainul Ariffin"
									fill
									className="object-cover"
								/>
							</div>

							<CardTitle className="text-lg font-semibold">
								Muhammad Luqman bin Zainul Ariffin
							</CardTitle>

							<CardDescription className="text-sm">
								Frontend & UI/UX Developer
							</CardDescription>
						</CardHeader>

						<CardContent className="space-y-3 text-sm text-muted-foreground">
							<p className="text-center">
								Final Year IT student at IIUM, responsible for frontend
								architecture, UI consistency, and user experience design for the
								MauLocum platform.
							</p>

							<div className="flex justify-center pt-2">
								<a
									href="https://github.com/chocobread11"
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm font-medium text-muted-foreground no-underline hover:underline hover:text-foreground visited:no-underline visited:text-muted-foreground focus:no-underline underline-offset-2"
								>
									github.com/chocobread11
								</a>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
};
