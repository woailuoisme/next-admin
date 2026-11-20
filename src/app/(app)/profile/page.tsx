import { Suspense } from "react";

import DashboardLoading from "@/app/(app)/loading";
import { ProfilePage } from "@/features/auth/pages/ProfilePage";

export default function Page() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <ProfilePage />
    </Suspense>
  );
}
