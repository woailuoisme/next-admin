import { useQuery } from "@tanstack/react-query";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  type BaseTableSearchParams,
  normalizeSearchParamsWithSchema,
  parseScalarSearchParam,
} from "../core/tableSearchSchema";
import type { DataTableFilterModel, DataTableSortItem, DataTableSortModel, TableStateAdapter } from "../core/types";
import type {
  TablePaginationMode,
  TableRouterPort,
  UseUrlTableStateAdapterOptions,
  UseUrlTableStateAdapterReturn,
} from "./types";

import { DEFAULT_PAGE_SIZE, EMPTY_ARRAY, EMPTY_RECORD } from "../core/constants";

const DISABLED_QUERY_OPTIONS = {
  queryKey: ["__disabled_url_table_adapter__"],
  queryFn: () => null as any,
  enabled: false,
};

export function parseNextSearchParams(
  searchParams: Pick<URLSearchParams, "forEach"> | null | undefined,
): Record<string, string | number | boolean | undefined> {
  if (!searchParams) return EMPTY_RECORD;
  const obj: Record<string, string | number | boolean | undefined> = {};
  let hasEntries = false;
  searchParams.forEach((value, key) => {
    if (
      value === "" ||
      key === "__proto__" ||
      key === "constructor" ||
      key === "prototype" ||
      Object.prototype.hasOwnProperty.call(obj, key)
    ) {
      return;
    }
    hasEntries = true;
    obj[key] = parseScalarSearchParam(value);
  });
  return hasEntries ? obj : EMPTY_RECORD;
}

/**
 * Default Next.js App Router port implementing `TableRouterPort`.
 */
export function useNextAppRouterTablePort(): TableRouterPort {
  const router = useRouter();
  const pathname = usePathname();
  const rawSearchParams = useSearchParams();

  const searchParams = useMemo(() => parseNextSearchParams(rawSearchParams), [rawSearchParams]);

  const navigate = useMemoizedFn<TableRouterPort["navigate"]>((updater, options) => {
    const nextObj = updater(searchParams);
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(nextObj)) {
      if (v !== undefined && v !== null && v !== "") {
        params.set(k, String(v));
      }
    }
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (options?.replace) {
      router.replace(url, { scroll: false });
    } else {
      router.push(url, { scroll: false });
    }
  });

  return useMemo(() => ({ searchParams, navigate }), [searchParams, navigate]);
}

function extractRows<TData, TQueryResponse>(
  staticData: TData[] | undefined,
  hasQuery: boolean,
  queryData: unknown,
  selectRows?: (response: TQueryResponse) => TData[],
): TData[] {
  if (staticData) return staticData;
  if (!hasQuery || !queryData) return EMPTY_ARRAY as unknown as TData[];
  if (selectRows) return selectRows(queryData as TQueryResponse);
  if (Array.isArray(queryData)) return queryData as TData[];
  if (typeof queryData === "object" && queryData !== null) {
    const record = queryData as Record<string, unknown>;
    if ("data" in record && Array.isArray(record.data)) {
      return record.data as TData[];
    }
    if ("items" in record && Array.isArray(record.items)) {
      return record.items as TData[];
    }
  }
  return EMPTY_ARRAY as unknown as TData[];
}

function extractTotal<TData, TQueryResponse>(
  explicitTotal: number | undefined,
  staticData: TData[] | undefined,
  hasQuery: boolean,
  queryData: unknown,
  rowsLength: number,
  selectTotal?: (response: TQueryResponse) => number,
): number {
  if (explicitTotal !== undefined) return explicitTotal;
  if (staticData) return staticData.length;
  if (!hasQuery || !queryData) return rowsLength;
  if (selectTotal) return selectTotal(queryData as TQueryResponse);
  if (typeof queryData === "object" && queryData !== null) {
    const record = queryData as Record<string, unknown>;
    if (
      "meta" in record &&
      typeof record.meta === "object" &&
      record.meta !== null &&
      "total" in record.meta &&
      typeof (record.meta as Record<string, unknown>).total === "number"
    ) {
      return (record.meta as { total: number }).total;
    }
    if ("total" in record && typeof record.total === "number") {
      return record.total;
    }
  }
  return rowsLength;
}

/**
 * Router-agnostic URL adapter hook that operates against any `TableRouterPort`.
 * Ideal for unit testing pagination, sorting, and search without mocking `next/navigation`.
 */
export function useUrlTableStateAdapterWithPort<
  TData extends object = Record<string, any>,
  TSearch extends BaseTableSearchParams = BaseTableSearchParams,
  TQueryResponse = any,
>(
  options: Omit<UseUrlTableStateAdapterOptions<TData, TSearch, TQueryResponse>, "router"> & {
    router: TableRouterPort;
  },
): UseUrlTableStateAdapterReturn<TData, TSearch, TQueryResponse> {
  const {
    search: propSearch,
    searchSchema,
    router,
    queryOptions,
    selectRows,
    selectTotal,
    data: staticData,
    loading: explicitLoading,
    total: explicitTotal,
    searchDebounceMs = 0,
    paginationMode: explicitPaginationMode,
  } = options;

  // Merge explicit defined overrides over URL params so passing `search={{}}` never masks URL state
  const search = useMemo(() => {
    if (!propSearch) return router.searchParams as TSearch;
    const merged: Record<string, unknown> = { ...router.searchParams };
    let changed = false;
    for (const [k, v] of Object.entries(propSearch)) {
      if (v !== undefined && merged[k] !== v) {
        merged[k] = v;
        changed = true;
      }
    }
    return (changed ? merged : router.searchParams) as TSearch;
  }, [propSearch, router.searchParams]);

  const currentPage = Number(search.page ?? 1) || 1;
  const currentPageSize = Number(search.pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE;
  const currentSearch = typeof search.search === "string" ? search.search : "";
  const currentSortBy = typeof search.sortBy === "string" ? search.sortBy : undefined;
  const currentSortOrder = search.sortOrder === "asc" || search.sortOrder === "desc" ? search.sortOrder : undefined;

  const applySearchUpdate = useMemoizedFn((query: string) => {
    const trimmed = query.trim();
    router.navigate(
      (prev) => ({
        ...prev,
        search: trimmed ? trimmed : undefined,
        page: undefined,
      }),
      { replace: true },
    );
  });

  const { run: debouncedSearchUpdate } = useDebounceFn(applySearchUpdate, {
    wait: Math.max(0, searchDebounceMs),
  });

  const handleSearchChange = useMemoizedFn((val: string) => {
    if (searchDebounceMs > 0) {
      debouncedSearchUpdate(val);
    } else {
      applySearchUpdate(val);
    }
  });

  const handlePageChange = useMemoizedFn((newPage: number) => {
    router.navigate((prev) => ({
      ...prev,
      page: newPage <= 1 ? undefined : newPage,
    }));
  });

  const handlePageSizeChange = useMemoizedFn((newPageSize: number) => {
    router.navigate((prev) => ({
      ...prev,
      pageSize: newPageSize === DEFAULT_PAGE_SIZE ? undefined : newPageSize,
      page: undefined,
    }));
  });

  const handleSortChange = useMemoizedFn((field: string, direction: "asc" | "desc" | null) => {
    router.navigate((prev) => {
      if (!direction) {
        const { sortBy: _b, sortOrder: _o, page: _p, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        sortBy: field,
        sortOrder: direction,
        page: undefined,
      };
    });
  });

  const [filterItems, setFilterItems] = useState<DataTableFilterModel["items"]>(
    EMPTY_ARRAY as unknown as DataTableFilterModel["items"],
  );

  const handleFilterModelChange = useMemoizedFn((nextModel: DataTableFilterModel) => {
    setFilterItems(nextModel.items ?? (EMPTY_ARRAY as unknown as DataTableFilterModel["items"]));
    const nextSearch = (nextModel.quickFilterValues ?? EMPTY_ARRAY).join(" ").trim();
    if (nextSearch !== currentSearch) {
      applySearchUpdate(nextSearch);
    } else if (search.page !== undefined) {
      router.navigate((prev) => ({ ...prev, page: undefined }), { replace: true });
    }
  });

  const filterModel = useMemo<DataTableFilterModel>(() => {
    return {
      items: filterItems,
      quickFilterValues: currentSearch ? [currentSearch] : (EMPTY_ARRAY as unknown as string[]),
    };
  }, [filterItems, currentSearch]);

  const sortModel = useMemo<DataTableSortModel>(() => {
    if (!currentSortBy) return EMPTY_ARRAY as unknown as DataTableSortModel;
    return [
      {
        field: currentSortBy,
        sort: currentSortOrder === "asc" ? "asc" : "desc",
      } as DataTableSortItem,
    ];
  }, [currentSortBy, currentSortOrder]);

  const querySearch = useMemo(
    () => (searchSchema ? normalizeSearchParamsWithSchema(search, searchSchema) : search),
    [search, searchSchema],
  );

  const resolvedQueryOptions = useMemo(() => {
    if (!queryOptions) return null;
    return typeof queryOptions === "function" ? queryOptions(querySearch) : queryOptions;
  }, [queryOptions, querySearch]);

  const query = useQuery(resolvedQueryOptions ?? DISABLED_QUERY_OPTIONS);
  const isLoading = explicitLoading ?? (resolvedQueryOptions ? query.isLoading : false);

  const rows = useMemo(
    () => extractRows(staticData, Boolean(resolvedQueryOptions), query.data, selectRows),
    [staticData, resolvedQueryOptions, query.data, selectRows],
  );

  const total = useMemo(
    () => extractTotal(explicitTotal, staticData, Boolean(resolvedQueryOptions), query.data, rows.length, selectTotal),
    [explicitTotal, staticData, resolvedQueryOptions, query.data, rows.length, selectTotal],
  );

  const paginationMode: TablePaginationMode = explicitPaginationMode ?? (resolvedQueryOptions ? "server" : "client");

  const state = useMemo<TableStateAdapter<TData>>(
    () => ({
      data: rows,
      total,
      loading: isLoading,
      paginationMode,
      page: currentPage,
      pageSize: currentPageSize,
      sortModel,
      filterModel,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
      onSortChange: handleSortChange,
      onFilterModelChange: handleFilterModelChange,
      onSearchChange: handleSearchChange,
    }),
    [
      rows,
      total,
      isLoading,
      paginationMode,
      currentPage,
      currentPageSize,
      sortModel,
      filterModel,
      handlePageChange,
      handlePageSizeChange,
      handleSortChange,
      handleFilterModelChange,
      handleSearchChange,
    ],
  );

  return {
    state,
    rawResponse: query.data as TQueryResponse | undefined,
    rows,
    total,
    isLoading,
    search,
    page: currentPage,
    pageSize: currentPageSize,
    query,
  };
}

/**
 * UrlTableStateAdapter:
 * Implements `TableStateAdapter` over Next.js App Router query parameters and TanStack Query.
 */
export function useUrlTableStateAdapter<
  TData extends object = Record<string, any>,
  TSearch extends BaseTableSearchParams = BaseTableSearchParams,
  TQueryResponse = any,
>(
  options: UseUrlTableStateAdapterOptions<TData, TSearch, TQueryResponse> = {},
): UseUrlTableStateAdapterReturn<TData, TSearch, TQueryResponse> {
  const nextRouter = useNextAppRouterTablePort();
  return useUrlTableStateAdapterWithPort({
    ...options,
    router: options.router ?? nextRouter,
  });
}
