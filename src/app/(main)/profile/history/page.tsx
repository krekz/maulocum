import { cookies } from "next/headers";
import Link from "next/link";
import { backendApi } from "@/lib/rpc";
import ReviewsDialog from "./reviews-dialog";

async function HistoryPage() {
	const cookie = await cookies();
	const response = await backendApi.api.v2.doctors.applications.$get(
		undefined,
		{
			headers: {
				cookie: cookie.toString(),
			},
		},
	);
	if (!response.ok) {
		switch (response.status) {
			case 400:
			case 401:
			case 403:
				return (
					<div className="min-h-[50vh] flex flex-col items-center justify-center rounded-xl border border-dashed border-red-300/60 bg-red-50/60 px-6 py-10 text-center shadow-sm">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
							<span className="text-2xl">⚕️</span>
						</div>
						<h2 className="text-xl font-semibold tracking-tight text-red-900">
							Doctor Registration Required
						</h2>
						<p className="mt-2 max-w-md text-sm text-red-800/80">
							You need an approved doctor profile before you can view your
							application history. Complete your registration to continue.
						</p>
						<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
							<Link
								href="/profile"
								className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-red-50 shadow-sm transition-colors hover:bg-red-700"
							>
								Register / Verify as Doctor
							</Link>
							<button
								type="button"
								className="inline-flex items-center rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
							>
								Learn More
							</button>
						</div>
						<p className="mt-4 text-xs text-red-800/70">
							Once your doctor profile is approved, you&apos;ll be able to view
							and manage all your locum applications here.
						</p>
					</div>
				);
			case 404:
				return (
					<div className="min-h-[50vh] flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 px-6 py-10 text-center shadow-sm">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<span className="text-2xl">🩺</span>
						</div>
						<h2 className="text-xl font-semibold tracking-tight">
							No Applications Found
						</h2>
						<p className="mt-2 max-w-md text-sm text-muted-foreground">
							We couldn&apos;t find any locum applications associated with your
							account. Once you start applying for locum jobs, your history will
							appear here for easy reference and compliance tracking.
						</p>
						<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
							<Link
								href="/jobs"
								className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
							>
								Browse Locum Jobs
							</Link>
							<button
								type="button"
								className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
							>
								Retry
							</button>
						</div>
						<p className="mt-4 text-xs text-muted-foreground/80">
							If you believe this is an error, please contact support with your
							account details for further assistance.
						</p>
					</div>
				);
			default:
				return <div>Something went wrong</div>;
		}
	}

	const applications = await response.json();
	if (!applications.data || applications.data.length === 0) {
		return <div>No applications found</div>;
	}
	const getStatusBadgeColor = (status: string) => {
		switch (status) {
			case "completed":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<>
			{/* Applied Locums List */}
			<div className="grid gap-4">
				{applications.data.map((locum) => (
					<div
						key={locum.id}
						className="border rounded-lg p-4 bg-card shadow-sm hover:shadow-md transition-shadow"
					>
						{/* Header */}
						<div className="flex justify-between items-start">
							<div>
								<h2 className="text-xl font-semibold">{locum.job.title}</h2>
								<p className="text-muted-foreground">
									{locum.job.facility.name}
								</p>
							</div>
							<span
								className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
									locum.status,
								)}`}
							>
								{locum.status.charAt(0).toUpperCase() + locum.status.slice(1)}
							</span>
						</div>

						{/* Details */}
						{/* <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
							<div>
								<p className="text-sm text-muted-foreground">Specialty</p>
								<p className="font-medium">{locum.job.specialist}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Date</p>
								<p className="font-medium">{locum.job.date}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Time</p>
								<p className="font-medium">{locum.time}</p>
							</div>
						</div> */}

						{/* Footer */}
						<div className="mt-4 flex justify-between items-center">
							{/* <p className="font-semibold text-primary">{locum.rate}</p> */}
							<div className="flex gap-2">
								<Link
									href={`/jobs/${locum.id}`}
									className="px-4 py-2 bg-accent rounded-md hover:bg-accent/80 transition-colors"
								>
									View Details
								</Link>
								<ReviewsDialog
									facilityId="123"
									facilityName="KL City Medical Center"
								/>
							</div>
						</div>
					</div>
				))}
			</div>
		</>
	);
}

export default HistoryPage;
