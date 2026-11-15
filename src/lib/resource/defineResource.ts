import { queryOptions } from "@tanstack/react-query";

import type { ApiResponse } from "@/types";
import { apiClient, createIdempotencyKey, toSearchParams } from "@/lib/apiClient";

import type {
  DefineResourceConfig,
  ResourceApi,
  ResourceCustomAction,
  ResourceDefinition,
  ResourceKeys,
} from "./types";

const DEFAULT_STALE_TIME = 30 * 1000;
const EMPTY_FILTERS = Object.freeze({});

/**
 * defineResource:
 * 类型安全的资源契约工厂（融合 Refine DataProvider 契约与 TanStack queryOptions）。
 * 自动生成 Query Keys、TanStack queryOptions 与标准 REST CRUD 客户端，
 * 彻底消除各 feature 重复手写 api.ts / queries.ts 的胶水代码。
 */
export function defineResource<
  TItem extends { id: string | number },
  TInput = Record<string, unknown>,
  TFilters = Record<string, unknown>,
  TListResponse = { items: TItem[]; total: number },
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
>(
  config: DefineResourceConfig<TItem, TInput, TFilters, TListResponse, TActions>,
): ResourceDefinition<TItem, TInput, TFilters, TListResponse, TActions> {
  const {
    name,
    entityName,
    basePath,
    endpoint,
    i18nNamespace,
    i18nKeys,
    schema,
    searchSchema,
    presentation = "dialog",
    modalKeys,
    syncModalWithUrl = false,
    paginationMode = "server",
    listUnwrap = "raw",
    transformFilters,
    invalidates = [],
    getTitle,
    defaultValues,
    toFormValues,
    api: customApi,
    actions,
    staleTime = DEFAULT_STALE_TIME,
  } = config;

  const keys: ResourceKeys<TFilters> = {
    all: [name] as const,
    lists: () => [name, "list"] as const,
    list: (filters: TFilters = EMPTY_FILTERS as TFilters) => [name, "list", filters] as const,
    details: () => [name, "detail"] as const,
    detail: (id: string) => [name, "detail", id] as const,
  };

  const defaultApi: ResourceApi<TItem, TInput, TFilters, TListResponse> = {
    list: async (filters: TFilters) => {
      const normalized = transformFilters ? transformFilters(filters) : filters;
      const query = toSearchParams(normalized);
      if (listUnwrap === "data") {
        const res = await apiClient
          .get(endpoint, query ? { searchParams: query } : undefined)
          .json<ApiResponse<TListResponse>>();
        return res.data;
      }
      return apiClient.get(endpoint, query ? { searchParams: query } : undefined).json<TListResponse>();
    },
    detail: async (id: string) => {
      const encodedId = encodeURIComponent(String(id));
      const res = await apiClient.get(`${endpoint}/${encodedId}`).json<ApiResponse<TItem>>();
      return res.data;
    },
    create: async (input: TInput, idempotencyKey?: string) => {
      const res = await apiClient
        .post(endpoint, {
          json: input,
          headers: { "Idempotency-Key": idempotencyKey ?? createIdempotencyKey() },
        })
        .json<ApiResponse<TItem>>();
      return res.data;
    },
    update: async (id: string, input: Partial<TInput>) => {
      const encodedId = encodeURIComponent(String(id));
      const res = await apiClient.patch(`${endpoint}/${encodedId}`, { json: input }).json<ApiResponse<TItem>>();
      return res.data;
    },
    delete: async (id: string) => {
      await apiClient.delete(`${endpoint}/${encodeURIComponent(String(id))}`);
    },
    batchDelete: async (items: TItem[]) => {
      await Promise.all(items.map((item) => apiClient.delete(`${endpoint}/${encodeURIComponent(String(item.id))}`)));
    },
  };

  const api: ResourceApi<TItem, TInput, TFilters, TListResponse> = {
    ...defaultApi,
    ...customApi,
  };

  const resolvedI18nKeys = {
    title: i18nKeys?.title ?? "page_title",
    description: i18nKeys?.description ?? "page_description",
    heading: i18nKeys?.heading ?? i18nKeys?.title ?? "page_title",
    headingDescription: i18nKeys?.headingDescription ?? i18nKeys?.description ?? "page_description",
    createAction: i18nKeys?.createAction ?? "create_action",
    formCreateTitle: i18nKeys?.formCreateTitle ?? "form_create_title",
    formEditTitle: i18nKeys?.formEditTitle ?? "form_edit_title",
    formCreateDesc: i18nKeys?.formCreateDesc ?? "form_create_desc",
    formEditDesc: i18nKeys?.formEditDesc ?? "form_edit_desc",
    viewTitle: i18nKeys?.viewTitle ?? "detail_sheet_title",
  };

  const queries = {
    all: () => keys.all,
    list: (filters: TFilters = EMPTY_FILTERS as TFilters) =>
      queryOptions<TListResponse>({
        queryKey: keys.list(filters),
        queryFn: () => api.list(filters),
        staleTime,
      }),
    detail: (id: string) =>
      queryOptions<TItem>({
        queryKey: keys.detail(id),
        queryFn: () => api.detail(id),
        enabled: Boolean(id),
        staleTime,
      }),
  };

  return {
    name,
    entityName,
    basePath,
    endpoint,
    i18nNamespace,
    i18nKeys: resolvedI18nKeys,
    schema,
    searchSchema,
    presentation,
    modalKeys,
    syncModalWithUrl,
    paginationMode,
    invalidates,
    getTitle,
    defaultValues,
    toFormValues,
    keys,
    api,
    actions: (actions ?? {}) as TActions,
    queries,
  };
}
