// Root entry intentionally kept minimal to enforce subpath imports and prevent barrel bloat.
// Prefer importing from "@/components/data-table/core", "@/components/data-table/columns/*",
// "@/components/data-table/cells/*", or "@/components/data-table/hooks/*".
export { DataTable } from "./core/DataTable";
export type {
  DataTableColDef,
  DataTableFilterDefinition,
  DataTableFilterLayout,
  DataTableProps,
  DataTableRenderCellParams,
  DataTableSavedView,
  DataTableTabItem,
  TableStateAdapter,
} from "./core/types";
