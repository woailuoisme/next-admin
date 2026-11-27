import type React from "react";
import type { TableEmptyStateConfig, TableEmptyStateContext } from "../empty-state";
import type {
  DataTableCustomFilterDef,
  DataTableFilterConfig,
  DataTableFilterDefinition,
  DataTableFilterItem,
  DataTableFilterLayout,
  DataTableFilterModel,
  DataTableFilterOperator,
  DataTableSelectFilterDef,
  DataTableSelectFilterOption,
  DataTableTernaryFilterDef,
} from "./filterTypes";

export type {
  DataTableCustomFilterDef,
  DataTableFilterConfig,
  DataTableFilterDefinition,
  DataTableFilterItem,
  DataTableFilterLayout,
  DataTableFilterModel,
  DataTableFilterOperator,
  DataTableSelectFilterDef,
  DataTableSelectFilterOption,
  DataTableTernaryFilterDef,
};

export type DataTableAlignment = "left" | "center" | "right";

/** 行激活事件：鼠标点击与键盘 Enter/Space 共用同一回调签名 */
export type RowActivationEvent = React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;

export type DataTableColType = "string" | "number" | "date" | "dateTime" | "boolean" | "singleSelect" | "actions";

export interface DataTableRenderCellParams<TData = any, TValue = any> {
  value: TValue;
  row: TData;
  field: string;
  colDef: DataTableColDef<TData, TValue>;
  index: number;
}

export interface DataTableRenderHeaderParams<TData = any> {
  colDef: DataTableColDef<TData>;
  headerName: string;
}

export type DataTableAggregationType =
  | "sum"
  | "avg"
  | "min"
  | "max"
  | "count"
  | ((values: unknown[], rows: unknown[]) => unknown);

export interface DataTableColDef<TData = any, TValue = any> {
  /**
   * Unique identifier for the column. Defaults to `field` if not provided.
   */
  id?: string;
  field: string;
  headerName: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;
  type?: DataTableColType;
  align?: DataTableAlignment;
  headerAlign?: DataTableAlignment;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  pinned?: "left" | "right" | false;
  hidden?: boolean;
  description?: string;
  valueGetter?: (row: TData) => unknown;
  valueFormatter?: (value: TValue, row: TData) => string;
  renderCell?: (params: DataTableRenderCellParams<TData, TValue>) => React.ReactNode;
  renderHeader?: (params: DataTableRenderHeaderParams<TData>) => React.ReactNode;
  aggregation?: DataTableAggregationType;
  cellClassName?: string | ((params: DataTableRenderCellParams<TData>) => string | undefined);
  headerClassName?: string;
  valueOptions?: Array<string | { label: string; value: string }>;
}

export type DataTableSortDirection = "asc" | "desc" | null | undefined;

export interface DataTableSortItem {
  field: string;
  sort: "asc" | "desc";
}

export type DataTableSortModel = DataTableSortItem[];

export type DataTableDensity = "compact" | "standard" | "comfortable";

export interface DataTablePaginationModel {
  page: number;
  pageSize: number;
}

export type DataTableRowId = string | number;
export type DataTableRowSelectionModel = DataTableRowId[];

export interface DataTablePinnedColumns {
  left?: string[];
  right?: string[];
}

export interface DataTableRenderExpandedRowParams<TData = any> {
  row: TData;
  index: number;
  collapse: () => void;
}

export interface DataTableExpansionProps<TData = any> {
  renderExpandedRow?: (params: DataTableRenderExpandedRowParams<TData>) => React.ReactNode;
  expandedRowIds?: DataTableRowId[];
  defaultExpandedRowIds?: DataTableRowId[];
  onExpandedRowsChange?: (expandedRowIds: DataTableRowId[]) => void;
  isRowExpandable?: (row: TData) => boolean;
  expandOnRowClick?: boolean;
  singleExpand?: boolean;
}

export interface DataTableTabItem<TData = any> {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeVariant?: "default" | "secondary" | "outline" | "destructive";
  filterModel?: DataTableFilterModel;
  filterFn?: (row: TData) => boolean;
}

export interface DataTableSavedView {
  id: string;
  name: string;
  icon?: string;
  isDefault?: boolean;
  isSystem?: boolean;
  filterModel?: DataTableFilterModel;
  sortModel?: DataTableSortModel;
  columnVisibilityModel?: Record<string, boolean>;
  density?: DataTableDensity;
}

export interface DataTableToolbarProps {
  showQuickFilter?: boolean;
  showColumns?: boolean;
  showFilters?: boolean;
  showDensity?: boolean;
  showExport?: boolean;
  exportFileName?: string;
  quickFilterPlaceholder?: string;
  quickFilterEntity?: string;
  filterConfig?: DataTableFilterConfig;
  filters?: DataTableFilterDefinition[];
  tabs?: DataTableTabItem<any>[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  savedViews?: DataTableSavedView[];
  enableSavedViews?: boolean;
  customActions?: React.ReactNode;
}

export interface DataTableSlots {
  toolbar?: React.ComponentType<any>;
  loadingOverlay?: React.ComponentType<any>;
  pagination?: React.ComponentType<any>;
}

export interface DataTableSlotProps {
  toolbar?: DataTableToolbarProps;
  loadingOverlay?: Record<string, unknown>;
}

/**
 * TableStateAdapter (State Seam):
 * Unified table state interface consolidating data, pagination, sorting, and search coordination.
 */
export interface TableStateAdapter<TData = any> {
  data: TData[];
  total: number;
  loading: boolean;
  paginationMode?: "client" | "server";
  page: number;
  pageSize: number;
  sortModel?: DataTableSortModel;
  filterModel?: DataTableFilterModel;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (field: string, direction: "asc" | "desc" | null) => void;
  onSearchChange?: (val: string) => void;
  onFilterModelChange?: (model: DataTableFilterModel) => void;
  onSortModelChange?: (model: DataTableSortModel) => void;
}

export interface DataTableProps<TData = any> extends DataTableExpansionProps<TData> {
  state?: TableStateAdapter<TData>;
  data?: TData[];
  columns: DataTableColDef<TData>[];
  getRowId?: (row: TData) => DataTableRowId;
  loading?: boolean;
  checkboxSelection?: boolean;
  rowSelectionModel?: DataTableRowSelectionModel;
  onRowSelectionModelChange?: (selection: DataTableRowSelectionModel, selectedRows: TData[]) => void;
  onSelectedRowsChange?: (selectedRows: TData[]) => void;
  isRowSelectable?: (row: TData) => boolean;
  paginationMode?: "client" | "server";
  pageSize?: number;
  paginationModel?: DataTablePaginationModel;
  onPaginationModelChange?: (model: DataTablePaginationModel) => void;
  pageSizeOptions?: readonly number[];
  hidePagination?: boolean;
  paginationVariant?: "capsule" | "shadcn" | "simple";
  sortingMode?: "client" | "server";
  sortModel?: DataTableSortModel;
  onSortModelChange?: (model: DataTableSortModel) => void;
  filterMode?: "client" | "server";
  filterModel?: DataTableFilterModel;
  onFilterModelChange?: (model: DataTableFilterModel) => void;
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
  density?: DataTableDensity;
  onDensityChange?: (density: DataTableDensity) => void;
  columnVisibilityModel?: Record<string, boolean>;
  onColumnVisibilityModelChange?: (model: Record<string, boolean>) => void;
  pinnedColumns?: DataTablePinnedColumns;
  storageKey?: string;
  showToolbar?: boolean;
  summaryRow?: boolean;
  summaryLabel?: string;
  virtualize?: boolean;
  maxHeight?: number | string;
  onRowClick?: (row: TData, event: RowActivationEvent) => void;
  batchActions?: (selectedRows: TData[], clearSelection: () => void) => React.ReactNode;
  className?: string;
  tableClassName?: string;
  slots?: DataTableSlots;
  slotProps?: DataTableSlotProps;
  emptyState?: React.ReactNode | TableEmptyStateConfig | ((context: TableEmptyStateContext) => React.ReactNode);
  emptyMessage?: string;
  noResultsMessage?: string;
  resetFiltersText?: string;
  loadingText?: string;
}

export type {
  TableEmptyStateAction,
  TableEmptyStateConfig,
  TableEmptyStateContext,
  TableEmptyStateIconColor,
  TableEmptyStateProps,
  TableEmptyStateSize,
} from "../empty-state/types";
