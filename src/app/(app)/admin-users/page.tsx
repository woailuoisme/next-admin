import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { AdminUsersPage } from "@/features/admin-users/pages/AdminUsersPage";
import { adminUserQueries } from "@/features/admin-users/queries";
import type { AdminUserSearchParams } from "@/features/admin-users/types";
import { getQueryClient, prefetchWithTimeout } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "管理员管理",
  description: "系统运营管理员权限分配与账号管理",
};

export default async function Page(props: { searchParams: Promise<AdminUserSearchParams> }) {
  const search = await props.searchParams;
  const queryClient = getQueryClient();

  // Non-blocking prefetch with graceful offline / build-time fallback
  await prefetchWithTimeout(queryClient.prefetchQuery(adminUserQueries.list()));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminUsersPage search={search} />
    </HydrationBoundary>
  );
}
