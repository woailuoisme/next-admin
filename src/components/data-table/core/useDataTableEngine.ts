"use client";

import {
  type ColumnDef,
  columnFilteringFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  functionalUpdate,
  globalFilteringFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  type SortingState,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useMemoizedFn } from "ahooks";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_PAGE_SIZE, defaultGetRowId, EMPTY_ARRAY, EMPTY_RECORD, NOOP } from "./constants";
import type { UseDataTableEngineOptions } from "./engineTypes";
import { computePageSelectionSummary, normalizeDataTableColumns, toTanStackSortingState } from "./tableEngineHelpers";
import { buildColumnFiltersState, evaluateQuickFilter, matchesFilterOperator } from "./tableFilterFns";
import type { DataTableFilterItem, DataTablePaginationModel } from "./types";
import { useTableColumnResize } from "./useTableColumnResize";
import { useTableSelectionAndExpansion } from "./useTableSelectionAndExpansion";
import { useTableSortAndFilter } from "./useTableSortAndFilter";
import { isColumnVisible, readCellValue } from "./utils";

export type { UseDataTableEngineOptions };

export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnResizingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  expandedRowModel: createExpandedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

export type DataTableFeatures = typeof dataTableFeatures;
export interface DataTableSelectedState {
  sorting: SortingState;
}

/**
 * 统一基于 `@tanstack/react-table` v9 构建的数据表格状态引擎：
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

  // Whitelist AGENTS.md §5.2: "use no memo" 边界内需手动维持列派生集合引用稳定，供 TanStack Table 与 Context 下发复用
  const normalizedColumns = useMemo(() => normalizeDataTableColumns(columns), [columns]);
  // Whitelist AGENTS.md §5.2: 同上，维持 visibleColumns 引用稳定避免触发行渲染重建
  const visibleColumns = useMemo(
    () => normalizedColumns.filter((col) => isColumnVisible(col, columnVisibility)),
    [normalizedColumns, columnVisibility],
  );
  // Whitelist AGENTS.md §5.2: 维持列映射表引用稳定供筛选/排序引擎共享
  const columnByField = useMemo(() => new Map(normalizedColumns.map((col) => [col.field, col])), [normalizedColumns]);
  // Whitelist AGENTS.md §5.2: 维持可见列映射表引用稳定供列宽与固定列计算使用
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

  // ==================== TanStack Table v9 Core Instance ====================
  const tanstackColumns: ColumnDef<DataTableFeatures, TData, unknown>[] = normalizedColumns.map((col) => ({
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

  const handlePaginationModelChange = useMemoizedFn((model: DataTablePaginationModel) => {
    setInternalPagination(model);
    if (model.page !== effectivePage) onPageChange?.(model.page);
    if (model.pageSize !== effectivePageSize) onPageSizeChange?.(model.pageSize);
    onPaginationModelChange?.(model);
  });

  const tanstackSorting = toTanStackSortingState(sortAndFilter.sortModel);
  const tanstackColumnFilters =
    filterMode === "client" ? buildColumnFiltersState(sortAndFilter.filterModel.items) : EMPTY_ARRAY;
  const tanstackGlobalFilter =
    filterMode === "client" && sortAndFilter.quickFilterTokens.length > 0 ? sortAndFilter.quickFilterTokens : undefined;
  const tanstackPagination = { pageIndex: Math.max(0, rawPage - 1), pageSize: effectivePageSize };
  const rowIdByKey = new Map(rows.map((row) => [String(getRowId(row)), getRowId(row)]));

  // eslint-disable-next-line react/incompatible-library -- TanStack Table v9 useTable 返回可变实例，已由 "use no memo" 隔离
  const table = useTable(
    {
      features: dataTableFeatures,
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
        sorting: tanstackSorting,
        columnFilters: tanstackColumnFilters,
        globalFilter: tanstackGlobalFilter,
        rowSelection: selAndExp.rowSelectionState,
        expanded: selAndExp.expandedState,
        columnVisibility: tableColumnVisibility,
        columnPinning: { start: resize.pinnedLeftFields, end: resize.pinnedRightFields },
        columnSizing: resize.columnWidths,
        pagination: tanstackPagination,
      },
      onSortingChange: (updater) => {
        const nextSorting = functionalUpdate(updater, tanstackSorting);
        sortAndFilter.handleSortModelChange(
          nextSorting.map((item) => ({ field: item.id, sort: item.desc ? "desc" : "asc" })),
        );
      },
      onColumnFiltersChange: (updater) => {
        const nextFilters = functionalUpdate(updater, tanstackColumnFilters);
        const nextItems = nextFilters.flatMap((entry) =>
          Array.isArray(entry.value) ? (entry.value as DataTableFilterItem[]) : [],
        );
        sortAndFilter.handleFilterModelChange({ ...sortAndFilter.filterModel, items: nextItems });
      },
      onGlobalFilterChange: (updater) => {
        const nextGlobal = functionalUpdate(updater, tanstackGlobalFilter);
        const text = Array.isArray(nextGlobal) ? nextGlobal.join(" ") : String(nextGlobal ?? "");
        sortAndFilter.handleQuickFilterChange(text);
      },
      onRowSelectionChange: (updater) => {
        const nextSelection = functionalUpdate(updater, selAndExp.rowSelectionState);
        const nextIds = Object.keys(nextSelection)
          .filter((key) => nextSelection[key])
          .map((key) => rowIdByKey.get(key) ?? key);
        selAndExp.commitSelection(nextIds);
      },
      onExpandedChange: (updater) => {
        const nextExpanded = functionalUpdate(updater, selAndExp.expandedState);
        const nextIds =
          nextExpanded === true
            ? rows.map((row) => getRowId(row))
            : Object.keys(nextExpanded)
                .filter((key) => nextExpanded[key])
                .map((key) => rowIdByKey.get(key) ?? key);
        selAndExp.updateExpandedIds(nextIds);
      },
      onColumnVisibilityChange: (updater) => {
        handleColumnVisibilityChange(functionalUpdate(updater, tableColumnVisibility));
      },
      // 固定列由 pinnedColumns 与列定义声明式派生，保留受控切片配对回调以遵循 v9 契约
      onColumnPinningChange: NOOP,
      onColumnSizingChange: (updater) => {
        resize.setColumnWidths(functionalUpdate(updater, resize.columnWidths));
      },
      onPaginationChange: (updater) => {
        const nextPag = functionalUpdate(updater, tanstackPagination);
        handlePaginationModelChange({ page: nextPag.pageIndex + 1, pageSize: nextPag.pageSize });
      },
    },
    (state) => ({ sorting: state.sorting }),
  );

  const processedRows = table.getPrePaginatedRowModel().rows.map((r) => r.original);
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

  useLayoutEffect(() => {
    pagedRowsRef.current = pagedRows;
  }, [pagedRows]);

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
