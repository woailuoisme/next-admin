import type { RefObject } from "react";

import type {
  DataTableColDef,
  DataTableFilterModel,
  DataTablePaginationModel,
  DataTablePinnedColumns,
  DataTableRowId,
  DataTableRowSelectionModel,
  DataTableSortModel,
} from "./types";

export interface UseDataTableEngineOptions<TData extends Record<string, any> = Record<string, any>> {
  data: TData[];
  columns: DataTableColDef<TData>[];
  getRowId?: (row: TData) => DataTableRowId;

  // Pagination
  paginationMode?: "client" | "server";
  page?: number;
  pageSize?: number;
  total?: number;
  paginationModel?: DataTablePaginationModel;
  onPaginationModelChange?: (model: DataTablePaginationModel) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  // Sorting
  sortingMode?: "client" | "server";
  sortModel?: DataTableSortModel;
  onSortModelChange?: (model: DataTableSortModel) => void;
  onSortChange?: (field: string, direction: "asc" | "desc" | null) => void;
  hasAdapterSortModelHandler?: boolean;

  // Filtering
  filterMode?: "client" | "server";
  filterModel?: DataTableFilterModel;
  onFilterModelChange?: (model: DataTableFilterModel) => void;
  onSearchChange?: (val: string) => void;
  hasAdapterFilterModelHandler?: boolean;

  // Selection
  checkboxSelection?: boolean;
  rowSelectionModel?: DataTableRowSelectionModel;
  onRowSelectionModelChange?: (selection: DataTableRowSelectionModel, selectedRows: TData[]) => void;
  onSelectedRowsChange?: (selectedRows: TData[]) => void;
  isRowSelectable?: (row: TData) => boolean;

  // Expansion
  expandedRowIds?: DataTableRowId[];
  defaultExpandedRowIds?: DataTableRowId[];
  onExpandedRowsChange?: (expandedRowIds: DataTableRowId[]) => void;
  singleExpand?: boolean;
  hasExpandColumn?: boolean;

  // Visibility, Pinning & Resizing
  columnVisibilityModel?: Record<string, boolean>;
  onColumnVisibilityModelChange?: (model: Record<string, boolean>) => void;
  pinnedColumns?: DataTablePinnedColumns;
  storageKey?: string;
  containerRef?: RefObject<HTMLDivElement | null>;
}
