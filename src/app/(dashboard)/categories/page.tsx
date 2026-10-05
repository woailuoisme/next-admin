import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";

import { CategoriesPage } from "@/features/categories/pages/CategoriesPage";
import { categoryQueries } from "@/features/categories/queries";
import type { CategorySearchParams } from "@/features/categories/types";
import { getQueryClient } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "分类管理",
  description: "查看与配置多级商品分类体系",
};

export default async function Page(props: { searchParams: Promise<CategorySearchParams> }) {
  const search = await props.searchParams;
  const queryClient = getQueryClient();

  // Non-blocking prefetch with graceful offline / build-time fallback
  try {
    await queryClient.query(categoryQueries.list());
  } catch {
    // Graceful fallback to client-side fetching if backend is offline during build
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoriesPage search={search} />
    </HydrationBoundary>
  );
}
