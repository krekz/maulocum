import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc-client";

export function useFacilityVerificationAction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			verificationId: string;
			action: "APPROVE" | "REJECT";
			rejectionReason?: string;
		}) => {
			const response =
				await client.api.v2.admin.facilities.verifications.action.$post({
					json: data,
				});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(
					(error as { error?: string }).error ||
						"Failed to process verification",
				);
			}

			return response.json();
		},
		onSuccess: () => {
			// Invalidate pending verifications to refetch
			queryClient.invalidateQueries({
				queryKey: ["admin", "facilities", "verifications"],
			});
		},
	});
}
