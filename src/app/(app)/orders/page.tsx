import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import DashboardLoading from "@/app/(app)/loading";
import { OrdersPage } from "@/features/orders/pages/OrdersPage";
import { orderQueries } from "@/features/orders/queries";
import type { OrderSearchParams } from "@/features/orders/types";
import { getQueryClient, prefetchWithTimeout } from "@/lib/queryClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orders");
  return { title: t("page_title"), description: t("page_description") };
}

export default async function Page(props: { searchParams: Promise<OrderSearchParams & { orderId?: string }> }) {
  const search = await props.searchParams;
  const queryClient = getQueryClient();

  // Non-blocking prefetch with graceful offline / build-time fallback
  await prefetchWithTimeout(queryClient.prefetchQuery(orderQueries.list(search)));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DashboardLoading />}>
        <OrdersPage search={search} />
      </Suspense>
    </HydrationBoundary>
  );
}
