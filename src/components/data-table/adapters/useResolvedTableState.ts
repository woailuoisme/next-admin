import type { TableStateAdapter } from "../core/types";
import type { TablePaginationMode, UseUrlTableStateAdapterOptions } from "./types";

import { useUrlTableStateAdapter } from "./useUrlTableStateAdapter";

export interface UseResolvedTableStateOptions<
  TData extends object = Record<string, any>,
  TSearch extends Record<string, any> = Record<string, any>,
  TQueryResponse = any,
> {
  state?: TableStateAdapter<TData>;
  data?: TData[];
  total?: number;
  loading?: boolean;
  queryOptions?: UseUrlTableStateAdapterOptions<TData, TSearch, TQueryResponse>["queryOptions"];
  paginationMode?: TablePaginationMode;
}

/**
 * Resolves either an externally coordinated `TableStateAdapter` or a local fallback `UrlTableStateAdapter`
 * so feature tables stay free of duplicated adapter wiring boilerplate.
 */
export function useResolvedTableState<
  TData extends object = Record<string, any>,
  TSearch extends Record<string, any> = Record<string, any>,
  TQueryResponse = any,
>({
  state,
  data,
  total,
  loading,
  queryOptions,
  paginationMode,
}: UseResolvedTableStateOptions<TData, TSearch, TQueryResponse>): TableStateAdapter<TData> {
  const fallbackAdapter = useUrlTableStateAdapter<TData, TSearch, TQueryResponse>({
    queryOptions: !state && !data ? queryOptions : undefined,
    data,
    total,
    loading,
    paginationMode,
  });

  return state ?? fallbackAdapter.state;
}
