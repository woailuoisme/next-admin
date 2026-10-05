import { type UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import type { BaseTableSearchParams } from "../core/table-search-schema";
import type { DataTableFilterModel, DataTableSortItem, DataTableSortModel } from "../core/types";

import { DEFAULT_PAGE_SIZE } from "../core/constants";

export type DataTablePaginationMode = "client" | "server";

const DISABLED_QUERY_OPTIONS = {
  queryKey: ["__disabled_resource_table__"],
  queryFn: () => null as any,
  enabled: false,
};

const EMPTY_SEARCH = {} as const;

function parseNextSearchParams<TSearch extends Record<string, any>>(
  searchParams: ReturnType<typeof useSearchParams>,
): TSearch {
  const obj: Record<string, any> = {};
  if (!searchParams) return obj as TSearch;
  searchParams.forEach((value, key) => {
    if (value === "true") {
      obj[key] = true;
    } else if (value === "false") {
      obj[key] = false;
    } else if (/^\d+$/.test(value) && value.length < 10 && !value.startsWith("0")) {
      const num = Number(value);
      obj[key] = isNaN(num) ? value : num;
    } else {
      obj[key] = value;
    }
  });
  return obj as TSearch;
}

export interface UseResourceTableOptions<
  TData extends object = Record<string, unknown>,
  TSearch extends BaseTableSearchParams = BaseTableSearchParams,
  TQueryResponse = any,
> {
  /** Direct search params fallback when not using URL search params */
  search?: TSearch;
  queryOptions?:
    | UndefinedInitialDataOptions<TQueryResponse, any, any, any>
    | ((search: TSearch) => UndefinedInitialDataOptions<TQueryResponse, any, any, any>);
  /** Custom data extractor if API response is not { items, total } or array */
  selectRows?: (response: TQueryResponse) => TData[];
  /** Custom total count extractor from API response */
  selectTotal?: (response: TQueryResponse) => number;
  /** Static data fallback when not using TanStack Query */
  data?: TData[];
  /** Explicit loading override */
  loading?: boolean;
  /** Explicit total count override */
  total?: number;
  /** Debounce delay (in ms) for quick-filter search text. Default is 300ms */
  searchDebounceMs?: number;
  /** Explicit pagination mode */
  paginationMode?: DataTablePaginationMode;
}

export interface UseResourceTableReturn<
  TData extends object = Record<string, unknown>,
  TSearch extends BaseTableSearchParams = BaseTableSearchParams,
  TQueryResponse = any,
> {
  /** Raw server query data / response (useful for KPI cards and summary statistics) */
  rawResponse: TQueryResponse | undefined;
  /** Processed rows array */
  rows: TData[];
  /** Total number of records */
  total: number;
  /** Loading state */
  isLoading: boolean;
  /** Current search parameters */
  search: TSearch;
  /** Pagination state */
  page: number;
  pageSize: number;
  /** TanStack Query result object */
  query: ReturnType<typeof useQuery>;
  /** Ready-to-spread props configured for DataTable / ResourceTable */
  tableProps: {
    data: TData[];
    total: number;
    loading: boolean;
    paginationMode: DataTablePaginationMode;
    filterModel: DataTableFilterModel;
    sortModel: DataTableSortModel;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onSortChange: (field: string, direction: "asc" | "desc" | null) => void;
    onSearchChange: (val: string) => void;
  };
}

/**
 * useResourceTable:
 * 工业级双模数据表格协调 Hook。
 * 1. 集中接管 URL 驱动的分页 (page, pageSize)、快速搜索 (search) 及排序 (sortBy, sortOrder)；
 * 2. 自动集成 TanStack Query 服务端请求与 ahooks 搜索防抖；
 * 3. 产生就绪可直接展开的 `tableProps`，同时向外暴露原始 `rawResponse` 与指标，
 *    供页面优雅实现 KPI 卡片计算与表格挂载，大幅消减特性页面样板代码。
 */
export function useResourceTable<
  TData extends object = Record<string, unknown>,
  TSearch extends BaseTableSearchParams = BaseTableSearchParams,
  TQueryResponse = any,
>(
  options: UseResourceTableOptions<TData, TSearch, TQueryResponse> = {},
): UseResourceTableReturn<TData, TSearch, TQueryResponse> {
  const {
    search: propSearch,
    queryOptions,
    selectRows,
    selectTotal,
    data: staticData,
    loading: explicitLoading,
    total: explicitTotal,
    searchDebounceMs = 300,
    paginationMode: explicitPaginationMode,
  } = options;

  // ==================== 1. Routing & Search Params ====================
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const nextParsedSearch = useMemo(
    () => parseNextSearchParams<TSearch>(searchParams),
    [searchParams],
  );

  const search = useMemo(
    () => (propSearch ?? nextParsedSearch ?? EMPTY_SEARCH) as TSearch,
    [propSearch, nextParsedSearch],
  );

  const navigate = useMemoizedFn(
    (opts: { search?: (prev: TSearch) => TSearch | Record<string, any>; replace?: boolean }) => {
      const nextObj = opts.search ? opts.search(search) : search;
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(nextObj)) {
        if (v !== undefined && v !== null && v !== "") {
          params.set(k, String(v));
        }
      }
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (opts.replace) {
        router.replace(url, { scroll: false });
      } else {
        router.push(url, { scroll: false });
      }
    },
  );

  const currentPage = search.page ?? 1;
  const currentPageSize = search.pageSize ?? DEFAULT_PAGE_SIZE;
  const currentSearch = search.search ?? "";
  const currentSortBy = search.sortBy;
  const currentSortOrder = search.sortOrder;

  // Debounced URL Search Updater via ahooks
  const { run: debouncedNavigateSearch } = useDebounceFn(
    (query: string) => {
      const trimmed = query.trim();
      navigate({
        search: (prev: TSearch) => ({
          ...prev,
          search: trimmed ? trimmed : undefined,
          page: 1, // Reset to page 1 on new search query
        }),
      });
    },
    { wait: searchDebounceMs },
  );

  const handleSearchChange = useMemoizedFn((val: string) => {
    debouncedNavigateSearch(val);
  });

  // ==================== 2. Pagination Handlers ====================
  const handlePageChange = useMemoizedFn((newPage: number) => {
    navigate({
      search: (prev: TSearch) => ({
        ...prev,
        page: newPage === 1 ? undefined : newPage,
      }),
    });
  });

  const handlePageSizeChange = useMemoizedFn((newPageSize: number) => {
    navigate({
      search: (prev: TSearch) => ({
        ...prev,
        pageSize: newPageSize === DEFAULT_PAGE_SIZE ? undefined : newPageSize,
        page: undefined, // Reset to first page
      }),
    });
  });

  // ==================== 3. Filtering ====================
  const filterModel = useMemo<DataTableFilterModel>(() => {
    return {
      items: [],
      quickFilterValues: currentSearch ? [currentSearch] : [],
    };
  }, [currentSearch]);

  // ==================== 4. Sorting Handlers ====================
  const sortModel = useMemo<DataTableSortModel>(() => {
    if (!currentSortBy) return [];
    return [
      {
        field: currentSortBy,
        sort: currentSortOrder === "asc" ? "asc" : "desc",
      } as DataTableSortItem,
    ];
  }, [currentSortBy, currentSortOrder]);

  const handleSortChange = useMemoizedFn((field: string, direction: "asc" | "desc" | null) => {
    navigate({
      search: (prev: TSearch) => {
        if (!direction) {
          const { sortBy: _, sortOrder: __, ...rest } = (prev ?? {}) as Record<string, unknown>;
          return rest as TSearch;
        }
        return {
          ...prev,
          sortBy: field,
          sortOrder: direction,
          page: undefined,
        };
      },
    });
  });

  // ==================== 5. Query Data Fetching ====================
  const resolvedQueryOptions = useMemo(() => {
    if (!queryOptions) return null;
    return typeof queryOptions === "function" ? queryOptions(search) : queryOptions;
  }, [queryOptions, search]);

  const query = useQuery(resolvedQueryOptions ?? DISABLED_QUERY_OPTIONS);

  const isLoading = explicitLoading ?? (resolvedQueryOptions ? query.isLoading : false);

  // Extract Rows (Prioritize API.md standard { data: [] } -> legacy { items: [] } -> raw array)
  const rows = useMemo<TData[]>(() => {
    if (staticData) return staticData;
    if (!resolvedQueryOptions || !query.data) return [];
    if (selectRows) return selectRows(query.data as TQueryResponse);
    if (Array.isArray(query.data)) return query.data as TData[];
    if (typeof query.data === "object" && query.data !== null) {
      const record = query.data as Record<string, unknown>;
      // API.md standard collection envelope: { data: T[], meta: ... }
      if ("data" in record && Array.isArray(record.data)) {
        return record.data as TData[];
      }
      // Legacy collection envelope: { items: T[], total: ... }
      if ("items" in record && Array.isArray(record.items)) {
        return record.items as TData[];
      }
    }
    return [];
  }, [staticData, resolvedQueryOptions, query.data, selectRows]);

  // Extract Total Count (Prioritize API.md standard meta.total -> legacy total -> rows.length)
  const total = useMemo<number>(() => {
    if (explicitTotal !== undefined) return explicitTotal;
    if (staticData) return staticData.length;
    if (!resolvedQueryOptions || !query.data) return rows.length;
    if (selectTotal) return selectTotal(query.data as TQueryResponse);
    if (typeof query.data === "object" && query.data !== null) {
      const record = query.data as Record<string, unknown>;
      // API.md standard pagination metadata
      if (
        "meta" in record &&
        typeof record.meta === "object" &&
        record.meta !== null &&
        "total" in record.meta &&
        typeof (record.meta as Record<string, unknown>).total === "number"
      ) {
        return (record.meta as { total: number }).total;
      }
      // Legacy total field
      if ("total" in record && typeof record.total === "number") {
        return record.total;
      }
    }
    return rows.length;
  }, [explicitTotal, staticData, resolvedQueryOptions, query.data, selectTotal, rows.length]);

  const paginationMode: DataTablePaginationMode =
    explicitPaginationMode ?? (resolvedQueryOptions ? "server" : "client");

  const tableProps = useMemo(
    () => ({
      data: rows,
      loading: isLoading,
      total,
      page: currentPage,
      pageSize: currentPageSize,
      paginationMode,
      sortModel,
      filterModel,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
      onSortChange: handleSortChange,
      onSearchChange: handleSearchChange,
    }),
    [
      rows,
      isLoading,
      total,
      currentPage,
      currentPageSize,
      paginationMode,
      sortModel,
      filterModel,
      handlePageChange,
      handlePageSizeChange,
      handleSortChange,
      handleSearchChange,
    ],
  );

  return {
    rawResponse: query.data as TQueryResponse | undefined,
    rows,
    total,
    isLoading,
    search,
    page: currentPage,
    pageSize: currentPageSize,
    query,
    tableProps,
  };
}
