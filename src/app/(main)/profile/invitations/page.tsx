import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendApi } from "@/lib/rpc";
import { InvitationAcceptance } from "./_components/invitation-acceptance";

interface PageProps {
	searchParams: Promise<{ token?: string }>;
}

async function InvitationsPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const token = params.token;

	if (!token) {
		redirect("/profile");
	}

	const cookieStore = await cookies();
	const response = await backendApi.api.v2.profile["staff-invitations"][
		":token"
	].$get(
		{
			param: { token },
		},
		{
			headers: {
				cookie: cookieStore.toString(),
			},
		},
	);

	if (!response.ok) {
		const error = await response.json();
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center space-y-4 max-w-md">
					<div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
						<svg
							className="w-8 h-8 text-destructive"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</div>
					<h1 className="text-2xl font-bold">Invalid Invitation</h1>
					<p className="text-muted-foreground">{error.message}</p>
				</div>
			</div>
		);
	}

	const result = await response.json();
	if (!result || !result.data) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="text-center space-y-4 max-w-md">
					<div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
						<svg
							className="w-8 h-8 text-destructive"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</div>
					<h1 className="text-2xl font-bold">Invalid Invitation</h1>
					<p className="text-muted-foreground">Invitation data not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container max-w-2xl py-8">
			<InvitationAcceptance invitation={result.data} token={token} />
		</div>
	);
}

export default InvitationsPage;
