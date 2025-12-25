import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { authClient } from "./auth-client";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const handleLogout = async (url: string = "/login") => {
	await authClient.signOut({
		fetchOptions: {
			onSuccess: () => {
				window.location.href = url;
			},
		},
	});
};
