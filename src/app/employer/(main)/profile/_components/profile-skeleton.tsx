import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{/* User Profile Card Skeleton */}
			<div className="col-span-1 md:sticky md:top-20 self-start">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex flex-col items-center">
						<Skeleton className="h-24 w-24 rounded-full mb-4" />
						<Skeleton className="h-6 w-32 mb-2" />
						<Skeleton className="h-5 w-20 mb-4" />
						<div className="w-full p-3 bg-gray-50 rounded-md mb-4">
							<Skeleton className="h-4 w-16 mx-auto mb-2" />
							<Skeleton className="h-5 w-40 mx-auto mb-1" />
							<Skeleton className="h-5 w-20 mx-auto" />
						</div>
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
			</div>

			{/* Main Content Skeleton */}
			<div className="col-span-1 md:col-span-2">
				{/* Clinic Information Skeleton */}
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<div className="flex items-center justify-between mb-4">
						<Skeleton className="h-6 w-40" />
						<Skeleton className="h-8 w-8 rounded" />
					</div>
					<div className="space-y-4">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="flex items-start">
								<Skeleton className="h-5 w-5 mr-2 mt-0.5" />
								<div className="flex-1">
									<Skeleton className="h-4 w-20 mb-1" />
									<Skeleton className="h-5 w-full max-w-xs" />
								</div>
							</div>
						))}
					</div>
				</div>

				{/* About Section Skeleton */}
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<div className="flex items-center justify-between mb-4">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-8 w-8 rounded" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
					</div>
				</div>

				{/* Facilities & Services Skeleton */}
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<div className="flex items-center justify-between mb-4">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-8 w-8 rounded" />
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{[...Array(8)].map((_, i) => (
							<div key={i} className="flex items-center">
								<Skeleton className="h-2 w-2 rounded-full mr-2" />
								<Skeleton className="h-4 w-32" />
							</div>
						))}
					</div>
				</div>

				{/* Contact Information Skeleton */}
				<div className="bg-white rounded-lg shadow p-6">
					<Skeleton className="h-6 w-44 mb-4" />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="flex items-center">
								<Skeleton className="h-12 w-12 rounded-full mr-4" />
								<div className="flex-1">
									<Skeleton className="h-5 w-32 mb-1" />
									<Skeleton className="h-4 w-24 mb-1" />
									<Skeleton className="h-4 w-28" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
