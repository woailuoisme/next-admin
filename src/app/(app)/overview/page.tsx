import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { DashboardContainer } from "@/features/dashboard/pages/DashboardContainer";
import { dashboardQueries } from "@/features/dashboard/queries";
import type { DashboardTimeRange } from "@/features/dashboard/types";
import { getQueryClient, prefetchWithTimeout } from "@/lib/queryClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return { title: t("overview_title"), description: t("overview_description") };
}

export default async function Page(props: { searchParams: Promise<{ range?: DashboardTimeRange }> }) {
  const { range = "30d" } = await props.searchParams;
  const queryClient = getQueryClient();

  await prefetchWithTimeout(queryClient.prefetchQuery(dashboardQueries.summary(range)));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContainer />
    </HydrationBoundary>
  );
}
