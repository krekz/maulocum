import { Building2, Calendar, Star } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { backendApi } from "@/lib/rpc";

async function DoctorsReviewsHistoryPage() {
	const cookie = await cookies();
	const response = await backendApi.api.v2.doctors.jobs.reviews.$get(
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
					<div className="min-h-[50vh] flex flex-col items-center justify-center rounded-xl px-6 py-10 text-center shadow-sm">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
							<span className="text-2xl">⚕️</span>
						</div>
						<h2 className="text-xl font-semibold tracking-tight text-red-900">
							Doctor Registration Required
						</h2>
						<p className="mt-2 max-w-md text-sm text-red-800/80">
							You need an approved doctor profile before you can view your
							reviews. Complete your registration to continue.
						</p>
						<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
							<Link
								href="/profile"
								className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-red-50 shadow-sm transition-colors hover:bg-red-700"
							>
								Verify as Doctor
							</Link>
						</div>
					</div>
				);

			case 404:
				return (
					<div className="min-h-[50vh] flex flex-col items-center justify-center rounded-xl px-6 py-10 text-center shadow-sm">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<Star className="h-6 w-6 text-muted-foreground" />
						</div>
						<h2 className="text-xl font-semibold tracking-tight">
							No Reviews Found
						</h2>
						<p className="mt-2 max-w-md text-sm text-muted-foreground">
							You haven&apos;t written any reviews yet. After completing a job,
							you can share your experience to help other doctors find great
							facilities.
						</p>
						<div className="mt-6">
							<Link
								href="/jobs"
								className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
							>
								Browse Available Jobs
							</Link>
						</div>
					</div>
				);
			default:
				return <div>Something went wrong</div>;
		}
	}

	const reviews = await response.json();
	if (!reviews.data || reviews.data.length === 0) {
		return (
			<div className="min-h-[50vh] flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 px-6 py-10 text-center shadow-sm">
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<Star className="h-6 w-6 text-muted-foreground" />
				</div>
				<h2 className="text-xl font-semibold tracking-tight">No Reviews Yet</h2>
				<p className="mt-2 max-w-md text-sm text-muted-foreground">
					You haven&apos;t submitted any facility reviews yet. Complete a job
					and share your experience to help other doctors.
				</p>
				<div className="mt-6">
					<Link
						href="/profile/history"
						className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
					>
						View Job History
					</Link>
				</div>
			</div>
		);
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-MY", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	const renderStars = (rating: number) => {
		return (
			<div className="flex gap-0.5">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						className={`h-4 w-4 ${
							star <= rating
								? "fill-yellow-400 text-yellow-400"
								: "fill-transparent text-slate-300"
						}`}
					/>
				))}
			</div>
		);
	};

	return (
		<div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
			{/* Header */}
			<div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
				<h3 className="font-semibold text-slate-900 text-sm">My Reviews</h3>
				<div className="text-xs text-muted-foreground">
					{reviews.data.length} review{reviews.data.length !== 1 ? "s" : ""}
				</div>
			</div>

			{/* Reviews List */}
			<div className="divide-y divide-slate-50">
				{reviews.data.map((review) => (
					<div
						key={review.id}
						className="p-4 hover:bg-slate-50/50 transition-colors"
					>
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1 min-w-0">
								{/* Facility Name */}
								<div className="flex items-center gap-2 mb-1">
									<Building2 className="h-4 w-4 text-slate-400" />
									<h4 className="font-medium text-slate-900 text-sm truncate">
										{review.facility.name}
									</h4>
								</div>

								{/* Job Title */}
								<p className="text-xs text-slate-500 mb-2">
									{review.jobApplication.job.title || "Untitled Job"}
								</p>

								{/* Rating */}
								<div className="flex items-center gap-2 mb-2">
									{renderStars(review.rating)}
									<span className="text-xs font-medium text-slate-600">
										{review.rating}/5
									</span>
								</div>

								{/* Comment */}
								{review.comment && (
									<p className="text-sm text-slate-600 line-clamp-2">
										{review.comment}
									</p>
								)}

								{/* Meta Info */}
								<div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
									<span className="flex items-center gap-1">
										<Calendar className="w-3 h-3" />
										Reviewed on {formatDate(review.createdAt)}
									</span>
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-2 shrink-0">
								<Link
									href={`/jobs/${review.jobApplication.job.id}`}
									className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
								>
									View Job
								</Link>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default DoctorsReviewsHistoryPage;
