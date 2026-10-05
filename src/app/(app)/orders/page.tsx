import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { OrdersPage } from "@/features/orders/pages/OrdersPage";
import { orderQueries } from "@/features/orders/queries";
import type { OrderSearchParams } from "@/features/orders/types";
import { getQueryClient, prefetchWithTimeout } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "订单管理",
  description: "订单履约、查询与状态流转管理",
};

export default async function Page(props: {
  searchParams: Promise<OrderSearchParams & { orderId?: string }>;
}) {
  const search = await props.searchParams;
  const queryClient = getQueryClient();

  // Non-blocking prefetch with graceful offline / build-time fallback
  await prefetchWithTimeout(queryClient.prefetchQuery(orderQueries.list(search)));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersPage search={search} />
    </HydrationBoundary>
  );
}
