import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc-client";

interface UseVerifiedDoctorsParams {
	search?: string;
	limit?: number;
	offset?: number;
}

export function useVerifiedDoctors(params?: UseVerifiedDoctorsParams) {
	return useQuery({
		queryKey: ["admin", "doctors", "verified", params],
		queryFn: async () => {
			const searchParams: Record<string, string> = {};

			if (params?.search) {
				searchParams.search = params.search;
			}
			if (params?.limit) {
				searchParams.limit = params.limit.toString();
			}
			if (params?.offset) {
				searchParams.offset = params.offset.toString();
			}

			const res = await client.api.v2.admin.doctors.verifications.verified.$get(
				{
					query: searchParams,
				},
			);

			if (!res.ok) {
				const { message } = await res.json();
				throw new Error(message, {
					cause: res.status,
				});
			}

			return res.json();
		},
	});
}

export function usePendingVerifications() {
	return useQuery({
		queryKey: ["admin", "doctors", "verifications", "pending"],
		queryFn: async () => {
			const res =
				await client.api.v2.admin.doctors.verifications.pending.$get();

			if (!res.ok) {
				const { message } = await res.json();
				throw new Error(message, {
					cause: res.status,
				});
			}

			return res.json();
		},
	});
}

interface VerificationActionParams {
	verificationId: string;
	action: "APPROVE" | "REJECT";
	rejectionReason?: string;
}

export function useVerificationAction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: VerificationActionParams) => {
			const res = await client.api.v2.admin.doctors.verifications.action.$post({
				json: params,
			});

			if (!res.ok) {
				const { message } = await res.json();
				throw new Error(message || "Failed to process verification");
			}

			return res.json();
		},
		onSuccess: () => {
			// Invalidate pending verifications to refetch
			queryClient.invalidateQueries({
				queryKey: ["admin", "doctors", "verifications", "pending"],
			});
			// Also invalidate verified doctors list
			queryClient.invalidateQueries({
				queryKey: ["admin", "doctors", "verified"],
			});
		},
	});
}
