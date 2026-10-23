import type React from "react";
import type { DataTableEmptyStateConfig, DataTableEmptyStateContext } from "../empty-state";

export type DataTableAlignment = "left" | "center" | "right";

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

export type DataTableFilterOperator =
  | "contains"
  | "notContains"
  | "equals"
  | "notEquals"
  | "startsWith"
  | "endsWith"
  | "isEmpty"
  | "isNotEmpty"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "is";

export interface DataTableFilterItem {
  id: string;
  field: string;
  operator: DataTableFilterOperator;
  value?: any;
}

export interface DataTableFilterModel {
  items: DataTableFilterItem[];
  quickFilterValues?: string[];
}

export type DataTableFilterLayout = "popover" | "sheet" | "aboveContent";

export interface DataTableSelectFilterOption {
  label: string;
  value: string | number;
  badge?: string | number;
  badgeColor?: string;
}

export interface DataTableSelectFilterDef {
  type: "select";
  field?: string;
  name?: string;
  columnField?: string;
  label?: string;
  options: DataTableSelectFilterOption[];
  multiple?: boolean;
  placeholder?: string;
}

export interface DataTableTernaryFilterDef {
  type: "ternary";
  field?: string;
  name?: string;
  columnField?: string;
  label?: string;
  trueLabel?: string;
  falseLabel?: string;
  placeholder?: string;
}

export interface DataTableCustomFilterDef {
  type: "custom";
  field?: string;
  name?: string;
  columnField?: string;
  label?: string;
  render: (props: { value: any; onChange: (val: any) => void; filterItem?: DataTableFilterItem }) => React.ReactNode;
}

export type DataTableFilterDefinition = DataTableSelectFilterDef | DataTableTernaryFilterDef | DataTableCustomFilterDef;

export interface DataTableFilterConfig {
  layout?: DataTableFilterLayout;
  columns?: 1 | 2 | 3 | 4;
  deferFilters?: boolean;
  sheetTitle?: string;
  sheetDescription?: string;
  filters?: DataTableFilterDefinition[];
  showQueryBuilder?: boolean;
  showActiveFiltersPills?: boolean;
  maxHeight?: number | string;
}

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
}

export interface DataTableSlots {
  toolbar?: React.ComponentType<any>;
  noRowsOverlay?: React.ComponentType<any>;
  noResultsOverlay?: React.ComponentType<any>;
  loadingOverlay?: React.ComponentType<any>;
  pagination?: React.ComponentType<any>;
}

export interface DataTableSlotProps {
  toolbar?: DataTableToolbarProps;
  noRowsOverlay?: Record<string, unknown>;
  noResultsOverlay?: Record<string, unknown>;
  loadingOverlay?: Record<string, unknown>;
}

export interface DataTableProps<TData = any> extends DataTableExpansionProps<TData> {
  rows?: TData[];
  data?: TData[];
  columns: DataTableColDef<TData>[];
  getRowId?: (row: TData) => DataTableRowId;
  loading?: boolean;

  // Row Expansion (grouped option)
  expansionProps?: DataTableExpansionProps<TData>;

  // Selection
  checkboxSelection?: boolean;
  rowSelectionModel?: DataTableRowSelectionModel;
  onRowSelectionModelChange?: (selection: DataTableRowSelectionModel, selectedRows: TData[]) => void;
  onSelectedRowsChange?: (selectedRows: TData[]) => void;
  isRowSelectable?: (row: TData) => boolean;

  // Pagination
  pagination?: { page?: number; pageSize?: number };
  initialPaginationModel?: Partial<DataTablePaginationModel>;
  paginationMode?: "client" | "server";
  rowCount?: number;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  paginationModel?: DataTablePaginationModel;
  onPaginationModelChange?: (model: DataTablePaginationModel) => void;
  pageSizeOptions?: readonly number[];
  hidePagination?: boolean;
  paginationVariant?: "capsule" | "shadcn" | "simple";

  // Sorting
  sortingMode?: "client" | "server";
  sortModel?: DataTableSortModel;
  onSortModelChange?: (model: DataTableSortModel) => void;
  onSortChange?: (field: string, direction: "asc" | "desc" | null) => void;

  // Filtering
  filterMode?: "client" | "server";
  filterModel?: DataTableFilterModel;
  onFilterModelChange?: (model: DataTableFilterModel) => void;
  onSearchChange?: (search: string) => void;
  filterConfig?: DataTableFilterConfig;
  filters?: DataTableFilterDefinition[];

  // Tabs & Saved Views
  tabs?: DataTableTabItem<TData>[];
  activeTab?: string;
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  savedViews?: DataTableSavedView[];
  defaultSavedViews?: DataTableSavedView[];
  onSavedViewsChange?: (views: DataTableSavedView[]) => void;
  enableSavedViews?: boolean;

  // Density
  density?: DataTableDensity;
  onDensityChange?: (density: DataTableDensity) => void;

  // Columns & Pinning
  columnVisibilityModel?: Record<string, boolean>;
  onColumnVisibilityModelChange?: (model: Record<string, boolean>) => void;
  pinnedColumns?: DataTablePinnedColumns;
  storageKey?: string;

  // Advanced features
  showToolbar?: boolean;
  summaryRow?: boolean;
  summaryLabel?: string;
  virtualize?: boolean;
  maxHeight?: number | string;
  onRowClick?: (row: TData, event: React.MouseEvent) => void;
  batchActions?: (selectedRows: TData[], clearSelection: () => void) => React.ReactNode;

  // Customization
  className?: string;
  tableClassName?: string;
  slots?: DataTableSlots;
  slotProps?: DataTableSlotProps;
  emptyState?: React.ReactNode | DataTableEmptyStateConfig | ((context: DataTableEmptyStateContext) => React.ReactNode);
  emptyMessage?: string;
  noResultsMessage?: string;
  resetFiltersText?: string;
  loadingText?: string;
}

// Re-export empty-state types for convenience
export type * from "../empty-state/types";

// Backward compatibility aliases
export type GridColDef<TData = any> = DataTableColDef<TData>;
export type GridRenderCellParams<TData = any> = DataTableRenderCellParams<TData>;
export type GridRenderHeaderParams<TData = any> = DataTableRenderHeaderParams<TData>;
export type DataGridProps<TData = any> = DataTableProps<TData>;
