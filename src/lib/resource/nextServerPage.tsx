import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { type ComponentType, type ReactNode, Suspense } from "react";
import type { z } from "zod";

import "@/lib/serverAuthHeaders";
import DashboardLoading from "@/app/(app)/loading";
import {
  normalizeSearchParamsWithSchema,
  parseScalarSearchParam,
} from "@/components/data-table/core/tableSearchSchema";
import { getQueryClient, prefetchWithTimeout } from "@/lib/queryClient";

import type { ResourceDefinition } from "./types";

/**
 * 将 Next.js Server Component 接收的原始 searchParams（全字符串）归一化为与客户端
 * `parseNextSearchParams` 一致的类型（数字/布尔/可选 schema 解析），保证 SSR 与 CSR 水合 queryKey 一致。
 */
export function normalizeServerSearchParams<TFilters>(
  raw: Record<string, string | string[] | undefined>,
  searchSchema?: z.ZodType<TFilters>,
): TFilters {
  const normalized: Record<string, string | number | boolean> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
    const scalar = Array.isArray(val) ? val[0] : val;
    if (scalar !== undefined && scalar !== "") {
      normalized[key] = parseScalarSearchParam(scalar);
    }
  }
  return normalizeSearchParamsWithSchema(normalized, searchSchema);
}

export function createResourceMetadata<TItem extends { id: string | number }, TFilters>(
  resource: ResourceDefinition<TItem, any, TFilters, any, any>,
) {
  return async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations(resource.i18nNamespace as never);
    const titleKey = resource.i18nKeys.title as never;
    const descKey = resource.i18nKeys.description as never;
    return {
      title: t(titleKey),
      description: t(descKey),
    };
  };
}

export interface CreateResourceListPageOptions<TItem extends { id: string | number }, TFilters> {
  resource: ResourceDefinition<TItem, any, TFilters, any, any>;
  Component: ComponentType<{ search?: TFilters }>;
  fallback?: ReactNode;
}

/**
 * Next.js App Router 列表页工厂：
 * 统一处理 searchParams 归一化、SSR 非阻塞预取（prefetchWithTimeout）、HydrationBoundary 与 Suspense。
 */
export function createResourceListPage<TItem extends { id: string | number }, TFilters>({
  resource,
  Component,
  fallback = <DashboardLoading />,
}: CreateResourceListPageOptions<TItem, TFilters>) {
  return async function ResourceListServerPage(props: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }) {
    const rawSearch = await props.searchParams;
    const search = normalizeServerSearchParams(rawSearch, resource.searchSchema);
    const queryClient = getQueryClient();

    await prefetchWithTimeout(queryClient.prefetchQuery(resource.queries.list(search)));

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={fallback}>
          <Component search={search} />
        </Suspense>
      </HydrationBoundary>
    );
  };
}

export type ResourceSubPageMode = "create" | "edit" | "view";

export interface ResourceSubPageRenderProps {
  mode: ResourceSubPageMode;
  id?: string;
}

export interface CreateResourceActionPageOptions<TItem extends { id: string | number }> {
  resource: ResourceDefinition<TItem, any, any, any, any>;
  Component: ComponentType<ResourceSubPageRenderProps>;
  fallback?: ReactNode;
}

/**
 * Next.js App Router 详情/创建/编辑子路由工厂（对应 [...action]/page.tsx）：
 * - /<resource>/create      -> mode: "create"
 * - /<resource>/<id>         -> mode: "view"（自动服务端预取详情）
 * - /<resource>/<id>/edit    -> mode: "edit"（自动服务端预取详情）
 */
export function createResourceActionPage<TItem extends { id: string | number }>({
  resource,
  Component,
  fallback = <DashboardLoading />,
}: CreateResourceActionPageOptions<TItem>) {
  return async function ResourceActionServerPage(props: { params: Promise<{ action: string[] }> }) {
    const { action } = await props.params;

    if (action.length > 2) {
      notFound();
    }

    const queryClient = getQueryClient();
    let mode: ResourceSubPageMode;
    let id: string | undefined;

    if (action.length === 1 && action[0] === "create") {
      mode = "create";
    } else if (action.length === 1 && action[0]?.trim()) {
      mode = "view";
      id = action[0];
    } else if (action.length === 2 && action[1] === "edit" && action[0]?.trim() && action[0] !== "create") {
      mode = "edit";
      id = action[0];
    } else {
      notFound();
    }

    if (id) {
      await prefetchWithTimeout(queryClient.prefetchQuery(resource.queries.detail(id)));
    }

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={fallback}>
          <Component mode={mode} id={id} />
        </Suspense>
      </HydrationBoundary>
    );
  };
}
