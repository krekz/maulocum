type Endpoints = "/otp" | "/job";

export const sendWhatsappNotifications = async <T = unknown>(
	endpoint: Endpoints,
	body: {
		phoneNumber: string;
		message: string;
		metadata?: T;
	},
) => {
	try {
		const res = await fetch(
			`${process.env.WHATSAPP_NOTIFICATIONS_API_URL}/api/whatsapp${endpoint}`,
			{
				method: "POST",
				body: JSON.stringify({
					phoneNumber: body.phoneNumber,
					message: body.message,
					metadata: {
						...body.metadata,
					},
				}),
				headers: {
					"Content-Type": "application/json",
					"x-api-key": `${process.env.WHATSAPP_NOTIFICATIONS_API_KEY}`,
				},
			},
		);

		const data = await res.json();

		if (!res.ok) {
			switch (res.status) {
				case 422: {
					console.error("Notifications format failed", data.message);
					throw new Error(data);
				}
				case 401: {
					console.error("Notifications Unauthorized", data.message);
					throw new Error(data);
				}
				default: {
					console.error("Notifications Unknown Error", data.message);
					throw new Error(data);
				}
			}
		}
		console.log(data.message);
	} catch (error) {
		console.error(error);
	}
};
