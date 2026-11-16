import type React from "react";

import { createContext, useContext } from "react";

import type {
  DataTableColDef,
  DataTableDensity,
  DataTableRenderExpandedRowParams,
  DataTableRowId,
  DataTableSlotProps,
  DataTableSlots,
  RowActivationEvent,
  TableEmptyStateConfig,
  TableEmptyStateContext,
} from "./types";

export interface DataTableConfigContextValue<TData = unknown> {
  // Column metadata & layout (static / low-frequency only — volatile widths & offsets live in LayoutSeam CSS vars)
  columns: DataTableColDef<TData>[];
  visibleColumns: DataTableColDef<TData>[];
  pinnedLeftFields: string[];
  pinnedRightFields: string[];
  density: DataTableDensity;
  densityRowClass: string;

  // Selection & identification
  checkboxSelection: boolean;
  getRowId: (row: TData) => DataTableRowId;
  isRowSelectable?: (row: TData) => boolean;

  // Row Expansion (static config & callbacks — expanded state passed per-row via boolean prop)
  renderExpandedRow?: (params: DataTableRenderExpandedRowParams<TData>) => React.ReactNode;
  isRowExpandable?: (row: TData) => boolean;
  expandOnRowClick?: boolean;
  toggleRowExpanded?: (id: DataTableRowId) => void;

  // Customization slots & text
  slots?: DataTableSlots;
  slotProps?: DataTableSlotProps;

  emptyState?: React.ReactNode | TableEmptyStateConfig | ((context: TableEmptyStateContext) => React.ReactNode);
  emptyMessage?: string;
  noResultsMessage?: string;
  resetFiltersText?: string;
  loadingText?: string;
  summaryLabel?: string;

  // Stabilized callback functions
  onSelectRow: (id: DataTableRowId, checked: boolean, row: TData) => void;
  onRowClick?: (row: TData, event: RowActivationEvent) => void;
  handleResizeStart: (field: string, initialWidth: number, e: React.MouseEvent) => void;
  handleResizeStep: (field: string, delta: number) => void;
  handleSortClick: (field: string) => void;
}

/** @deprecated Use DataTableConfigContextValue */
export type DataTableContextValue<TData = unknown> = DataTableConfigContextValue<TData>;

const DataTableConfigContext = createContext<DataTableConfigContextValue<any> | null>(null);

export interface DataTableProviderProps<TData = any> {
  value: DataTableConfigContextValue<TData>;
  children: React.ReactNode;
}

export function DataTableProvider<TData = any>({ value, children }: DataTableProviderProps<TData>) {
  return <DataTableConfigContext value={value}>{children}</DataTableConfigContext>;
}

export function useDataTableContext<TData = unknown>(): DataTableConfigContextValue<TData> {
  const context = useContext(DataTableConfigContext);
  if (!context) {
    throw new Error("useDataTableContext must be used within a DataTable component or DataTableProvider.");
  }
  return context as DataTableConfigContextValue<TData>;
}

export function useOptionalDataTableContext<TData = unknown>(): DataTableConfigContextValue<TData> | null {
  return useContext(DataTableConfigContext) as DataTableConfigContextValue<TData> | null;
}
