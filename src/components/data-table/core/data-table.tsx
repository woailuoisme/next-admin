import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemoizedFn } from "ahooks";
import { useMemo, useRef, useState } from "react";

import { Table, TableFooter } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type {
  DataTableDensity,
  DataTableFilterModel,
  DataTablePaginationModel,
  DataTableProps,
  DataTableRowSelectionModel,
} from "./types";

import { DataTableBody } from "../body/DataTableBody";
import { DataTableBatchActionBar } from "../footer/DataTableBatchActionBar";
import { DataTablePagination } from "../footer/DataTablePagination";
import { DataTableSummaryRow } from "../footer/DataTableSummaryRow";
import { DataTableHeader } from "../header/DataTableHeader";
import {
  resolveNextSortDirection,
  useDataTableExpansion,
  useDataTableExport,
  useDataTableFiltering,
  useDataTablePinning,
  useDataTableResize,
  useDataTableSelection,
  useDataTableSorting,
  useDataTableViews,
} from "../hooks";
import { DataTableBackdropLoader } from "../overlays/DataTableOverlays";
import { DataTableFilterPanel } from "../toolbar";
import { DataTableToolbar } from "../toolbar/DataTableToolbar";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  defaultGetRowId,
  EMPTY_ARRAY,
  EMPTY_RECORD,
} from "./constants";
import { type DataTableContextValue, DataTableProvider } from "./data-table-context";

const DENSITY_ROW_CLASSES: Record<DataTableDensity, string> = {
  compact: "h-9 py-1 text-xs",
  comfortable: "h-16 py-3.5 text-sm",
  standard: "h-12 py-2 text-xs",
};

export function DataTable<TData extends Record<string, any> = Record<string, any>>({
  rows: rawRows,
  data,
  columns,
  getRowId = defaultGetRowId<TData>,
  loading = false,

  // Selection
  checkboxSelection = false,
  rowSelectionModel,
  onRowSelectionModelChange,
  onSelectedRowsChange,
  isRowSelectable,

  // Row Expansion
  expansionProps,
  renderExpandedRow: propRenderExpandedRow,
  expandedRowIds: propExpandedRowIds,
  defaultExpandedRowIds: propDefaultExpandedRowIds,
  onExpandedRowsChange: propOnExpandedRowsChange,
  isRowExpandable: propIsRowExpandable,
  expandOnRowClick: propExpandOnRowClick,
  singleExpand: propSingleExpand,

  // Pagination
  pagination,
  initialPaginationModel,
  paginationMode = "client",
  rowCount: customRowCount,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  paginationModel: controlledPaginationModel,
  onPaginationModelChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  hidePagination = false,
  paginationVariant = "capsule",

  // Sorting
  sortingMode = "client",
  sortModel: controlledSortModel,
  onSortModelChange,
  onSortChange,

  // Filtering
  filterMode = "client",
  filterModel: controlledFilterModel,
  onFilterModelChange,
  onSearchChange,
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
  virtualize = false,
  maxHeight,
  onRowClick,
  batchActions,

  className,
  tableClassName,
  slots = EMPTY_RECORD,
  slotProps = EMPTY_RECORD,
  emptyState,
  emptyMessage = "No records found.",
  noResultsMessage = "No matching records found.",
  resetFiltersText = "Reset filters",
  loadingText = "Loading records...",
}: DataTableProps<TData>) {
  const rows = data ?? rawRows ?? (EMPTY_ARRAY as unknown as TData[]);

  // ==================== Resolved Expansion Options ====================
  const renderExpandedRow = propRenderExpandedRow ?? expansionProps?.renderExpandedRow;
  const controlledExpandedRowIds = propExpandedRowIds ?? expansionProps?.expandedRowIds;
  const defaultExpandedRowIds = propDefaultExpandedRowIds ?? expansionProps?.defaultExpandedRowIds;
  const onExpandedRowsChange = propOnExpandedRowsChange ?? expansionProps?.onExpandedRowsChange;
  const isRowExpandable = propIsRowExpandable ?? expansionProps?.isRowExpandable;
  const expandOnRowClick = propExpandOnRowClick ?? expansionProps?.expandOnRowClick;
  const singleExpand = propSingleExpand ?? expansionProps?.singleExpand;

  // ==================== Density State ====================
  const [internalDensity, setInternalDensity] = useState<DataTableDensity>("standard");
  const density = controlledDensity ?? internalDensity;
  const handleDensityChange = useMemoizedFn((d: DataTableDensity) => {
    setInternalDensity(d);
    onDensityChange?.(d);
  });

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
      const isActionCol = col.field === "actions" || col.field === "__actions" || col.field === "__actions__";
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
    // colDef.hidden 与 columnVisibility 两种隐藏机制统一在此收敛，保证表头/表体/表尾一致
    return normalizedColumns.filter((col) => !col.hidden && columnVisibility[col.field] !== false);
  }, [normalizedColumns, columnVisibility]);

  // ==================== Column Resizing (useDataTableResize) ====================
  const { columnWidths, handleResizeStart } = useDataTableResize({
    columns: normalizedColumns,
    storageKey,
  });

  // ==================== Sorting (useDataTableSorting) ====================
  const {
    sortModel,
    handleSortClick: baseHandleSortClick,
    handleSortModelChange,
    sortRows,
  } = useDataTableSorting({
    columns: normalizedColumns,
    sortingMode,
    sortModel: controlledSortModel,
    onSortModelChange,
  });

  const handleSortClick = useMemoizedFn((field: string) => {
    baseHandleSortClick(field);
    onSortChange?.(field, resolveNextSortDirection(sortModel, field));
  });

  // ==================== Filtering (useDataTableFiltering) ====================
  const {
    filterModel,
    quickFilterText,
    filteredRows,
    handleFilterModelChange,
    handleQuickFilterChange: baseHandleQuickFilterChange,
  } = useDataTableFiltering({
    rows,
    columns: normalizedColumns,
    visibleColumns,
    filterMode,
    filterModel: controlledFilterModel,
    onFilterModelChange,
  });

  const handleQuickFilterChange = useMemoizedFn((val: string) => {
    baseHandleQuickFilterChange(val);
    onSearchChange?.(val);
  });

  const isFiltered = Boolean(quickFilterText.trim() || (filterModel.items && filterModel.items.length > 0));

  const handleResetFilters = useMemoizedFn(() => {
    handleFilterModelChange({ items: EMPTY_ARRAY as unknown as DataTableFilterModel["items"] });
    handleQuickFilterChange("");
  });

  // ==================== Row Expansion (useDataTableExpansion) ====================
  const { expandedRowIds, toggleRowExpanded } = useDataTableExpansion({
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

  // ==================== Pagination State ====================
  const [internalPagination, setInternalPagination] = useState<DataTablePaginationModel>({
    page: page ?? initialPaginationModel?.page ?? pagination?.page ?? 1,
    pageSize: pageSize ?? initialPaginationModel?.pageSize ?? pagination?.pageSize ?? DEFAULT_PAGE_SIZE,
  });

  const effectivePage = page ?? controlledPaginationModel?.page ?? internalPagination.page;
  const effectivePageSize = pageSize ?? controlledPaginationModel?.pageSize ?? internalPagination.pageSize;

  const paginationModel = useMemo(
    () => ({ page: effectivePage, pageSize: effectivePageSize }),
    [effectivePage, effectivePageSize],
  );

  const handlePaginationModelChange = useMemoizedFn((model: DataTablePaginationModel) => {
    setInternalPagination(model);
    if (model.page !== effectivePage) {
      onPageChange?.(model.page);
    }
    if (model.pageSize !== effectivePageSize) {
      onPageSizeChange?.(model.pageSize);
    }
    onPaginationModelChange?.(model);
  });

  const totalRowCount =
    paginationMode === "server" ? (total ?? customRowCount ?? rows.length) : processedRows.length;

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
    selection,
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

  // ==================== Virtualization ====================
  const tableContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line react/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: pagedRows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => (density === "compact" ? 36 : density === "comfortable" ? 64 : 48),
    overscan: 5,
    enabled: virtualize,
  });

  const onSelectAllOnPage = useMemoizedFn((checked: boolean) => {
    handleSelectAll(checked, pagedRows);
  });

  // Context Provider Value for deep tree re-render isolation & zero props-drilling
  const contextValue = useMemo<DataTableContextValue<TData>>(
    () => ({
      columns: normalizedColumns,
      visibleColumns,
      columnWidths,
      pinnedLeftFields,
      pinnedRightFields,
      leftOffsets,
      rightOffsets,
      density,
      densityRowClass,
      checkboxSelection,
      getRowId,
      isRowSelectable,
      renderExpandedRow,
      expandedRowIds,
      isRowExpandable,
      expandOnRowClick,
      toggleRowExpanded,
      slots,
      slotProps,
      emptyState,
      emptyMessage,
      noResultsMessage,
      resetFiltersText,
      loadingText,
      onSelectRow: handleSelectRow,
      onRowClick,
      handleResizeStart,
      handleSortClick,
    }),
    [
      normalizedColumns,
      visibleColumns,
      columnWidths,
      pinnedLeftFields,
      pinnedRightFields,
      leftOffsets,
      rightOffsets,
      density,
      densityRowClass,
      checkboxSelection,
      getRowId,
      isRowSelectable,
      renderExpandedRow,
      expandedRowIds,
      isRowExpandable,
      expandOnRowClick,
      toggleRowExpanded,
      slots,
      slotProps,
      emptyState,
      emptyMessage,
      noResultsMessage,
      resetFiltersText,
      loadingText,
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
            <DataTableFilterPanel
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
          }}
          className="relative w-full max-w-full min-w-0 overflow-auto [&_[data-slot=table-container]]:overflow-visible"
        >
          {loading && pagedRows.length > 0 && (
            <DataTableBackdropLoader slots={slots} loadingText={loadingText} />
          )}

          <Table className={cn("w-full border-collapse", tableClassName)} aria-busy={loading}>
            <DataTableHeader
              visibleColumns={visibleColumns}
              checkboxSelection={checkboxSelection}
              hasExpandColumn={Boolean(renderExpandedRow)}
              isAllPageSelected={isAllPageSelected}
              isSomePageSelected={isSomePageSelected}
              onSelectAll={onSelectAllOnPage}
              columnWidths={columnWidths}
              pinnedLeftFields={pinnedLeftFields}
              pinnedRightFields={pinnedRightFields}
              leftOffsets={leftOffsets}
              rightOffsets={rightOffsets}
              sortModel={sortModel}
              onSortClick={handleSortClick}
              onResizeStart={handleResizeStart}
            />

            <DataTableBody
              loading={loading}
              virtualize={virtualize}
              pagedRows={pagedRows}
              visibleColumns={visibleColumns}
              getRowId={getRowId}
              selection={selection}
              checkboxSelection={checkboxSelection}
              isRowSelectable={isRowSelectable}
              renderExpandedRow={renderExpandedRow}
              expandedRowIds={expandedRowIds}
              toggleRowExpanded={toggleRowExpanded}
              isRowExpandable={isRowExpandable}
              expandOnRowClick={expandOnRowClick}
              pinnedLeftFields={pinnedLeftFields}
              pinnedRightFields={pinnedRightFields}
              leftOffsets={leftOffsets}
              rightOffsets={rightOffsets}
              columnWidths={columnWidths}
              densityRowClass={densityRowClass}
              rowVirtualizer={rowVirtualizer}
              emptyState={emptyState}
              emptyMessage={emptyMessage}
              noResultsMessage={noResultsMessage}
              resetFiltersText={resetFiltersText}
              loadingText={loadingText}
              isFiltered={isFiltered}
              onResetFilters={handleResetFilters}
              skeletonRowCount={paginationModel.pageSize}
              slots={slots}
              onSelectRow={handleSelectRow}
              onRowClick={onRowClick}
            />

            {summaryRow && pagedRows.length > 0 && !loading && (
              <TableFooter className="border-border/80 bg-muted/90 sticky bottom-0 z-20 border-t-2 backdrop-blur-xs">
                <DataTableSummaryRow
                  columns={visibleColumns}
                  rows={processedRows}
                  checkboxSelection={checkboxSelection}
                  hasExpandColumn={Boolean(renderExpandedRow)}
                />
              </TableFooter>
            )}
          </Table>
        </div>

        {/* Pagination Footer */}
        {!hidePagination && (
          <DataTablePagination
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            rowCount={totalRowCount}
            pageSizeOptions={pageSizeOptions}
            variant={paginationVariant}
          />
        )}

        {/* Floating Batch Action Bar */}
        {checkboxSelection && selectedFullRows.length > 0 && (
          <DataTableBatchActionBar
            selectedRows={selectedFullRows}
            onClearSelection={clearSelection}
            batchActions={batchActions}
          />
        )}

        {/* WCAG 2.1 AA Screen Reader Live Region for status announcements */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {loading
            ? loadingText
            : `${totalRowCount} records available${isFiltered ? ", filtered" : ""}${selectedFullRows.length > 0 ? `, ${selectedFullRows.length} selected` : ""}`}
        </div>
      </div>
    </DataTableProvider>
  );
}
