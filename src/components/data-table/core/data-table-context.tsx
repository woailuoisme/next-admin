import type React from "react";

import { createContext, useContext } from "react";

import type {
  DataTableColDef,
  DataTableDensity,
  DataTableRenderExpandedRowParams,
  DataTableRowId,
  DataTableSlotProps,
  DataTableSlots,
  TableEmptyStateConfig,
  TableEmptyStateContext,
} from "./types";

export interface DataTableContextValue<TData = unknown> {
  // Column metadata & layout
  columns: DataTableColDef<TData>[];
  visibleColumns: DataTableColDef<TData>[];
  columnWidths: Record<string, number>;
  pinnedLeftFields: string[];
  pinnedRightFields: string[];
  leftOffsets: Record<string, number>;
  rightOffsets: Record<string, number>;
  density: DataTableDensity;
  densityRowClass: string;

  // Selection & identification
  checkboxSelection: boolean;
  getRowId: (row: TData) => DataTableRowId;
  isRowSelectable?: (row: TData) => boolean;

  // Row Expansion
  renderExpandedRow?: (params: DataTableRenderExpandedRowParams<TData>) => React.ReactNode;
  expandedRowIds?: DataTableRowId[];
  isRowExpandable?: (row: TData) => boolean;
  expandOnRowClick?: boolean;
  toggleRowExpanded?: (id: DataTableRowId) => void;

  // Customization slots & text
  slots?: DataTableSlots;
  slotProps?: DataTableSlotProps;
  emptyState?:
    | React.ReactNode
    | TableEmptyStateConfig
    | ((context: TableEmptyStateContext) => React.ReactNode);
  emptyMessage?: string;
  noResultsMessage?: string;
  resetFiltersText?: string;
  loadingText?: string;

  // Stabilized callback functions
  onSelectRow: (id: DataTableRowId, checked: boolean, row: TData) => void;
  onRowClick?: (row: TData, event: React.MouseEvent) => void;
  handleResizeStart: (field: string, initialWidth: number, e: React.MouseEvent) => void;
  handleSortClick: (field: string) => void;
}

const DataTableContext = createContext<DataTableContextValue<any> | null>(null);

export interface DataTableProviderProps<TData = any> {
  value: DataTableContextValue<TData>;
  children: React.ReactNode;
}

export function DataTableProvider<TData = any>({ value, children }: DataTableProviderProps<TData>) {
  return <DataTableContext value={value}>{children}</DataTableContext>;
}

export function useDataTableContext<TData = unknown>(): DataTableContextValue<TData> {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error("useDataTableContext must be used within a DataTable component or DataTableProvider.");
  }
  return context as DataTableContextValue<TData>;
}

export function useOptionalDataTableContext<TData = unknown>(): DataTableContextValue<TData> | null {
  return useContext(DataTableContext) as DataTableContextValue<TData> | null;
}
