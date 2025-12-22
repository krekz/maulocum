import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import type { DoctorVerificationSchema } from "../schemas/doctor-verification.schema";

/**
 * Hook to submit doctor verification
 */
export function useVerifyDoctor() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: DoctorVerificationSchema) => {
			console.log(data);
			const res = await client.api.v2.profile["verify-doctor"].$post({
				form: {
					location: data.location,
					fullName: data.fullName,
					yearsOfExperience: data.yearsOfExperience.toString(),
					specialty: data.specialty,
					provisionalId: data.provisionalId,
					fullId: data.fullId,
					apcNumber: data.apcNumber,
					apcDocument: data.apcDocument,
				},
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to submit verification");
			}

			return res.json();
		},
		onSuccess: () => {
			// Invalidate user profile query to refetch updated data
			queryClient.invalidateQueries({ queryKey: ["user-profile"] });
		},
	});
}
