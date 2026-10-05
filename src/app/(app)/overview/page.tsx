import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardContainer } from "@/features/dashboard/pages/DashboardContainer";
import { dashboardQueries } from "@/features/dashboard/queries";
import type { DashboardTimeRange } from "@/features/dashboard/types";
import { getQueryClient, prefetchWithTimeout } from "@/lib/query-client";
import DashboardLoading from "../loading";

export const metadata: Metadata = {
  title: "概览",
  description: "企业运营数据概览与实时指标监控",
};

export default async function Page(props: {
  searchParams: Promise<{ range?: DashboardTimeRange }>;
}) {
  const search = await props.searchParams;
  const range = search?.range ?? "30d";
  const queryClient = getQueryClient();

  await prefetchWithTimeout(queryClient.prefetchQuery(dashboardQueries.summary(range)));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContainer />
      </Suspense>
    </HydrationBoundary>
  );
}
