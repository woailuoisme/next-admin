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

export interface DataTableConfigContextValue<TData = any> {
	columns: DataTableColDef<TData>[];
	columnByField: Map<string, DataTableColDef<TData>>;
	visibleColumns: DataTableColDef<TData>[];
	pinnedLeftFields: string[];
	pinnedRightFields: string[];
	density: DataTableDensity;
	densityRowClass: string;

	checkboxSelection: boolean;
	getRowId: (row: TData) => DataTableRowId;
	isRowSelectable?: (row: TData) => boolean;

	renderExpandedRow?: (params: DataTableRenderExpandedRowParams<TData>) => React.ReactNode;
	isRowExpandable?: (row: TData) => boolean;
	expandOnRowClick?: boolean;
	toggleRowExpanded?: (id: DataTableRowId) => void;

	slots?: DataTableSlots;
	slotProps?: DataTableSlotProps;

	emptyState?: React.ReactNode | TableEmptyStateConfig | ((context: TableEmptyStateContext) => React.ReactNode);
	emptyMessage?: string;
	noResultsMessage?: string;
	resetFiltersText?: string;
	loadingText?: string;
	summaryLabel?: string;

	onSelectRow: (id: DataTableRowId, checked: boolean, row: TData) => void;
	onRowClick?: (row: TData, event: RowActivationEvent) => void;
	getColumnWidth: (field: string, fallbackWidth?: number) => number;
	handleResizeStart: (field: string, initialWidth: number, e: React.MouseEvent) => void;
	handleResizeStep: (field: string, delta: number) => void;
	handleSortClick: (field: string) => void;
}

const DataTableConfigContext = createContext<DataTableConfigContextValue<any> | null>(null);

export interface DataTableProviderProps<TData = any> {
	value: DataTableConfigContextValue<TData>;
	children: React.ReactNode;
}

export function DataTableProvider<TData = any>({ value, children }: DataTableProviderProps<TData>) {
	return <DataTableConfigContext value={value}>{children}</DataTableConfigContext>;
}

export function useDataTableContext<TData = any>(): DataTableConfigContextValue<TData> {
	const context = useContext(DataTableConfigContext);
	if (!context) {
		throw new Error("useDataTableContext must be used within a DataTable component or DataTableProvider.");
	}
	return context as DataTableConfigContextValue<TData>;
}

export function useOptionalDataTableContext<TData = any>(): DataTableConfigContextValue<TData> | null {
	return useContext(DataTableConfigContext) as DataTableConfigContextValue<TData> | null;
}
