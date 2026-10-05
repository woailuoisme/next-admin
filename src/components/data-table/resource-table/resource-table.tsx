import type { BaseTableSearchParams } from "../core/table-search-schema";
import type { DataTableProps } from "../core/types";

import { DataTable } from "../core/data-table";
import { useResourceTable } from "../hooks/use-resource-table";

export interface ResourceTableProps<
  TData extends Record<string, any> = any,
  TSearch extends BaseTableSearchParams = BaseTableSearchParams,
  TQueryResponse = any,
> extends Omit<
  DataTableProps<TData>,
  | "data"
  | "rows"
  | "loading"
  | "page"
  | "pageSize"
  | "total"
  | "rowCount"
  | "onPageChange"
  | "onPageSizeChange"
  | "onSortChange"
  | "onSortModelChange"
  | "onSearchChange"
> {
  /**
   * Factory function returning TanStack Query options for the active search parameters.
   */
  queryOptions?: any | ((search: TSearch) => any);

  /**
   * Custom data extractor if API response is not { items, total } or an array.
   */
  selectRows?: (response: TQueryResponse) => TData[];

  /**
   * Custom total count extractor from API response.
   */
  selectTotal?: (response: TQueryResponse) => number;

  /**
   * Static data fallback when not using TanStack Query / URL search params.
   */
  data?: TData[];

  /**
   * Explicit loading state override. If omitted, inferred from TanStack Query.
   */
  loading?: boolean;

  /**
   * Explicit total count override. If omitted, inferred from TanStack Query response or static data.
   */
  total?: number;

  /**
   * Debounce delay (in ms) for quick-filter search text. Default is 300ms.
   */
  searchDebounceMs?: number;
}

/**
 * ResourceTable: Deep, URL-driven data table adapter.
 * Integrates Next.js App Router search params, TanStack Query, and ahooks debouncing
 * behind a single declarative interface with zero state leakage to routes.
 */
export function ResourceTable<
  TData extends Record<string, any> = any,
  TSearch extends BaseTableSearchParams = BaseTableSearchParams,
  TQueryResponse = any,
>({
  queryOptions,
  selectRows,
  selectTotal,
  data: staticData,
  columns,
  getRowId = (row: any) => row.id ?? row._id ?? row.key ?? "",
  searchDebounceMs = 300,
  slotProps,
  paginationMode: explicitPaginationMode,
  loading: explicitLoading,
  total: explicitTotal,
  ...dataTableProps
}: ResourceTableProps<TData, TSearch, TQueryResponse>) {
  const { tableProps } = useResourceTable<TData, TSearch, TQueryResponse>({
    queryOptions,
    selectRows,
    selectTotal,
    data: staticData,
    loading: explicitLoading,
    total: explicitTotal,
    searchDebounceMs,
    paginationMode: explicitPaginationMode,
  });

  return (
    <DataTable<TData>
      {...dataTableProps}
      {...tableProps}
      columns={columns}
      getRowId={getRowId}
      filterModel={dataTableProps.filterModel ?? tableProps.filterModel}
      sortModel={dataTableProps.sortModel ?? tableProps.sortModel}
      slotProps={{
        ...slotProps,
        toolbar: {
          quickFilterPlaceholder: "Search records in view...",
          ...slotProps?.toolbar,
        },
      }}
    />
  );
}
