import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ContactPage() {
	return (
		<div className="container mx-auto py-12">
			<h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>
			<div className="grid md:grid-cols-2 gap-8">
				<Card>
					<CardHeader className="flex flex-col items-center pt-6">
						<div className="w-28 h-28 rounded-full overflow-hidden mb-4 relative">
							<Image
								src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVyc29ufGVufDB8fDB8fHww"
								alt="Dr. Jane Smith"
								fill
								className="object-cover"
							/>
						</div>
						<CardTitle>Khairul Fitri</CardTitle>
						<p className="text-sm text-muted-foreground mt-1">
							Lead Software Engineer
						</p>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-3">
							<Mail className="h-5 w-5 text-muted-foreground" />
							<span>khairulfitri@gmail.com</span>
						</div>
						<div className="flex items-center gap-3">
							<Phone className="h-5 w-5 text-muted-foreground" />
							<span>+62 812-3456-7890</span>
						</div>
						<div className="flex items-center gap-3">
							<MapPin className="h-5 w-5 text-muted-foreground" />
							<span>Bandar Lampung, Malaysia </span>
						</div>
						<Button className="w-full mt-4">Send Message</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-col items-center pt-6">
						<div className="w-28 h-28 rounded-full overflow-hidden mb-4 relative">
							<Image
								src="https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D"
								alt="Dr. John Davis"
								fill
								className="object-cover"
							/>
						</div>
						<CardTitle>Luqman Ariffin</CardTitle>
						<p className="text-sm text-muted-foreground mt-1">
							Product Manager
						</p>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-3">
							<Mail className="h-5 w-5 text-muted-foreground" />
							<span>luqmanariffin@gmail.com</span>
						</div>
						<div className="flex items-center gap-3">
							<Phone className="h-5 w-5 text-muted-foreground" />
							<span>+62 812-3456-7890</span>
						</div>
						<div className="flex items-center gap-3">
							<MapPin className="h-5 w-5 text-muted-foreground" />
							<span>Bandar Lampung, Malaysia</span>
						</div>
						<Button className="w-full mt-4">Send Message</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export default ContactPage;
