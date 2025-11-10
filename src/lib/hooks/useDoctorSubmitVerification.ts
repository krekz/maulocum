import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc-client";

interface VerifyDoctorParams {
	userId: string;
	fullName: string;
	location: string;
	specialty?: string;
	yearsOfExperience: number;
	provisionalId?: string;
	fullId?: string;
	apcNumber: string;
	apcDocumentUrl: string;
}

/**
 * Hook to upload APC document to R2
 */
export function useUploadAPC() {
	return useMutation({
		mutationFn: async ({ file, userId }: { file: File; userId: string }) => {
			const res = await client.api.v2.profile["upload-apc"].$post({
				form: {
					file: new File([file], file.name, { type: file.type }),
					userId,
				},
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || "Failed to upload file");
			}

			return res.json();
		},
	});
}

/**
 * Hook to submit doctor verification
 */
export function useVerifyDoctor() {
	const queryClient = useQueryClient();

	return useMutation<unknown, Error, VerifyDoctorParams>({
		mutationFn: async (data) => {
			const res = await client.api.v2.profile["verify-doctor"].$post({
				json: data,
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
