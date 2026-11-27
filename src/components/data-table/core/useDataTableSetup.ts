"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemoizedFn } from "ahooks";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";

import { defaultGetRowId, DENSITY_ROW_CLASSES, DENSITY_ROW_HEIGHTS, EMPTY_ARRAY, EMPTY_RECORD } from "./constants";
import type { DataTableConfigContextValue } from "./DataTableContext";
import type { DataTableDensity, DataTableProps } from "./types";
import { useDataTableEngine } from "./useDataTableEngine";

/**
 * 组合 DataTable 引擎、虚拟滚动实例、密度状态与稳定化配置 Context；
 * 作为受控 `"use no memo"` 边界，保证 `DataTable` 主组件保持简洁声明式结构。
 */
export function useDataTableSetup<TData extends Record<string, any> = Record<string, any>>({
  state,
  data: propData,
  columns,
  getRowId = defaultGetRowId<TData>,
  loading: propLoading = false,
  checkboxSelection = false,
  rowSelectionModel,
  onRowSelectionModelChange,
  onSelectedRowsChange,
  isRowSelectable,
  renderExpandedRow,
  expandedRowIds: controlledExpandedRowIds,
  defaultExpandedRowIds,
  onExpandedRowsChange,
  isRowExpandable,
  expandOnRowClick,
  singleExpand,
  paginationMode: propPaginationMode = "client",
  pageSize: propPageSize,
  paginationModel: controlledPaginationModel,
  onPaginationModelChange,
  sortingMode: propSortingMode = "client",
  sortModel: propSortModel,
  onSortModelChange: propOnSortModelChange,
  filterMode: propFilterMode = "client",
  filterModel: propFilterModel,
  onFilterModelChange: propOnFilterModelChange,
  density: controlledDensity,
  onDensityChange,
  columnVisibilityModel: controlledVisibility,
  onColumnVisibilityModelChange,
  pinnedColumns = EMPTY_RECORD,
  storageKey,
  virtualize = false,
  onRowClick,
  slots = EMPTY_RECORD,
  slotProps = EMPTY_RECORD,
  emptyState,
  emptyMessage,
  noResultsMessage,
  resetFiltersText,
  loadingText,
  summaryLabel,
}: DataTableProps<TData>) {
  "use no memo";

  const t = useTranslations("table");
  const resolvedLoadingText = loadingText ?? t("loading_text");
  const resolvedEmptyMessage = emptyMessage ?? t("empty_heading");
  const resolvedNoResultsMessage = noResultsMessage ?? t("no_results_heading");
  const resolvedResetFiltersText = resetFiltersText ?? t("reset_filters_action");

  const rows: TData[] = state?.data ?? propData ?? EMPTY_ARRAY;
  const loading = state?.loading ?? propLoading;
  const paginationMode = state?.paginationMode ?? propPaginationMode;
  const sortingMode = state?.paginationMode === "server" ? "server" : propSortingMode;
  const filterMode = state?.paginationMode === "server" ? "server" : propFilterMode;

  const [internalDensity, setInternalDensity] = useState<DataTableDensity>("standard");
  const density = controlledDensity ?? internalDensity;
  const handleDensityChange = useMemoizedFn((d: DataTableDensity) => {
    setInternalDensity(d);
    onDensityChange?.(d);
  });
  const densityRowClass = DENSITY_ROW_CLASSES[density] ?? DENSITY_ROW_CLASSES.standard;

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const engine = useDataTableEngine<TData>({
    data: rows,
    columns,
    getRowId,
    paginationMode,
    page: state?.page,
    pageSize: state?.pageSize ?? propPageSize,
    total: state?.total,
    paginationModel: controlledPaginationModel,
    onPaginationModelChange,
    onPageChange: state?.onPageChange,
    onPageSizeChange: state?.onPageSizeChange,
    sortingMode,
    sortModel: state?.sortModel ?? propSortModel,
    onSortModelChange: state?.onSortModelChange ?? propOnSortModelChange,
    onSortChange: state?.onSortChange,
    hasAdapterSortModelHandler: Boolean(state?.onSortModelChange),
    filterMode,
    filterModel: state?.filterModel ?? propFilterModel,
    onFilterModelChange: state?.onFilterModelChange ?? propOnFilterModelChange,
    onSearchChange: state?.onSearchChange,
    hasAdapterFilterModelHandler: Boolean(state?.onFilterModelChange),
    checkboxSelection,
    rowSelectionModel,
    onRowSelectionModelChange,
    onSelectedRowsChange,
    isRowSelectable,
    expandedRowIds: controlledExpandedRowIds,
    defaultExpandedRowIds,
    onExpandedRowsChange,
    singleExpand,
    hasExpandColumn: Boolean(renderExpandedRow),
    columnVisibilityModel: controlledVisibility,
    onColumnVisibilityModelChange,
    pinnedColumns,
    storageKey,
    containerRef: tableContainerRef,
  });

  // Whitelist AGENTS.md §5.2: 保持传入 DataTableConfigContextValue 的列查找表与固定列集合引用稳定，配合 DataTableRow memo 隔离
  const columnByField = useMemo(
    () => new Map(engine.normalizedColumns.map((col) => [col.id ?? col.field, col])),
    [engine.normalizedColumns],
  );
  const pinnedLeftSet = useMemo(() => new Set(engine.pinnedLeftFields), [engine.pinnedLeftFields]);
  const pinnedRightSet = useMemo(() => new Set(engine.pinnedRightFields), [engine.pinnedRightFields]);

  // eslint-disable-next-line react/incompatible-library -- TanStack Virtualizer useVirtualizer 返回可变实例，无法由 React Compiler 自动记忆化
  const rowVirtualizer = useVirtualizer({
    count: engine.pagedRows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => DENSITY_ROW_HEIGHTS[density],
    measureElement: (el) => {
      const baseHeight = el.getBoundingClientRect().height;
      const nextEl = el.nextElementSibling;
      return nextEl?.getAttribute("data-slot") === "data-table-expanded-row"
        ? baseHeight + nextEl.getBoundingClientRect().height
        : baseHeight;
    },
    overscan: 5,
    enabled: virtualize,
  });

  const onSelectAllOnPage = useMemoizedFn((checked: boolean) => engine.handleSelectAll(checked, engine.pagedRows));

  // 锁定 DataTableProvider 静态配置引用稳定性，保障行级 React.memo(DataTableRow) 在选行/展开时不误重渲染
  const contextValue = useMemo<DataTableConfigContextValue<TData>>(
    () => ({
      columns: engine.normalizedColumns,
      columnByField,
      visibleColumns: engine.visibleColumns,
      pinnedLeftFields: engine.pinnedLeftFields,
      pinnedRightFields: engine.pinnedRightFields,
      pinnedLeftSet,
      pinnedRightSet,
      density,
      densityRowClass,
      checkboxSelection,
      getRowId,
      isRowSelectable,
      renderExpandedRow,
      isRowExpandable,
      expandOnRowClick,
      toggleRowExpanded: engine.toggleRowExpanded,
      slots,
      slotProps,
      emptyState,
      emptyMessage: resolvedEmptyMessage,
      noResultsMessage: resolvedNoResultsMessage,
      resetFiltersText: resolvedResetFiltersText,
      loadingText: resolvedLoadingText,
      summaryLabel,
      onSelectRow: engine.handleSelectRow,
      onRowClick,
      getColumnWidth: engine.getColumnWidth,
      handleResizeStart: engine.handleResizeStart,
      handleResizeStep: engine.handleResizeStep,
      handleSortClick: engine.handleSortClick,
    }),
    [
      engine.normalizedColumns,
      columnByField,
      engine.visibleColumns,
      engine.pinnedLeftFields,
      engine.pinnedRightFields,
      pinnedLeftSet,
      pinnedRightSet,
      density,
      densityRowClass,
      checkboxSelection,
      getRowId,
      isRowSelectable,
      renderExpandedRow,
      isRowExpandable,
      expandOnRowClick,
      engine.toggleRowExpanded,
      slots,
      slotProps,
      emptyState,
      resolvedEmptyMessage,
      resolvedNoResultsMessage,
      resolvedResetFiltersText,
      resolvedLoadingText,
      summaryLabel,
      engine.handleSelectRow,
      onRowClick,
      engine.getColumnWidth,
      engine.handleResizeStart,
      engine.handleResizeStep,
      engine.handleSortClick,
    ],
  );

  const statusText = loading
    ? resolvedLoadingText
    : [
        t("records_available", { count: engine.totalRowCount }),
        engine.isFiltered ? t("records_filtered_suffix") : null,
        engine.selectedFullRows.length > 0
          ? t("records_selected_suffix", { count: engine.selectedFullRows.length })
          : null,
      ]
        .filter(Boolean)
        .join(", ");

  return {
    rows,
    loading,
    density,
    handleDensityChange,
    tableContainerRef,
    engine,
    rowVirtualizer,
    onSelectAllOnPage,
    contextValue,
    resolvedLoadingText,
    statusText,
  };
}
