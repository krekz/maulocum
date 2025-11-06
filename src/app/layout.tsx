import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import ReactQueryProvider from "@/lib/query-provider";

const poppins = Plus_Jakarta_Sans({
	weight: ["400", "500", "600", "700", "800"],
	variable: "--font-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "MauLocum",
	description: "Find locum jobs in Malaysia",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${poppins.variable} font-sans antialiased`}>
				<Toaster />
				<ReactQueryProvider>{children}</ReactQueryProvider>
			</body>
		</html>
	);
}
