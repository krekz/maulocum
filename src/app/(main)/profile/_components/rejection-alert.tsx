"use client";

import { XCircle } from "lucide-react";
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
		<div className="p-4 bg-red-50 rounded-xl border border-red-100">
			<div className="flex items-start gap-3">
				<div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
					<XCircle className="w-4 h-4 text-red-600" />
				</div>
				<div className="flex-1 min-w-0">
					<h3 className="font-medium text-red-900 text-sm">
						Verification Rejected
					</h3>
					<p className="text-xs text-red-700 mt-0.5">
						{rejectionReason ||
							"Your verification was rejected. Please contact support."}
					</p>
					{allowAppeal && (
						<button
							type="button"
							onClick={() => setIsEditing(true)}
							className="mt-2 px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
						>
							Appeal & Edit
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
