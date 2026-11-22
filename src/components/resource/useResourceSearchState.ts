"use client";

import { useMemoizedFn } from "ahooks";
import { parseAsBoolean, parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useState } from "react";
import type { z } from "zod";

import { DEFAULT_PAGE_SIZE, EMPTY_ARRAY } from "@/components/data-table/core/constants";
import {
  type BaseTableSearchParams,
  normalizeSearchParamsWithSchema,
  parseScalarSearchParam,
} from "@/components/data-table/core/tableSearchSchema";
import type { DataTableFilterItem, DataTableFilterModel, DataTableSortModel } from "@/components/data-table/core/types";

const BASE_TABLE_KEYS = new Set(["page", "pageSize", "search", "sortBy", "sortOrder"]);

function extractSchemaExtraKeys(searchSchema?: z.ZodType<any>, excludedKeys?: Set<string>): string[] {
  if (!searchSchema || typeof searchSchema !== "object") return [];
  const shape = (searchSchema as { shape?: Record<string, unknown> }).shape;
  if (!shape || typeof shape !== "object") return [];
  return Object.keys(shape).filter((key) => !BASE_TABLE_KEYS.has(key) && !excludedKeys?.has(key));
}

export interface UseResourceSearchStateOptions<TFilters extends BaseTableSearchParams> {
  search?: Partial<TFilters> & Record<string, unknown>;
  searchSchema?: z.ZodType<TFilters>;
  modalParamKeys: { createKey: string; editKey: string; viewKey: string };
}

/**
 * URL 查询参数 (`nuqs`)、Schema 额外筛选字段与 DataTable 排序/过滤双向映射状态管理。
 */
export function useResourceSearchState<TFilters extends BaseTableSearchParams>({
  search: propSearch,
  searchSchema,
  modalParamKeys,
}: UseResourceSearchStateOptions<TFilters>) {
  const { createKey, editKey, viewKey } = modalParamKeys;

  const extraFilterKeys = extractSchemaExtraKeys(searchSchema, new Set([createKey, editKey, viewKey]));

  const parsers: Record<string, any> = {
    page: parseAsInteger,
    pageSize: parseAsInteger,
    search: parseAsString,
    sortBy: parseAsString,
    sortOrder: parseAsStringLiteral(["asc", "desc"] as const),
    [createKey]: parseAsBoolean,
    [editKey]: parseAsString,
    [viewKey]: parseAsString,
  };
  for (const key of extraFilterKeys) {
    parsers[key] = parseAsString;
  }

  const [urlState, setUrlState] = useQueryStates(parsers, {
    history: "replace",
    shallow: true,
    scroll: false,
  });

  const [localFilterItems, setLocalFilterItems] = useState<DataTableFilterItem[]>([]);

  const rawMergedSearch = (() => {
    const base: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(urlState)) {
      if (k === createKey || k === editKey || k === viewKey) continue;
      if (v !== null && v !== undefined && v !== "") {
        base[k] = typeof v === "string" ? parseScalarSearchParam(v) : v;
      }
    }
    if (propSearch) {
      for (const [k, v] of Object.entries(propSearch)) {
        if (v !== undefined) base[k] = v;
      }
    }
    return normalizeSearchParamsWithSchema<TFilters>(base, searchSchema);
  })();

  const page = typeof rawMergedSearch.page === "number" && rawMergedSearch.page >= 1 ? rawMergedSearch.page : 1;
  const pageSize =
    typeof rawMergedSearch.pageSize === "number" && rawMergedSearch.pageSize >= 1
      ? rawMergedSearch.pageSize
      : DEFAULT_PAGE_SIZE;

  const sortModel: DataTableSortModel =
    rawMergedSearch.sortBy && (rawMergedSearch.sortOrder === "asc" || rawMergedSearch.sortOrder === "desc")
      ? [{ field: rawMergedSearch.sortBy, sort: rawMergedSearch.sortOrder }]
      : (EMPTY_ARRAY as unknown as DataTableSortModel);

  const filterModel: DataTableFilterModel = (() => {
    const quickFilterValues =
      typeof rawMergedSearch.search === "string" && rawMergedSearch.search.trim()
        ? rawMergedSearch.search.trim().split(/\s+/)
        : [];

    const urlFilterItems: DataTableFilterItem[] = [];
    for (const key of extraFilterKeys) {
      const val = (rawMergedSearch as Record<string, unknown>)[key];
      if (val !== undefined && val !== "" && val !== "all") {
        urlFilterItems.push({ id: `url-${key}`, field: key, operator: "equals", value: val });
      }
    }

    const mergedItems = [...urlFilterItems];
    for (const item of localFilterItems) {
      if (!mergedItems.some((u) => u.field === item.field)) mergedItems.push(item);
    }

    return { items: mergedItems, quickFilterValues };
  })();

  const onPageChange = useMemoizedFn((nextPage: number) => {
    void setUrlState({ page: nextPage <= 1 ? null : nextPage });
  });

  const onPageSizeChange = useMemoizedFn((nextPageSize: number) => {
    void setUrlState({ pageSize: nextPageSize === DEFAULT_PAGE_SIZE ? null : nextPageSize, page: null });
  });

  const onSortChange = useMemoizedFn((field: string, direction: "asc" | "desc" | null) => {
    void setUrlState({ sortBy: direction ? field : null, sortOrder: direction ?? null, page: null });
  });

  const onSortModelChange = useMemoizedFn((nextModel: DataTableSortModel) => {
    const primary = nextModel[0];
    void setUrlState({ sortBy: primary?.field ?? null, sortOrder: primary?.sort ?? null, page: null });
  });

  const onSearchChange = useMemoizedFn((val: string) => {
    void setUrlState({ search: val.trim() || null, page: null });
  });

  const onFilterModelChange = useMemoizedFn((nextModel: DataTableFilterModel) => {
    const patch: Record<string, unknown> = {
      page: null,
      search: nextModel.quickFilterValues?.length ? nextModel.quickFilterValues.join(" ") : null,
    };
    for (const key of extraFilterKeys) patch[key] = null;

    const extraLocal: DataTableFilterItem[] = [];
    for (const item of nextModel.items) {
      if (
        extraFilterKeys.includes(item.field) &&
        item.operator === "equals" &&
        item.value != null &&
        item.value !== ""
      ) {
        patch[item.field] = String(item.value);
      } else {
        extraLocal.push(item);
      }
    }

    setLocalFilterItems(extraLocal);
    void setUrlState(patch);
  });

  return {
    urlState,
    setUrlState,
    search: rawMergedSearch,
    page,
    pageSize,
    sortModel,
    filterModel,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onSortModelChange,
    onSearchChange,
    onFilterModelChange,
  };
}
