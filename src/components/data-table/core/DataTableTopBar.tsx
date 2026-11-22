"use client";

import dynamic from "next/dynamic";

import { useDataTableExport } from "../hooks/useDataTableExport";
import { useDataTableViews } from "../hooks/useDataTableViews";
import { DataTableToolbar } from "../toolbar/DataTableToolbar";
import type { DataTableFilterPanelProps } from "../toolbar/filters/types";
import type {
	DataTableColDef,
	DataTableDensity,
	DataTableFilterConfig,
	DataTableFilterDefinition,
	DataTableFilterModel,
	DataTableSavedView,
	DataTableSlots,
	DataTableSlotProps,
	DataTableSortModel,
	DataTableTabItem,
} from "./types";

const LazyFilterPanel = dynamic(() =>
	import("../toolbar/filters/FilterRegistry").then((mod) => mod.DataTableFilterPanel),
) as <TData = any>(props: DataTableFilterPanelProps<TData>) => React.ReactNode;

export interface DataTableTopChromeProps<TData extends Record<string, any>> {
	showToolbar: boolean;
	slots: DataTableSlots;
	slotProps: DataTableSlotProps;
	rows: TData[];
	normalizedColumns: DataTableColDef<TData>[];
	visibleColumns: DataTableColDef<TData>[];
	selectedFullRows: TData[];
	processedRows: TData[];
	columnVisibility: Record<string, boolean>;
	onColumnVisibilityChange: (v: Record<string, boolean>) => void;
	filterModel: DataTableFilterModel;
	onFilterModelChange: (model: DataTableFilterModel) => void;
	sortModel: DataTableSortModel;
	onSortModelChange: (model: DataTableSortModel) => void;
	quickFilterText: string;
	onQuickFilterChange: (val: string) => void;
	density: DataTableDensity;
	onDensityChange: (density: DataTableDensity) => void;
	filterConfig?: DataTableFilterConfig;
	filters?: DataTableFilterDefinition[];
	tabs?: DataTableTabItem<TData>[];
	activeTab?: string;
	defaultActiveTab?: string;
	onTabChange?: (tabId: string) => void;
	savedViews?: DataTableSavedView[];
	defaultSavedViews?: DataTableSavedView[];
	onSavedViewsChange?: (views: DataTableSavedView[]) => void;
	enableSavedViews?: boolean;
	storageKey?: string;
}

/**
 * DataTable 顶部工具栏与 aboveContent 面板切片（含视图预设与导出编排）。
 */
export function DataTableTopChrome<TData extends Record<string, any>>({
	showToolbar,
	slots,
	slotProps,
	rows,
	normalizedColumns,
	visibleColumns,
	selectedFullRows,
	processedRows,
	columnVisibility,
	onColumnVisibilityChange,
	filterModel,
	onFilterModelChange,
	sortModel,
	onSortModelChange,
	quickFilterText,
	onQuickFilterChange,
	density,
	onDensityChange,
	filterConfig,
	filters,
	tabs,
	activeTab,
	defaultActiveTab,
	onTabChange,
	savedViews: controlledSavedViews,
	defaultSavedViews,
	onSavedViewsChange,
	enableSavedViews,
	storageKey,
}: DataTableTopChromeProps<TData>) {
	const { currentActiveTab, handleTabChange, savedViews, activeViewId, applyView, saveCurrentAsView, deleteView } =
		useDataTableViews<TData>({
			tabs,
			activeTab,
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
			onApplyFilterModel: onFilterModelChange,
			onApplySortModel: onSortModelChange,
			onApplyColumnVisibility: onColumnVisibilityChange,
			onApplyDensity: onDensityChange,
		});

	const { handleExportExcel, handleExportCsv, handleExportJson, handlePrint } = useDataTableExport({
		visibleColumns,
		selectedFullRows,
		processedRows,
		exportFileName: slotProps.toolbar?.exportFileName,
	});

	const ToolbarComponent = slots?.toolbar ?? DataTableToolbar;

	return (
		<>
			{showToolbar && (
				<ToolbarComponent
					columns={normalizedColumns}
					columnVisibility={columnVisibility}
					onColumnVisibilityChange={onColumnVisibilityChange}
					filterModel={filterModel}
					onFilterModelChange={onFilterModelChange}
					density={density}
					onDensityChange={onDensityChange}
					quickFilterValue={quickFilterText}
					onQuickFilterChange={onQuickFilterChange}
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
					savedViews={savedViews}
					activeViewId={activeViewId}
					onApplyView={applyView}
					onSaveCurrentView={saveCurrentAsView}
					onDeleteView={deleteView}
					enableSavedViews={enableSavedViews}
				/>
			)}

			{filterConfig?.layout === "aboveContent" && (
				<div className="border-border/50 bg-card/30 border-b p-2.5">
					<LazyFilterPanel
						columns={normalizedColumns}
						filterModel={filterModel}
						onFilterModelChange={onFilterModelChange}
						filterConfig={filterConfig}
						filters={filters}
						data={rows}
					/>
				</div>
			)}
		</>
	);
}
