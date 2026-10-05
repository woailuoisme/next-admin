import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { DashboardContainer } from "@/features/dashboard/pages/DashboardContainer";
import { dashboardQueries } from "@/features/dashboard/queries";
import type { DashboardTimeRange } from "@/features/dashboard/types";
import { getQueryClient } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "仪表盘",
  description: "企业运营数据概览与实时指标监控",
};

export default async function Page(props: {
  searchParams: Promise<{ range?: DashboardTimeRange }>;
}) {
  const search = await props.searchParams;
  const range = search?.range ?? "30d";
  const queryClient = getQueryClient();

  try {
    await queryClient.query(dashboardQueries.summary(range));
  } catch {
    // Graceful fallback to client-side fetching if backend is offline during build
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContainer />
    </HydrationBoundary>
  );
}
