import { memo, type ReactElement } from "react";

import type { InternalDataTableToolbarProps } from "./types";

import { DataTableFilterPanel } from "./filters";
import { ActiveFilterPills } from "./filters/layouts/ActiveFilterPills";
import { useToolbarState } from "./hooks/useToolbarState";
import { DataTableColumnsPanel } from "./items/DataTableColumnsPanel";
import { DataTableDensityMenu } from "./items/DataTableDensityMenu";
import { DataTableExportMenu } from "./items/DataTableExportMenu";
import { DataTableQuickFilter } from "./items/DataTableQuickFilter";
import { DataTableSavedViews } from "./items/DataTableSavedViews";
import { DataTableStatusTabs } from "./items/DataTableStatusTabs";

export type { InternalDataTableToolbarProps };

function DataTableToolbarInner<TData = any>(props: InternalDataTableToolbarProps<TData>) {
  const {
    columns,
    columnVisibility,
    onColumnVisibilityChange,
    filterModel,
    onFilterModelChange,
    density,
    onDensityChange,
    quickFilterValue,
    onQuickFilterChange,
    onExportExcel,
    onExportCsv,
    onExportJson,
    onPrint,
    customActions,
    filterConfig,
    filters,
    data,
    tabs,
    activeTab,
    onTabChange,
    savedViews,
    activeViewId,
    onApplyView,
    onSaveCurrentView,
    onDeleteView,
    enableSavedViews,
    showQuickFilter,
    showColumns,
    showFilters,
    showDensity,
    showExport,
    quickFilterPlaceholder,
  } = useToolbarState(props);

  const showActiveFiltersPills = filterConfig?.showActiveFiltersPills ?? true;

  return (
    <div className="border-border/50 flex flex-col border-b">
      {/* Top segmented status tabs (if configured) */}
      {tabs && tabs.length > 0 && activeTab && (
        <div className="bg-card/50 px-2.5 pt-2.5">
          <DataTableStatusTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      )}

      <div className="bg-card/50 flex flex-wrap items-center justify-between gap-3 p-2.5">
        {/* Left controls: Columns, Filters, Density, Export */}
        <div className="flex flex-wrap items-center gap-2">
          {showColumns && (
            <DataTableColumnsPanel
              columns={columns}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={onColumnVisibilityChange}
            />
          )}

          {showFilters && filterConfig?.layout !== "aboveContent" && (
            <DataTableFilterPanel
              columns={columns}
              filterModel={filterModel}
              onFilterModelChange={onFilterModelChange}
              filterConfig={filterConfig}
              filters={filters}
              data={data}
            />
          )}

          {showDensity && (
            <DataTableDensityMenu density={density} onDensityChange={onDensityChange} />
          )}

          {showExport && (
            <DataTableExportMenu
              onExportExcel={onExportExcel}
              onExportCsv={onExportCsv}
              onExportJson={onExportJson}
              onPrint={onPrint}
            />
          )}

          {customActions}
        </div>

        {/* Right controls: Saved Views & Quick filter */}
        <div className="flex items-center gap-2">
          {enableSavedViews && savedViews && (
            <DataTableSavedViews
              views={savedViews}
              activeViewId={activeViewId}
              onApplyView={onApplyView}
              onSaveCurrentView={onSaveCurrentView}
              onDeleteView={onDeleteView}
            />
          )}

          {showQuickFilter && (
            <DataTableQuickFilter
              value={quickFilterValue}
              onChange={onQuickFilterChange}
              placeholder={quickFilterPlaceholder}
            />
          )}
        </div>
      </div>

      {/* Active filter badges / pills */}
      {showActiveFiltersPills && (
        <ActiveFilterPills
          filterModel={filterModel}
          onFilterModelChange={onFilterModelChange}
          columns={columns}
          filters={filters}
        />
      )}
    </div>
  );
}

const MemoizedDataTableToolbar = memo(DataTableToolbarInner);

export interface DataTableToolbarComponent {
  <TData = any>(props: InternalDataTableToolbarProps<TData>): ReactElement | null;
  QuickFilter: typeof DataTableQuickFilter;
  DensityMenu: typeof DataTableDensityMenu;
  ExportMenu: typeof DataTableExportMenu;
  ColumnsPanel: typeof DataTableColumnsPanel;
  FilterPanel: typeof DataTableFilterPanel;
  StatusTabs: typeof DataTableStatusTabs;
  SavedViews: typeof DataTableSavedViews;
}

export const DataTableToolbar = MemoizedDataTableToolbar as unknown as DataTableToolbarComponent;

DataTableToolbar.QuickFilter = DataTableQuickFilter;
DataTableToolbar.DensityMenu = DataTableDensityMenu;
DataTableToolbar.ExportMenu = DataTableExportMenu;
DataTableToolbar.ColumnsPanel = DataTableColumnsPanel;
DataTableToolbar.FilterPanel = DataTableFilterPanel;
DataTableToolbar.StatusTabs = DataTableStatusTabs;
DataTableToolbar.SavedViews = DataTableSavedViews;
