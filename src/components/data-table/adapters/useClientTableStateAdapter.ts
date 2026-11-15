import { useMemoizedFn } from "ahooks";
import { useMemo, useState } from "react";

import type { DataTableFilterModel, DataTableSortModel, TableStateAdapter } from "../core/types";
import type { UseClientTableStateAdapterOptions } from "./types";

import { DEFAULT_PAGE_SIZE, EMPTY_ARRAY } from "../core/constants";

const EMPTY_FILTER_MODEL: DataTableFilterModel = {
  items: EMPTY_ARRAY as unknown as DataTableFilterModel["items"],
  quickFilterValues: EMPTY_ARRAY as unknown as string[],
};

/**
 * ClientTableStateAdapter:
 * Pure in-memory `TableStateAdapter` implementation for client-side pagination, sorting, and filtering,
 * with zero `next/navigation` or TanStack Query dependencies.
 */
export function useClientTableStateAdapter<TData = any>({
  data = EMPTY_ARRAY as unknown as TData[],
  loading = false,
  total,
  initialPage = 1,
  initialPageSize = DEFAULT_PAGE_SIZE,
  initialSortModel = EMPTY_ARRAY as unknown as DataTableSortModel,
  initialFilterModel = EMPTY_FILTER_MODEL,
}: UseClientTableStateAdapterOptions<TData> = {}): TableStateAdapter<TData> {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortModel, setSortModel] = useState<DataTableSortModel>(initialSortModel);
  const [filterModel, setFilterModel] = useState<DataTableFilterModel>(initialFilterModel);

  const onPageChange = useMemoizedFn((nextPage: number) => {
    setPage(nextPage);
  });

  const onPageSizeChange = useMemoizedFn((nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  });

  const onSortChange = useMemoizedFn((field: string, direction: "asc" | "desc" | null) => {
    setSortModel(direction ? [{ field, sort: direction }] : (EMPTY_ARRAY as unknown as DataTableSortModel));
    setPage(1);
  });

  const onSortModelChange = useMemoizedFn((nextModel: DataTableSortModel) => {
    setSortModel(nextModel);
    setPage(1);
  });

  const onFilterModelChange = useMemoizedFn((nextModel: DataTableFilterModel) => {
    setFilterModel(nextModel);
    setPage(1);
  });

  const onSearchChange = useMemoizedFn((val: string) => {
    const tokens = val.trim() ? val.trim().toLowerCase().split(/\s+/) : (EMPTY_ARRAY as unknown as string[]);
    setFilterModel((prev) => ({
      ...prev,
      quickFilterValues: tokens,
    }));
    setPage(1);
  });

  return useMemo<TableStateAdapter<TData>>(
    () => ({
      data,
      total: total ?? data.length,
      loading,
      paginationMode: "client",
      page,
      pageSize,
      sortModel,
      filterModel,
      onPageChange,
      onPageSizeChange,
      onSortChange,
      onSortModelChange,
      onFilterModelChange,
      onSearchChange,
    }),
    [
      data,
      total,
      loading,
      page,
      pageSize,
      sortModel,
      filterModel,
      onPageChange,
      onPageSizeChange,
      onSortChange,
      onSortModelChange,
      onFilterModelChange,
      onSearchChange,
    ],
  );
}
