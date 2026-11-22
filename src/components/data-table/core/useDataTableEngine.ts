"use client";

import {
  type ColumnDef,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemoizedFn } from "ahooks";
import { useMemo, useRef, useState } from "react";

import { DEFAULT_PAGE_SIZE, defaultGetRowId, EMPTY_ARRAY, EMPTY_RECORD } from "./constants";
import type { UseDataTableEngineOptions } from "./engineTypes";
import { computePageSelectionSummary, normalizeDataTableColumns, toTanStackSortingState } from "./tableEngineHelpers";
import { buildColumnFiltersState, evaluateQuickFilter, matchesFilterOperator } from "./tableFilterFns";
import type { DataTableFilterItem, DataTablePaginationModel } from "./types";
import { useTableColumnResize } from "./useTableColumnResize";
import { useTableSelectionAndExpansion } from "./useTableSelectionAndExpansion";
import { useTableSortAndFilter } from "./useTableSortAndFilter";
import { isColumnVisible, readCellValue } from "./utils";

export type { UseDataTableEngineOptions };

/**
 * 统一基于 `@tanstack/react-table` v8 构建的数据表格状态引擎：
 * - 作为受控 `"use no memo"` 边界，组合列宽/固定列、排序/筛选、分页与选择/展开状态。
 */
export function useDataTableEngine<TData extends Record<string, any> = Record<string, any>>({
  data: rows,
  columns,
  getRowId = defaultGetRowId<TData>,
  paginationMode = "client",
  page: statePage,
  pageSize: propPageSize,
  total: stateTotal,
  paginationModel: controlledPaginationModel,
  onPaginationModelChange,
  onPageChange,
  onPageSizeChange,
  sortingMode = "client",
  sortModel: controlledSortModel,
  onSortModelChange,
  onSortChange,
  hasAdapterSortModelHandler = false,
  filterMode = "client",
  filterModel: controlledFilterModel,
  onFilterModelChange,
  onSearchChange,
  hasAdapterFilterModelHandler = false,
  checkboxSelection = false,
  rowSelectionModel: controlledSelectionModel,
  onRowSelectionModelChange,
  onSelectedRowsChange,
  isRowSelectable,
  expandedRowIds: controlledExpandedIds,
  defaultExpandedRowIds = EMPTY_ARRAY,
  onExpandedRowsChange,
  singleExpand = false,
  hasExpandColumn = false,
  columnVisibilityModel: controlledVisibility,
  onColumnVisibilityModelChange,
  pinnedColumns = EMPTY_RECORD,
  storageKey,
  containerRef,
}: UseDataTableEngineOptions<TData>) {
  "use no memo";

  // ==================== Column Visibility & Layout ====================
  const [internalVisibility, setInternalVisibility] = useState<Record<string, boolean>>({});
  const columnVisibility = controlledVisibility ?? internalVisibility;
  const handleColumnVisibilityChange = useMemoizedFn((v: Record<string, boolean>) => {
    setInternalVisibility(v);
    onColumnVisibilityModelChange?.(v);
  });

  const normalizedColumns = useMemo(() => normalizeDataTableColumns(columns), [columns]);
  const visibleColumns = useMemo(
    () => normalizedColumns.filter((col) => isColumnVisible(col, columnVisibility)),
    [normalizedColumns, columnVisibility],
  );
  const columnByField = useMemo(() => new Map(normalizedColumns.map((col) => [col.field, col])), [normalizedColumns]);
  const visibleColumnByField = useMemo(() => new Map(visibleColumns.map((col) => [col.field, col])), [visibleColumns]);

  const resize = useTableColumnResize({
    visibleColumns,
    visibleColumnByField,
    pinnedColumns,
    checkboxSelection,
    hasExpandColumn,
    storageKey,
    containerRef,
  });

  // ==================== Pagination, Sort, Filter, Selection & Expansion ====================
  const [internalPagination, setInternalPagination] = useState<DataTablePaginationModel>({
    page: statePage ?? 1,
    pageSize: propPageSize ?? DEFAULT_PAGE_SIZE,
  });
  const resetClientUncontrolledPage = useMemoizedFn(() => {
    if (paginationMode === "client" && statePage === undefined && controlledPaginationModel === undefined) {
      setInternalPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
    }
  });

  const sortAndFilter = useTableSortAndFilter({
    columnByField,
    controlledSortModel,
    onSortModelChange,
    onSortChange,
    hasAdapterSortModelHandler,
    controlledFilterModel,
    onFilterModelChange,
    onSearchChange,
    hasAdapterFilterModelHandler,
    onResetClientPage: resetClientUncontrolledPage,
  });

  const pagedRowsRef = useRef<TData[]>(EMPTY_ARRAY);
  const selAndExp = useTableSelectionAndExpansion({
    rows,
    getRowId,
    getPagedRows: () => pagedRowsRef.current,
    controlledSelectionModel,
    onRowSelectionModelChange,
    onSelectedRowsChange,
    isRowSelectable,
    controlledExpandedIds,
    defaultExpandedRowIds,
    onExpandedRowsChange,
    singleExpand,
  });

  // ==================== TanStack Table v8 Core Instance ====================
  const tanstackColumns: ColumnDef<TData, unknown>[] = normalizedColumns.map((col) => ({
    id: col.field,
    accessorFn: (row) => readCellValue(row, col),
    enableSorting: col.sortable,
    enableColumnFilter: col.filterable,
    enableGlobalFilter: true,
    enableHiding: true,
    enableResizing: col.resizable ?? true,
    enablePinning: true,
    size: col.width,
    minSize: col.minWidth ?? 50,
    maxSize: col.maxWidth ?? 9999,
    filterFn: (row, columnId, filterValue) => {
      const rules = filterValue as DataTableFilterItem[];
      return !Array.isArray(rules) || rules.every((rule) => matchesFilterOperator(row.getValue(columnId), rule));
    },
  }));

  const unmatchedFilterItems = (sortAndFilter.filterModel.items ?? []).filter((item) => !columnByField.has(item.field));
  const tableData =
    filterMode === "client" && unmatchedFilterItems.length > 0
      ? rows.filter((row) => unmatchedFilterItems.every((item) => matchesFilterOperator(row[item.field], item)))
      : rows;

  const rawPage = statePage ?? controlledPaginationModel?.page ?? internalPagination.page;
  const effectivePageSize = Math.max(
    1,
    propPageSize ?? controlledPaginationModel?.pageSize ?? internalPagination.pageSize,
  );
  const tableColumnVisibility = Object.fromEntries(
    normalizedColumns.map((col) => [col.field, isColumnVisible(col, columnVisibility)]),
  );
  const firstGlobalColumnId = visibleColumns[0]?.field;

  // eslint-disable-next-line react/incompatible-library -- TanStack Table v8 useReactTable 返回可变实例，已由 "use no memo" 隔离
  const table = useReactTable({
    data: tableData,
    columns: tanstackColumns,
    getRowId: (row) => String(getRowId(row)),
    manualSorting: sortingMode === "server",
    manualFiltering: filterMode === "server",
    manualPagination: true,
    enableRowSelection: isRowSelectable ? (row) => isRowSelectable(row.original) : checkboxSelection,
    globalFilterFn: (row, columnId, filterValue) =>
      firstGlobalColumnId && columnId !== firstGlobalColumnId
        ? false
        : evaluateQuickFilter(row.original, filterValue as string[], visibleColumns),
    state: {
      sorting: toTanStackSortingState(sortAndFilter.sortModel),
      columnFilters: filterMode === "client" ? buildColumnFiltersState(sortAndFilter.filterModel.items) : [],
      globalFilter:
        filterMode === "client" && sortAndFilter.quickFilterTokens.length > 0
          ? sortAndFilter.quickFilterTokens
          : undefined,
      rowSelection: selAndExp.rowSelectionState,
      expanded: selAndExp.expandedState,
      columnVisibility: tableColumnVisibility,
      columnPinning: { left: resize.pinnedLeftFields, right: resize.pinnedRightFields },
      columnSizing: resize.columnWidths,
      pagination: { pageIndex: Math.max(0, rawPage - 1), pageSize: effectivePageSize },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const processedRows = table.getPrePaginationRowModel().rows.map((r) => r.original);
  const totalRowCount = paginationMode === "server" ? (stateTotal ?? rows.length) : processedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRowCount / effectivePageSize));
  const effectivePage =
    paginationMode === "server" && stateTotal === undefined
      ? Math.max(1, rawPage)
      : Math.min(Math.max(1, rawPage), totalPages);
  const paginationModel: DataTablePaginationModel = { page: effectivePage, pageSize: effectivePageSize };
  const pagedRows =
    paginationMode === "server"
      ? processedRows
      : processedRows.slice((effectivePage - 1) * effectivePageSize, effectivePage * effectivePageSize);
  pagedRowsRef.current = pagedRows;

  const handlePaginationModelChange = useMemoizedFn((model: DataTablePaginationModel) => {
    setInternalPagination(model);
    if (model.page !== effectivePage) onPageChange?.(model.page);
    if (model.pageSize !== effectivePageSize) onPageSizeChange?.(model.pageSize);
    onPaginationModelChange?.(model);
  });

  const { isAllPageSelected, isSomePageSelected } = computePageSelectionSummary(
    pagedRows,
    selAndExp.selectionSet,
    getRowId,
    isRowSelectable,
  );

  return {
    table,
    normalizedColumns,
    visibleColumns,
    columnVisibility,
    handleColumnVisibilityChange,
    ...resize,
    ...sortAndFilter,
    processedRows,
    pagedRows,
    totalRowCount,
    paginationModel,
    handlePaginationModelChange,
    selectionSet: selAndExp.selectionSet,
    selectedFullRows: selAndExp.selectedFullRows,
    isAllPageSelected,
    isSomePageSelected,
    handleSelectRow: selAndExp.handleSelectRow,
    handleSelectAll: selAndExp.handleSelectAll,
    clearSelection: selAndExp.clearSelection,
    expandedRowIds: selAndExp.expandedRowIds,
    expandedSet: selAndExp.expandedSet,
    isRowExpanded: selAndExp.isRowExpanded,
    toggleRowExpanded: selAndExp.toggleRowExpanded,
    collapseAll: selAndExp.collapseAll,
  };
}
