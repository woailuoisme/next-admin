import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { UsersPage } from "@/features/users/pages/UsersPage";
import { customerQueries } from "@/features/users/queries";
import type { CustomerSearchParams } from "@/features/users/types";
import { getQueryClient } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "用户管理",
  description: "平台注册用户管理、偏好与行为记录",
};

export default async function Page(props: { searchParams: Promise<CustomerSearchParams> }) {
  const search = await props.searchParams;
  const queryClient = getQueryClient();

  // Non-blocking prefetch with graceful offline / build-time fallback
  try {
    await queryClient.query(customerQueries.list(search));
  } catch {
    // Graceful fallback to client-side fetching if backend is offline during build
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersPage search={search} />
    </HydrationBoundary>
  );
}
