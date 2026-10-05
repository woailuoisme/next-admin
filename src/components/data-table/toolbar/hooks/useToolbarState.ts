import type { InternalDataTableToolbarProps } from "../types";

import { EMPTY_ARRAY, EMPTY_RECORD, NOOP } from "../../core/constants";
import { useOptionalDataTableContext } from "../../core/data-table-context";

const EMPTY_FILTER_MODEL = { items: EMPTY_ARRAY };

/**
 * 解析工具栏的受控 / 非受控状态，统一收敛 props → context 的兜底与默认引用
 */
export function useToolbarState<TData = any>(props: InternalDataTableToolbarProps<TData>) {
  const ctx = useOptionalDataTableContext<TData>();

  const columns = props.columns ?? ctx?.columns ?? EMPTY_ARRAY;
  const columnVisibility = props.columnVisibility ?? EMPTY_RECORD;
  const onColumnVisibilityChange = props.onColumnVisibilityChange ?? NOOP;
  const filterModel = props.filterModel ?? EMPTY_FILTER_MODEL;
  const onFilterModelChange = props.onFilterModelChange ?? NOOP;
  const density = props.density ?? ctx?.density ?? "standard";
  const onDensityChange = props.onDensityChange ?? NOOP;
  const quickFilterValue = props.quickFilterValue ?? "";
  const onQuickFilterChange = props.onQuickFilterChange ?? NOOP;
  const onExportExcel = props.onExportExcel ?? NOOP;
  const onExportCsv = props.onExportCsv ?? NOOP;
  const onExportJson = props.onExportJson ?? NOOP;
  const onPrint = props.onPrint ?? NOOP;
  const toolbarProps = props.toolbarProps ?? ctx?.slotProps?.toolbar ?? EMPTY_RECORD;

  const tabs = props.tabs ?? toolbarProps.tabs;
  const activeTab = props.activeTab ?? toolbarProps.activeTab;
  const onTabChange = props.onTabChange ?? toolbarProps.onTabChange ?? NOOP;
  const savedViews = props.savedViews ?? toolbarProps.savedViews;
  const activeViewId = props.activeViewId;
  const onApplyView = props.onApplyView ?? NOOP;
  const onSaveCurrentView = props.onSaveCurrentView ?? NOOP;
  const onDeleteView = props.onDeleteView;
  const enableSavedViews =
    props.enableSavedViews ??
    toolbarProps.enableSavedViews ??
    Boolean(savedViews && savedViews.length > 0);

  const showQuickFilter = props.showQuickFilter ?? toolbarProps.showQuickFilter ?? true;
  const showColumns = props.showColumns ?? toolbarProps.showColumns ?? true;
  const showFilters = props.showFilters ?? toolbarProps.showFilters ?? true;
  const showDensity = props.showDensity ?? toolbarProps.showDensity ?? true;
  const showExport = props.showExport ?? toolbarProps.showExport ?? true;
  const quickFilterPlaceholder =
    props.quickFilterPlaceholder ?? toolbarProps.quickFilterPlaceholder ?? "Search records...";

  return {
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
    toolbarProps,
    customActions: props.customActions,
    filterConfig: props.filterConfig,
    filters: props.filters,
    data: props.data,
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
  };
}
