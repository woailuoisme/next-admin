import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { ProductsPage } from "@/features/products/pages/ProductsPage";
import { productQueries } from "@/features/products/queries";
import type { ProductSearchParams } from "@/features/products/types";
import { getQueryClient, prefetchWithTimeout } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "商品管理",
  description: "查看、管理与发布系统商品数据",
};

export default async function Page(props: { searchParams: Promise<ProductSearchParams> }) {
  const search = await props.searchParams;
  const queryClient = getQueryClient();

  // Non-blocking prefetch with graceful offline / build-time fallback
  await prefetchWithTimeout(queryClient.prefetchQuery(productQueries.list(search)));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsPage search={search} />
    </HydrationBoundary>
  );
}
