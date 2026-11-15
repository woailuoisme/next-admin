import type { DataTableColDef, DataTableFilterDefinition, DataTableFilterItem } from "../../core/types";

/** Internal synthetic/action column field identifiers excluded from column toggles, filter inference, and QueryBuilder */
export const SYSTEM_COLUMN_FIELDS = new Set(["__checkbox__", "__actions__", "__actions", "actions"]);

export function isSystemColumn<TData = any>(col: Pick<DataTableColDef<TData>, "field" | "type">): boolean {
  return col.type === "actions" || Boolean(col.field && SYSTEM_COLUMN_FIELDS.has(col.field));
}

export function resolveFilterField(def: DataTableFilterDefinition, fallbackIndex?: number): string {
  return def.field ?? def.name ?? def.columnField ?? (fallbackIndex !== undefined ? `filter-${fallbackIndex}` : "");
}

export function isActiveFilterItem(item: DataTableFilterItem): boolean {
  return (
    item.operator === "isEmpty" ||
    item.operator === "isNotEmpty" ||
    (item.value !== undefined && item.value !== "" && item.value !== "__all__")
  );
}

export function isQueryBuilderRule(item: DataTableFilterItem): boolean {
  return Boolean(item.id?.startsWith("qb_"));
}
