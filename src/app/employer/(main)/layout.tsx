import { NavbarEmployer } from "@/app/employer/_components/employer-navbar";

export default function MainEmployerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<NavbarEmployer />
			{children}
		</>
	);
}
