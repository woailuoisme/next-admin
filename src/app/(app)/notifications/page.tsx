import { Suspense } from "react";

import { NotificationsSkeleton } from "@/features/notifications/components/NotificationsSkeleton";
import { NotificationsPage } from "@/features/notifications/pages/NotificationsPage";

export default function Page() {
	return (
		<Suspense fallback={<NotificationsSkeleton />}>
			<NotificationsPage />
		</Suspense>
	);
}
