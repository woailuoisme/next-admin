"use client";

import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";

import { EMPTY_ARRAY } from "@/components/data-table/core/constants";
import type { BaseTableSearchParams } from "@/components/data-table/core/tableSearchSchema";
import type { TableStateAdapter } from "@/components/data-table/core/types";
import type { ModalKeyMapping, ResourceDefinition } from "@/lib/resource/types";

import { type ResourceModalController, useResourceModalState } from "./useResourceModalState";
import { useResourceSearchState } from "./useResourceSearchState";

export type { ResourceModalController };

const DISABLED_QUERY_OPTIONS = {
  queryKey: ["__disabled_resource_query__"],
  queryFn: () => null as never,
  enabled: false,
};

function extractRows<TData>(queryData: unknown): TData[] {
  if (!queryData) return EMPTY_ARRAY as unknown as TData[];
  if (Array.isArray(queryData)) return queryData as TData[];
  if (typeof queryData === "object" && queryData !== null) {
    const record = queryData as Record<string, unknown>;
    if ("data" in record && Array.isArray(record.data)) return record.data as TData[];
    if ("items" in record && Array.isArray(record.items)) return record.items as TData[];
  }
  return EMPTY_ARRAY as unknown as TData[];
}

function extractTotal(queryData: unknown, rowsLength: number): number {
  if (!queryData) return rowsLength;
  if (typeof queryData === "object" && queryData !== null) {
    const record = queryData as Record<string, unknown>;
    if (
      "meta" in record &&
      typeof record.meta === "object" &&
      record.meta !== null &&
      "total" in (record.meta as Record<string, unknown>) &&
      typeof (record.meta as { total: unknown }).total === "number"
    ) {
      return (record.meta as { total: number }).total;
    }
    if ("total" in record && typeof record.total === "number") return record.total;
  }
  return rowsLength;
}

export interface UseResourceControllerOptions<
  TItem extends { id: string | number },
  TFilters extends BaseTableSearchParams = BaseTableSearchParams,
  TListResponse = { items: TItem[]; total: number },
> {
  resource?: ResourceDefinition<TItem, any, TFilters, TListResponse, any>;
  search?: Partial<TFilters> & Record<string, unknown>;
  searchSchema?: z.ZodType<TFilters>;
  paginationMode?: "server" | "client";
  modalKeys?: ModalKeyMapping;
  syncModalWithUrl?: boolean;
  data?: TItem[];
  loading?: boolean;
  total?: number;
  onOpenCreate?: () => void;
  onOpenEdit?: (id: string) => void;
  onOpenView?: (id: string) => void;
}

/**
 * Refine v5 + nuqs 统一资源控制器：
 * 单一钩子组合 URL 查询同步（`useResourceSearchState`）、列表查询（TanStack Query）与弹窗状态机（`useResourceModalState`）。
 */
export function useResourceController<
  TItem extends { id: string | number },
  TFilters extends BaseTableSearchParams = BaseTableSearchParams,
  TListResponse = { items: TItem[]; total: number },
>({
  resource,
  search: propSearch,
  searchSchema: propSearchSchema,
  paginationMode: propPaginationMode,
  modalKeys: propModalKeys,
  syncModalWithUrl: propSyncModalWithUrl,
  data: staticData,
  loading: explicitLoading,
  total: explicitTotal,
  onOpenCreate,
  onOpenEdit,
  onOpenView,
}: UseResourceControllerOptions<TItem, TFilters, TListResponse>) {
  const effectiveSchema = propSearchSchema ?? resource?.searchSchema;
  const paginationMode = propPaginationMode ?? resource?.paginationMode ?? "server";
  const syncModalWithUrl = propSyncModalWithUrl ?? resource?.syncModalWithUrl ?? false;

  const modalParamKeys = {
    createKey: propModalKeys?.createKey ?? resource?.modalKeys?.createKey ?? "create",
    editKey: propModalKeys?.editKey ?? resource?.modalKeys?.editKey ?? "editId",
    viewKey: propModalKeys?.viewKey ?? resource?.modalKeys?.viewKey ?? "viewId",
  };

  const searchState = useResourceSearchState({ search: propSearch, searchSchema: effectiveSchema, modalParamKeys });

  const queryOptions = resource ? resource.queries.list(searchState.search) : DISABLED_QUERY_OPTIONS;
  const query = useQuery(queryOptions as any);

  const rows = staticData ?? extractRows<TItem>(query.data);
  const total =
    explicitTotal ??
    (staticData
      ? staticData.length
      : paginationMode === "client"
        ? rows.length
        : extractTotal(query.data, rows.length));
  const isLoading = explicitLoading ?? (resource ? query.isLoading : false);

  const tableState: TableStateAdapter<TItem> = {
    data: rows,
    total,
    loading: isLoading,
    paginationMode,
    page: searchState.page,
    pageSize: searchState.pageSize,
    sortModel: searchState.sortModel,
    filterModel: searchState.filterModel,
    onPageChange: searchState.onPageChange,
    onPageSizeChange: searchState.onPageSizeChange,
    onSortChange: searchState.onSortChange,
    onSortModelChange: searchState.onSortModelChange,
    onFilterModelChange: searchState.onFilterModelChange,
    onSearchChange: searchState.onSearchChange,
  };

  const modal = useResourceModalState({
    rows,
    syncModalWithUrl,
    modalParamKeys,
    urlState: searchState.urlState,
    setUrlState: searchState.setUrlState,
    onOpenCreate,
    onOpenEdit,
    onOpenView,
  });

  return {
    query,
    rows,
    total,
    rawResponse: query.data as TListResponse | undefined,
    isLoading,
    search: searchState.search,
    tableState,
    modal,
  };
}
