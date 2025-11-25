import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseDoctorVerificationsParams {
	status?: "PENDING" | "APPROVED" | "REJECTED";
	limit?: number;
	offset?: number;
}

export function useDoctorVerifications(params?: UseDoctorVerificationsParams) {
	return useQuery({
		queryKey: ["admin", "doctors", "verifications", params],
		queryFn: async () => {
			const searchParams: Record<string, string> = {};

			if (params?.status) {
				searchParams.status = params.status;
			}
			if (params?.limit) {
				searchParams.limit = params.limit.toString();
			}
			if (params?.offset) {
				searchParams.offset = params.offset.toString();
			}

			const res = await client.api.v2.admin.doctors.verifications.$get({
				query: searchParams,
			});

			if (!res.ok) {
				const { message } = await res.json();
				throw new Error(message, {
					cause: res.status,
				});
			}

			return res.json();
		},
		retry: 1,
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
		retry: 1,
	});
}

interface VerificationActionParams {
	verificationId: string;
	action: "APPROVE" | "REJECT";
	rejectionReason?: string;
	allowAppeal?: boolean;
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
			// Invalidate all verifications queries to refetch
			queryClient.invalidateQueries({
				queryKey: ["admin", "doctors", "verifications"],
			});
		},
	});
}
