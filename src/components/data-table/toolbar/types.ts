import type React from "react";

import type {
  DataTableColDef,
  DataTableDensity,
  DataTableFilterModel,
  DataTableTabItem,
  DataTableToolbarProps,
} from "../core/types";

/**
 * 完整内部工具栏属性（支持 Props 显式传入或从 Context 自动获取）
 * 展示层开关与筛选项直接继承 DataTableToolbarProps，避免逐项重复声明
 */
export interface InternalDataTableToolbarProps<TData = any> extends DataTableToolbarProps {
  columns?: DataTableColDef<TData>[];
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (v: Record<string, boolean>) => void;
  filterModel?: DataTableFilterModel;
  onFilterModelChange?: (m: DataTableFilterModel) => void;
  density?: DataTableDensity;
  onDensityChange?: (d: DataTableDensity) => void;
  quickFilterValue?: string;
  onQuickFilterChange?: (val: string) => void;
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  onExportJson?: () => void;
  onPrint?: () => void;
  toolbarProps?: DataTableToolbarProps;
  customActions?: React.ReactNode;
  data?: TData[];

  // 标签页与已存视图
  tabs?: DataTableTabItem<TData>[];
  activeViewId?: string | null;
  onApplyView?: (viewId: string) => void;
  onSaveCurrentView?: (name: string) => void;
  onDeleteView?: (viewId: string) => void;
}

/**
 * 快速搜索（QuickFilter）控件属性
 */
export interface DataTableQuickFilterProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  debounceWait?: number;
  className?: string;
}

/**
 * 表格密度切换（DensityMenu）控件属性
 */
export interface DataTableDensityMenuProps {
  density?: DataTableDensity;
  onDensityChange?: (density: DataTableDensity) => void;
}

/**
 * 导出与打印（ExportMenu）控件属性
 */
export interface DataTableExportMenuProps {
  onExportCsv?: () => void;
  onExportJson?: () => void;
  onExportExcel?: () => void;
  onPrint?: () => void;
}

/**
 * 列可见性管理（ColumnsPanel）控件属性
 */
export interface DataTableColumnsPanelProps<TData = any> {
  columns: DataTableColDef<TData>[];
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (newVisibility: Record<string, boolean>) => void;
}
