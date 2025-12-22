import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import type { DoctorVerificationSchema } from "../schemas/doctor-verification.schema";

export function useUpdateDoctorVerification() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: {
			verificationId: string;
			fullName: string;
			location: string;
			specialty?: string;
			yearsOfExperience: number;
			provisionalId?: string;
			fullId?: string;
			apcNumber: string;
			apcDocument?: File;
		}) => {
			const { verificationId, apcDocument, ...rest } = input;
			const form = {
				location: rest.location,
				fullName: rest.fullName,
				apcNumber: rest.apcNumber,
				yearsOfExperience: String(rest.yearsOfExperience),
				specialty: rest.specialty,
				provisionalId: rest.provisionalId,
				fullId: rest.fullId,
				apcDocument: apcDocument ?? "",
			};

			const res = await client.api.v2.profile.verification[
				":verificationId"
			].$patch({
				param: { verificationId },
				form,
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to update verification");
			}

			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user-profile"] });
		},
	});
}

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
