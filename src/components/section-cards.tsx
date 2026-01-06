import { IconTrendingUp } from "@tabler/icons-react";
import { Briefcase, CheckCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface SectionCardsProps {
	activeJobs: number;
	totalApplicants: number;
	fillRate: number;
}

export function SectionCards({
	activeJobs,
	totalApplicants,
	fillRate,
}: SectionCardsProps) {
	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center gap-2">
						<Briefcase className="size-4" />
						Active Job Listings
					</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{activeJobs}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							Active
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="text-muted-foreground">
						Currently accepting applications
					</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center gap-2">
						<Users className="size-4" />
						Total Applicants
					</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{totalApplicants}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							All time
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="text-muted-foreground">
						Applications received across all jobs
					</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center gap-2">
						<CheckCircle className="size-4" />
						Fill Rate
					</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{fillRate}%
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							Success
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="text-muted-foreground">
						Positions filled successfully
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
