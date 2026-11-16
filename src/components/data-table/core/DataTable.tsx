import { useTranslations } from "next-intl";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemoizedFn } from "ahooks";
import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";

import { Table, TableFooter } from "@/components/ui/table";
import { cn } from "cn";

import type { DataTableBatchActionBarProps } from "../footer/DataTableBatchActionBar";
import type { DataTableSummaryRowProps } from "../footer/DataTableSummaryRow";
import type { DataTableFilterPanelProps } from "../toolbar/filters/types";
import type { DataTableDensity, DataTablePaginationModel, DataTableProps, DataTableRowSelectionModel } from "./types";

import { DataTableBody } from "../body/DataTableBody";
import { DataTablePagination } from "../footer/DataTablePagination";
import { DataTableHeader } from "../header/DataTableHeader";
import { useDataTableExpansion } from "../hooks/useDataTableExpansion";
import { useDataTableExport } from "../hooks/useDataTableExport";
import { useDataTableFiltering } from "../hooks/useDataTableFiltering";
import { useDataTablePinning } from "../hooks/useDataTablePinning";
import { useDataTableResize } from "../hooks/useDataTableResize";
import { useDataTableSelection } from "../hooks/useDataTableSelection";
import { resolveNextSortDirection, useDataTableSorting } from "../hooks/useDataTableSorting";
import { useDataTableViews } from "../hooks/useDataTableViews";
import { DataTableBackdropLoader } from "../overlays/DataTableOverlays";
import { isSystemColumn } from "../toolbar/filters/utils";
import { DataTableToolbar } from "../toolbar/DataTableToolbar";
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, defaultGetRowId, EMPTY_ARRAY, EMPTY_RECORD } from "./constants";
import { type DataTableConfigContextValue, DataTableProvider } from "./DataTableContext";
import { isColumnVisible, toColumnCssVarKey } from "./utils";

const LazyBatchActionBar = dynamic(() =>
  import("../footer/DataTableBatchActionBar").then((mod) => mod.DataTableBatchActionBar),
) as <TData = unknown>(props: DataTableBatchActionBarProps<TData>) => React.ReactNode;

const LazySummaryRow = dynamic(() =>
  import("../footer/DataTableSummaryRow").then((mod) => mod.DataTableSummaryRow),
) as <TData = unknown>(props: DataTableSummaryRowProps<TData>) => React.ReactNode;

const LazyFilterPanel = dynamic(() =>
  import("../toolbar/filters/FilterRegistry").then((mod) => mod.DataTableFilterPanel),
) as <TData = any>(props: DataTableFilterPanelProps<TData>) => React.ReactNode;

const DENSITY_ROW_CLASSES: Record<DataTableDensity, string> = {
  compact: "h-9 py-1 text-xs",
  comfortable: "h-16 py-3.5 text-sm",
  standard: "h-12 py-2 text-xs",
};

/** 虚拟滚动行高估值，与 DENSITY_ROW_CLASSES 的 h-* 一一对应 */
const DENSITY_ROW_HEIGHTS: Record<DataTableDensity, number> = {
  compact: 36,
  comfortable: 64,
  standard: 48,
};

export function DataTable<TData extends Record<string, any> = Record<string, any>>({
  state,
  data: propData,
  columns,
  getRowId = defaultGetRowId<TData>,
  loading: propLoading = false,

  // Selection
  checkboxSelection = false,
  rowSelectionModel,
  onRowSelectionModelChange,
  onSelectedRowsChange,
  isRowSelectable,

  // Row Expansion
  renderExpandedRow,
  expandedRowIds: controlledExpandedRowIds,
  defaultExpandedRowIds,
  onExpandedRowsChange,
  isRowExpandable,
  expandOnRowClick,
  singleExpand,

  // Pagination
  paginationMode: propPaginationMode = "client",
  pageSize: propPageSize,
  paginationModel: controlledPaginationModel,
  onPaginationModelChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  hidePagination = false,
  paginationVariant = "capsule",

  // Sorting
  sortingMode: propSortingMode = "client",
  sortModel: propSortModel,
  onSortModelChange: propOnSortModelChange,

  // Filtering
  filterMode: propFilterMode = "client",
  filterModel: propFilterModel,
  onFilterModelChange: propOnFilterModelChange,
  filterConfig,
  filters,

  // Tabs & Saved Views
  tabs,
  activeTab: controlledActiveTab,
  defaultActiveTab,
  onTabChange,
  savedViews: controlledSavedViews,
  defaultSavedViews,
  onSavedViewsChange,
  enableSavedViews,

  // Density
  density: controlledDensity,
  onDensityChange,

  // Column Visibility & Pinning
  columnVisibilityModel: controlledVisibility,
  onColumnVisibilityModelChange,
  pinnedColumns = EMPTY_RECORD,
  storageKey,

  // Advanced options
  showToolbar = true,
  summaryRow = false,
  summaryLabel,
  virtualize = false,
  maxHeight,
  onRowClick,
  batchActions,

  className,
  tableClassName,
  slots = EMPTY_RECORD,
  slotProps = EMPTY_RECORD,
  emptyState,
  emptyMessage,
  noResultsMessage,
  resetFiltersText,
  loadingText,
}: DataTableProps<TData>) {
  const t = useTranslations("table");
  const resolvedLoadingText = loadingText ?? t("loading_text");
  const resolvedEmptyMessage = emptyMessage ?? t("empty_heading");
  const resolvedNoResultsMessage = noResultsMessage ?? t("no_results_heading");
  const resolvedResetFiltersText = resetFiltersText ?? t("reset_filters_action");

  // Reconcile unified TableStateAdapter seam with standalone direct props
  const rows = state?.data ?? propData ?? (EMPTY_ARRAY as unknown as TData[]);
  const loading = state?.loading ?? propLoading;
  const paginationMode = state?.paginationMode ?? propPaginationMode;
  const sortingMode = state?.paginationMode === "server" ? "server" : propSortingMode;
  const filterMode = state?.paginationMode === "server" ? "server" : propFilterMode;
  const controlledSortModel = state?.sortModel ?? propSortModel;
  const controlledFilterModel = state?.filterModel ?? propFilterModel;
  const onSortModelChange = state?.onSortModelChange ?? propOnSortModelChange;
  const onFilterModelChange = state?.onFilterModelChange ?? propOnFilterModelChange;

  // ==================== Density State ====================
  const [internalDensity, setInternalDensity] = useState<DataTableDensity>("standard");
  const density = controlledDensity ?? internalDensity;
  const handleDensityChange = useMemoizedFn((d: DataTableDensity) => {
    setInternalDensity(d);
    onDensityChange?.(d);
  });

  // density 可能来自 URL / localStorage，保留兜底避免类名变空
  const densityRowClass = DENSITY_ROW_CLASSES[density] ?? DENSITY_ROW_CLASSES.standard;

  // ==================== Column Visibility State ====================
  const [internalVisibility, setInternalVisibility] = useState<Record<string, boolean>>({});
  const columnVisibility = controlledVisibility ?? internalVisibility;
  const handleColumnVisibilityChange = useMemoizedFn((v: Record<string, boolean>) => {
    setInternalVisibility(v);
    onColumnVisibilityModelChange?.(v);
  });

  // ==================== Column Normalization ====================
  const normalizedColumns = useMemo(() => {
    return columns.map((col) => {
      const isActionCol = isSystemColumn(col);
      return {
        ...col,
        sortable: col.sortable ?? !isActionCol,
        filterable: col.filterable ?? !isActionCol,
        align: col.align ?? (isActionCol ? "center" : "left"),
        headerAlign: col.headerAlign ?? (isActionCol ? "center" : (col.align ?? "left")),
      };
    });
  }, [columns]);

  const visibleColumns = useMemo(() => {
    // colDef.hidden 与 columnVisibility 两种隐藏机制统一在此收敛（用户显式切换优先于初始 hidden）
    return normalizedColumns.filter((col) => isColumnVisible(col, columnVisibility));
  }, [normalizedColumns, columnVisibility]);

  // ==================== Table Container Ref & Column Resizing ====================
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { columnWidths, handleResizeStart } = useDataTableResize({
    columns: visibleColumns,
    storageKey,
    containerRef: tableContainerRef,
    pinnedColumns,
    checkboxSelection,
    hasExpandColumn: Boolean(renderExpandedRow),
  });

  // ==================== Pagination State ====================
  const [internalPagination, setInternalPagination] = useState<DataTablePaginationModel>({
    page: state?.page ?? 1,
    pageSize: state?.pageSize ?? propPageSize ?? DEFAULT_PAGE_SIZE,
  });

  const resetClientUncontrolledPage = useMemoizedFn(() => {
    if (paginationMode === "client" && state?.page === undefined && controlledPaginationModel === undefined) {
      setInternalPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
    }
  });

  // ==================== Sorting (useDataTableSorting) ====================
  const {
    sortModel,
    handleSortClick: baseHandleSortClick,
    handleSortModelChange: baseHandleSortModelChange,
    sortRows,
  } = useDataTableSorting({
    columns: normalizedColumns,
    sortingMode,
    sortModel: controlledSortModel,
    onSortModelChange,
  });

  const handleSortClick = useMemoizedFn((field: string) => {
    const targetCol = normalizedColumns.find((c) => c.field === field);
    if (targetCol?.sortable === false) {
      return;
    }
    baseHandleSortClick(field);
    // Avoid double notification when adapter already receives onSortModelChange from baseHandleSortClick
    if (!state?.onSortModelChange && state?.onSortChange) {
      const nextDir = resolveNextSortDirection(sortModel, field);
      state.onSortChange(field, nextDir);
    }
    resetClientUncontrolledPage();
  });

  const handleSortModelChange = useMemoizedFn((model: typeof sortModel) => {
    baseHandleSortModelChange(model);
    resetClientUncontrolledPage();
  });

  // ==================== Filtering (useDataTableFiltering) ====================
  const {
    filterModel,
    quickFilterText,
    filteredRows,
    handleFilterModelChange: baseHandleFilterModelChange,
    handleQuickFilterChange: baseHandleQuickFilterChange,
    handleResetFilters: baseHandleResetFilters,
  } = useDataTableFiltering({
    rows,
    columns: normalizedColumns,
    visibleColumns,
    filterMode,
    filterModel: controlledFilterModel,
    onFilterModelChange,
  });

  const handleFilterModelChange = useMemoizedFn((model: typeof filterModel) => {
    baseHandleFilterModelChange(model);
    resetClientUncontrolledPage();
  });

  const handleQuickFilterChange = useMemoizedFn((val: string) => {
    if (state?.onSearchChange && controlledFilterModel !== undefined) {
      state.onSearchChange(val);
      return;
    }
    baseHandleQuickFilterChange(val);
    state?.onSearchChange?.(val);
    resetClientUncontrolledPage();
  });

  const isFiltered = Boolean(
    quickFilterText.trim() ||
    (filterModel.quickFilterValues && filterModel.quickFilterValues.length > 0) ||
    (filterModel.items && filterModel.items.length > 0),
  );

  const handleResetFilters = useMemoizedFn(() => {
    baseHandleResetFilters();
    if (state?.onSearchChange && !state?.onFilterModelChange) {
      state.onSearchChange("");
    }
    resetClientUncontrolledPage();
  });

  // ==================== Row Expansion (useDataTableExpansion) ====================
  const { expandedSet, toggleRowExpanded } = useDataTableExpansion({
    expandedRowIds: controlledExpandedRowIds,
    defaultExpandedRowIds,
    onExpandedRowsChange,
    singleExpand,
  });

  // ==================== Tabs & Saved Views (useDataTableViews) ====================
  const {
    currentActiveTab,
    handleTabChange,
    savedViews: resolvedSavedViews,
    activeViewId,
    applyView,
    saveCurrentAsView,
    deleteView,
  } = useDataTableViews<TData>({
    tabs,
    activeTab: controlledActiveTab,
    defaultActiveTab,
    onTabChange,
    savedViews: controlledSavedViews,
    defaultSavedViews,
    onSavedViewsChange,
    enableSavedViews,
    storageKey,
    currentFilterModel: filterModel,
    currentSortModel: sortModel,
    currentColumnVisibility: columnVisibility,
    currentDensity: density,
    onApplyFilterModel: handleFilterModelChange,
    onApplySortModel: handleSortModelChange,
    onApplyColumnVisibility: handleColumnVisibilityChange,
    onApplyDensity: handleDensityChange,
  });

  // ==================== Processed Rows (Client Sorting) ====================
  const processedRows = useMemo(() => {
    return sortRows(filteredRows);
  }, [sortRows, filteredRows]);

  const rawPage = state?.page ?? controlledPaginationModel?.page ?? internalPagination.page;
  const effectivePageSize = Math.max(
    1,
    state?.pageSize ?? controlledPaginationModel?.pageSize ?? internalPagination.pageSize,
  );
  const totalRowCount = paginationMode === "server" ? (state?.total ?? rows.length) : processedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRowCount / effectivePageSize));
  const effectivePage = paginationMode === "client" ? Math.min(Math.max(1, rawPage), totalPages) : Math.max(1, rawPage);

  const paginationModel = useMemo(
    () => ({ page: effectivePage, pageSize: effectivePageSize }),
    [effectivePage, effectivePageSize],
  );

  const handlePaginationModelChange = useMemoizedFn((model: DataTablePaginationModel) => {
    setInternalPagination(model);
    if (model.page !== effectivePage) {
      state?.onPageChange?.(model.page);
    }
    if (model.pageSize !== effectivePageSize) {
      state?.onPageSizeChange?.(model.pageSize);
    }
    onPaginationModelChange?.(model);
  });

  const pagedRows = useMemo(() => {
    if (paginationMode === "server") {
      return processedRows;
    }
    const start = (paginationModel.page - 1) * paginationModel.pageSize;
    return processedRows.slice(start, start + paginationModel.pageSize);
  }, [processedRows, paginationMode, paginationModel]);

  // ==================== Selection State (useDataTableSelection) ====================
  const handleSelectionChange = useMemoizedFn((model: DataTableRowSelectionModel, selected: TData[]) => {
    onRowSelectionModelChange?.(model, selected);
    onSelectedRowsChange?.(selected);
  });

  const {
    selectionSet,
    selectedFullRows,
    isAllPageSelected,
    isSomePageSelected,
    handleSelectRow,
    handleSelectAll,
    clearSelection,
  } = useDataTableSelection({
    rows,
    pagedRows,
    getRowId,
    checkboxSelection,
    rowSelectionModel,
    onRowSelectionModelChange: handleSelectionChange,
    isRowSelectable,
  });

  // ==================== Column Pinning (useDataTablePinning) ====================
  const { pinnedLeftFields, pinnedRightFields, leftOffsets, rightOffsets } = useDataTablePinning({
    columns: visibleColumns,
    pinnedColumns,
    columnWidths,
    checkboxSelection,
    hasExpandColumn: Boolean(renderExpandedRow),
  });

  // ==================== Export Helpers (useDataTableExport) ====================
  const { handleExportExcel, handleExportCsv, handleExportJson, handlePrint } = useDataTableExport({
    visibleColumns,
    selectedFullRows,
    processedRows,
    exportFileName: slotProps.toolbar?.exportFileName,
  });

  // ==================== Screen Reader Status Text ====================
  const statusText = useMemo(() => {
    if (loading) {
      return resolvedLoadingText;
    }
    return [
      t("records_available", { count: totalRowCount }),
      isFiltered ? t("records_filtered_suffix") : null,
      selectedFullRows.length > 0 ? t("records_selected_suffix", { count: selectedFullRows.length }) : null,
    ]
      .filter(Boolean)
      .join(", ");
  }, [loading, resolvedLoadingText, t, totalRowCount, isFiltered, selectedFullRows.length]);

  // ==================== Virtualization ====================
  // eslint-disable-next-line react/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: pagedRows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => DENSITY_ROW_HEIGHTS[density],
    overscan: 5,
    enabled: virtualize,
  });

  const onSelectAllOnPage = useMemoizedFn((checked: boolean) => {
    handleSelectAll(checked, pagedRows);
  });

  // Layout Seam: Drive column widths & pinning offsets via container CSS variables for 60-120FPS isolation
  const containerColumnStyles = useMemo<Record<string, string>>(() => {
    const styles: Record<string, string> = {};
    for (const col of visibleColumns) {
      const varKey = toColumnCssVarKey(col.field);
      const w = columnWidths[col.field] ?? col.width;
      if (w !== undefined) {
        styles[`--col-w-${varKey}`] = `${w}px`;
      }
      if (leftOffsets[col.field] !== undefined) {
        styles[`--col-left-${varKey}`] = `${leftOffsets[col.field]}px`;
      }
      if (rightOffsets[col.field] !== undefined) {
        styles[`--col-right-${varKey}`] = `${rightOffsets[col.field]}px`;
      }
    }
    return styles;
  }, [visibleColumns, columnWidths, leftOffsets, rightOffsets]);

  // Static Config Context Value for deep tree re-render isolation & zero prop-drilling
  // Volatile widths/offsets live on container CSS variables (LayoutSeam); selection/expansion sets flow to Body.
  const contextValue = useMemo<DataTableConfigContextValue<TData>>(
    () => ({
      columns: normalizedColumns,
      visibleColumns,
      pinnedLeftFields,
      pinnedRightFields,
      density,
      densityRowClass,
      checkboxSelection,
      getRowId,
      isRowSelectable,
      renderExpandedRow,
      isRowExpandable,
      expandOnRowClick,
      toggleRowExpanded,
      slots,
      slotProps,
      emptyState,
      emptyMessage: resolvedEmptyMessage,
      noResultsMessage: resolvedNoResultsMessage,
      resetFiltersText: resolvedResetFiltersText,
      loadingText: resolvedLoadingText,
      summaryLabel,
      onSelectRow: handleSelectRow,
      onRowClick,
      handleResizeStart,
      handleSortClick,
    }),
    [
      normalizedColumns,
      visibleColumns,
      pinnedLeftFields,
      pinnedRightFields,
      density,
      densityRowClass,
      checkboxSelection,
      getRowId,
      isRowSelectable,
      renderExpandedRow,
      isRowExpandable,
      expandOnRowClick,
      toggleRowExpanded,
      slots,
      slotProps,
      emptyState,
      resolvedEmptyMessage,
      resolvedNoResultsMessage,
      resolvedResetFiltersText,
      resolvedLoadingText,
      summaryLabel,
      handleSelectRow,
      onRowClick,
      handleResizeStart,
      handleSortClick,
    ],
  );

  const ToolbarComponent = slots?.toolbar ?? DataTableToolbar;

  return (
    <DataTableProvider value={contextValue}>
      <div
        className={cn(
          "relative flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs transition-colors",
          className,
        )}
      >
        {/* Toolbar */}
        {showToolbar && (
          <ToolbarComponent
            columns={normalizedColumns}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            density={density}
            onDensityChange={handleDensityChange}
            quickFilterValue={quickFilterText}
            onQuickFilterChange={handleQuickFilterChange}
            onExportExcel={handleExportExcel}
            onExportCsv={handleExportCsv}
            onExportJson={handleExportJson}
            onPrint={handlePrint}
            toolbarProps={slotProps.toolbar}
            filterConfig={filterConfig}
            filters={filters}
            data={rows}
            tabs={tabs}
            activeTab={currentActiveTab}
            onTabChange={handleTabChange}
            savedViews={resolvedSavedViews}
            activeViewId={activeViewId}
            onApplyView={applyView}
            onSaveCurrentView={saveCurrentAsView}
            onDeleteView={deleteView}
            enableSavedViews={enableSavedViews}
          />
        )}

        {/* Inline Above-Content Filters */}
        {filterConfig?.layout === "aboveContent" && (
          <div className="border-border/50 bg-card/30 border-b p-2.5">
            <LazyFilterPanel
              columns={normalizedColumns}
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
              filterConfig={filterConfig}
              filters={filters}
              data={rows}
            />
          </div>
        )}

        {/* Main Scrollable Table Area */}
        <div
          ref={tableContainerRef}
          style={{
            maxHeight: maxHeight ?? (virtualize ? "560px" : undefined),
            ...(containerColumnStyles as React.CSSProperties),
          }}
          className="relative w-full max-w-full min-w-0 overflow-auto [&_[data-slot=table-container]]:overflow-visible"
        >
          {loading && pagedRows.length > 0 ? (
            <DataTableBackdropLoader slots={slots} loadingText={resolvedLoadingText} />
          ) : null}

          <Table className={cn("w-full border-collapse", tableClassName)} aria-busy={loading}>
            <DataTableHeader
              isAllPageSelected={isAllPageSelected}
              isSomePageSelected={isSomePageSelected}
              onSelectAll={onSelectAllOnPage}
              sortModel={sortModel}
            />

            <DataTableBody
              loading={loading}
              virtualize={virtualize}
              pagedRows={pagedRows}
              selectionSet={selectionSet}
              expandedSet={renderExpandedRow ? expandedSet : undefined}
              rowVirtualizer={rowVirtualizer}
              isFiltered={isFiltered}
              onResetFilters={handleResetFilters}
              skeletonRowCount={paginationModel.pageSize}
            />

            {summaryRow && pagedRows.length > 0 && !loading ? (
              <TableFooter className="border-border/80 bg-muted/90 sticky bottom-0 z-20 border-t-2 backdrop-blur-xs">
                <LazySummaryRow rows={processedRows} />
              </TableFooter>
            ) : null}
          </Table>
        </div>

        {/* Pagination Footer */}
        {!hidePagination ? (
          <DataTablePagination
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            rowCount={totalRowCount}
            pageSizeOptions={pageSizeOptions}
            variant={paginationVariant}
          />
        ) : null}

        {/* Floating Batch Action Bar */}
        {checkboxSelection && selectedFullRows.length > 0 ? (
          <LazyBatchActionBar
            selectedRows={selectedFullRows}
            onClearSelection={clearSelection}
            batchActions={batchActions}
          />
        ) : null}

        {/* WCAG 2.1 AA Screen Reader Live Region for status announcements */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {statusText}
        </div>
      </div>
    </DataTableProvider>
  );
}
