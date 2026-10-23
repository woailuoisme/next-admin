import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import DashboardLoading from "@/app/(app)/loading";
import { CategoriesPage } from "@/features/categories/pages/CategoriesPage";
import { categoryQueries } from "@/features/categories/queries";
import type { CategorySearchParams } from "@/features/categories/types";
import { getQueryClient, prefetchWithTimeout } from "@/lib/queryClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categories");
  return { title: t("page_title"), description: t("page_description") };
}

export default async function Page(props: { searchParams: Promise<CategorySearchParams> }) {
  const queryClient = getQueryClient();

  // 列表查询不依赖 searchParams，两者并行；预取超时后降级为骨架流式渲染
  const [search] = await Promise.all([
    props.searchParams,
    prefetchWithTimeout(queryClient.prefetchQuery(categoryQueries.list())),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DashboardLoading />}>
        <CategoriesPage search={search} />
      </Suspense>
    </HydrationBoundary>
  );
}
