import type { UndefinedInitialDataOptions, useQuery } from "@tanstack/react-query";
import type { z } from "zod";

import type { BaseTableSearchParams } from "../core/tableSearchSchema";
import type { DataTableFilterModel, DataTableSortModel, TableStateAdapter } from "../core/types";

export type TablePaginationMode = "client" | "server";

/**
 * Pluggable router port decoupling URL state adapters from a specific router implementation.
 * Defaults to Next.js App Router (`useNextAppRouterTablePort`), or can be swapped for an in-memory port in tests.
 */
export interface TableRouterPort {
  searchParams: Record<string, string | number | boolean | undefined>;
  navigate: (
    updater: (prev: Record<string, unknown>) => Record<string, unknown>,
    options?: { replace?: boolean },
  ) => void;
}

export interface UseUrlTableStateAdapterOptions<
  TData extends object = Record<string, any>,
  TSearch extends BaseTableSearchParams = BaseTableSearchParams,
  TQueryResponse = any,
> {
  /** Partial or SSR-seeded search overrides merged over active URL search parameters (undefined keys preserve URL state) */
  search?: Partial<TSearch>;
  /** Optional Zod schema applied before passing search filters to queryOptions (keeps SSR & CSR queryKeys aligned) */
  searchSchema?: z.ZodType<TSearch>;
  /** Pluggable router port (defaults to Next.js App Router) */
  router?: TableRouterPort;
  queryOptions?:
    | UndefinedInitialDataOptions<TQueryResponse, any, any, any>
    | ((search: TSearch) => UndefinedInitialDataOptions<TQueryResponse, any, any, any>);
  /** Custom data extractor if API response is not { data, meta } / { items, total } / array */
  selectRows?: (response: TQueryResponse) => TData[];
  /** Custom total count extractor from API response */
  selectTotal?: (response: TQueryResponse) => number;
  /** Static data fallback when not querying via TanStack Query */
  data?: TData[];
  /** Explicit loading override */
  loading?: boolean;
  /** Explicit total count override */
  total?: number;
  /**
   * Optional adapter-level debounce delay in ms (defaults to 0 because DataTableToolbar's useQuickFilter
   * already debounces user input by 250ms, preventing double-debouncing latency).
   */
  searchDebounceMs?: number;
  /** Explicit pagination mode override */
  paginationMode?: TablePaginationMode;
}

export interface UseUrlTableStateAdapterReturn<
  TData extends object = Record<string, any>,
  TSearch extends BaseTableSearchParams = BaseTableSearchParams,
  TQueryResponse = any,
> {
  /** Unified TableStateAdapter ready to pass directly as `<DataTable state={state} />` */
  state: TableStateAdapter<TData>;
  rawResponse: TQueryResponse | undefined;
  rows: TData[];
  total: number;
  isLoading: boolean;
  search: TSearch;
  page: number;
  pageSize: number;
  query: ReturnType<typeof useQuery>;
}

export interface UseClientTableStateAdapterOptions<TData = any> {
  data?: TData[];
  loading?: boolean;
  total?: number;
  initialPage?: number;
  initialPageSize?: number;
  initialSortModel?: DataTableSortModel;
  initialFilterModel?: DataTableFilterModel;
}
