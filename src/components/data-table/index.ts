// Core Data Table
export { DataTable } from "./core/data-table";
export {
  DataTableProvider,
  useDataTableContext,
  useOptionalDataTableContext,
  type DataTableContextValue,
} from "./core/data-table-context";
export * from "./core/types";
export * from "./core/constants";
export { baseTableSearchSchema, type BaseTableSearchParams } from "./core/table-search-schema";

// Resource Table
export { ResourceTable, type ResourceTableProps } from "./resource-table/resource-table";

// Hooks
export {
  useResourceTable,
  type UseResourceTableOptions,
  type UseResourceTableReturn,
} from "./hooks/use-resource-table";
export * from "./hooks";

// Columns & Cells
export * from "./columns";
export * from "./cells";

// Empty State
export { TableEmptyState, type TableEmptyStateProps } from "./empty-state";

// Toolbar
export { DataTableToolbar } from "./toolbar/DataTableToolbar";

// Dialog state helpers
export {
  useResourceModalState,
  type UseResourceModalStateOptions,
  type ResourceModalState,
} from "../dialogs";

// Backward compatibility aliases
export { DataTable as DataGrid } from "./core/data-table";
export {
  DataTableProvider as DataGridProvider,
  useDataTableContext as useDataGridContext,
  useOptionalDataTableContext as useOptionalDataGridContext,
} from "./core/data-table-context";
export { ResourceTable as ResourceGrid } from "./resource-table/resource-table";
