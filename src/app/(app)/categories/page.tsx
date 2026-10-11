import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { CategoriesPage } from "@/features/categories/pages/CategoriesPage";
import { categoryQueries } from "@/features/categories/queries";
import type { CategorySearchParams } from "@/features/categories/types";
import { getQueryClient, prefetchWithTimeout } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "分类管理",
  description: "查看与配置多级商品分类体系",
};

export default async function Page(props: { searchParams: Promise<CategorySearchParams> }) {
  const queryClient = getQueryClient();

  // Non-blocking prefetch in parallel with searchParams
  const [search] = await Promise.all([
    props.searchParams,
    prefetchWithTimeout(queryClient.prefetchQuery(categoryQueries.list())),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoriesPage search={search} />
    </HydrationBoundary>
  );
}
