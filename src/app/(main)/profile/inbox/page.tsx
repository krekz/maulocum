import { cookies } from "next/headers";
import { backendApi } from "@/lib/rpc";
import { NotificationList } from "./_components/notification-list";

async function InboxPage() {
	const cookieStore = await cookies();
	const data = await backendApi.api.v2.profile.notifications.$get(
		{
			query: {},
		},
		{
			headers: {
				cookie: cookieStore.toString(),
			},
		},
	);

	const result = await data.json();

	return (
		<div className="">
			{(() => {
				switch (data.status) {
					case 200:
						return (
							<NotificationList
								initialNotifications={result.data?.notifications || []}
								unreadCount={result.data?.unreadCount || 0}
							/>
						);
					case 401:
					case 402:
					case 403:
					case 404:
						return <div>Unauthorized</div>;
				}
			})()}
		</div>
	);
}

export default InboxPage;
