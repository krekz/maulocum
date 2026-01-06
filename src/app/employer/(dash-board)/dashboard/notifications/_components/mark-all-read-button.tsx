"use client";

import { CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { backendApi } from "@/lib/rpc";

export function MarkAllReadButton() {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const handleMarkAllRead = async () => {
		try {
			const response =
				await backendApi.api.v2.facilities.notifications["read-all"].$patch();

			if (!response.ok) {
				throw new Error("Failed to mark notifications as read");
			}

			toast.success("All notifications marked as read");
			startTransition(() => {
				router.refresh();
			});
		} catch (error) {
			console.error(error);
			toast.error("Failed to mark notifications as read");
		}
	};

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleMarkAllRead}
			disabled={isPending}
		>
			<CheckCheck className="mr-2 h-4 w-4" />
			Mark all as read
		</Button>
	);
}
