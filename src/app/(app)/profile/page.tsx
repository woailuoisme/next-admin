import { Suspense } from "react";

import { ProfileSkeleton } from "@/features/auth/components/profile/ProfileSkeleton";
import { ProfilePage } from "@/features/auth/pages/ProfilePage";

export default function Page() {
	return (
		<Suspense fallback={<ProfileSkeleton />}>
			<ProfilePage />
		</Suspense>
	);
}
