"use client";

import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEditVerificationStore } from "@/lib/store/useEditVerificationStore";

interface RejectionAlertProps {
	rejectionReason?: string | null;
	allowAppeal: boolean;
}

export function RejectionAlert({
	rejectionReason,
	allowAppeal,
}: RejectionAlertProps) {
	const { setIsEditing } = useEditVerificationStore();

	return (
		<Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 p-6">
			<div className="flex items-start gap-4">
				<XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mt-1 shrink-0" />
				<div className="flex-1">
					<h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
						Verification Rejected
					</h3>
					<p className="text-sm text-red-700 dark:text-red-300 mb-3">
						{rejectionReason ||
							"Your verification was rejected. Please contact support."}
					</p>
					{allowAppeal && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsEditing(true)}
							className="border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900"
						>
							Appeal & Edit Information
						</Button>
					)}
				</div>
			</div>
		</Card>
	);
}
