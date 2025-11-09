import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc-client";

interface UploadFileParams {
	file: File;
	userId: string;
}

interface UploadFileResponse {
	url: string;
	key: string;
}

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
	return useMutation<UploadFileResponse, Error, UploadFileParams>({
		mutationFn: async ({ file, userId }) => {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("userId", userId);

			const res = await fetch("/api/v2/profile/upload-apc", {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.error || "Failed to upload file");
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
				throw new Error(error.error || "Failed to submit verification");
			}

			return res.json();
		},
		onSuccess: () => {
			// Invalidate user profile query to refetch updated data
			queryClient.invalidateQueries({ queryKey: ["user-profile"] });
		},
	});
}
