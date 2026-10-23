import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import DashboardLoading from "@/app/(app)/loading";
import { UsersPage } from "@/features/users/pages/UsersPage";
import { customerQueries } from "@/features/users/queries";
import type { CustomerSearchParams } from "@/features/users/types";
import { getQueryClient, prefetchWithTimeout } from "@/lib/queryClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("users");
  return { title: t("page_title"), description: t("page_description") };
}

export default async function Page(props: { searchParams: Promise<CustomerSearchParams> }) {
  const search = await props.searchParams;
  const queryClient = getQueryClient();

  // Non-blocking prefetch with graceful offline / build-time fallback
  await prefetchWithTimeout(queryClient.prefetchQuery(customerQueries.list(search)));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DashboardLoading />}>
        <UsersPage search={search} />
      </Suspense>
    </HydrationBoundary>
  );
}
