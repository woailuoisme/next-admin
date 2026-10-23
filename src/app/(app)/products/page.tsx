import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import DashboardLoading from "@/app/(app)/loading";
import { ProductsPage } from "@/features/products/pages/ProductsPage";
import { productQueries } from "@/features/products/queries";
import type { ProductSearchParams } from "@/features/products/types";
import { getQueryClient, prefetchWithTimeout } from "@/lib/queryClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products");
  return { title: t("page_title"), description: t("page_description") };
}

export default async function Page(props: { searchParams: Promise<ProductSearchParams> }) {
  const search = await props.searchParams;
  const queryClient = getQueryClient();

  // Non-blocking prefetch with graceful offline / build-time fallback
  await prefetchWithTimeout(queryClient.prefetchQuery(productQueries.list(search)));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DashboardLoading />}>
        <ProductsPage search={search} />
      </Suspense>
    </HydrationBoundary>
  );
}
