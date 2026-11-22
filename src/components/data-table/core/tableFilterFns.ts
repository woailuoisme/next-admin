import type { ColumnFiltersState } from "@tanstack/react-table";

import type { DataTableColDef, DataTableFilterItem } from "./types";
import { readCellValue } from "./utils";

type NumericComparisonOp = "greaterThan" | "greaterThanOrEqual" | "lessThan" | "lessThanOrEqual";

function compareNumericValue(val: unknown, target: number, op: NumericComparisonOp): boolean {
  if (val === null || val === undefined || val === "") return false;
  const numVal = Number(val);
  if (Number.isNaN(numVal) || Number.isNaN(target)) return false;

  switch (op) {
    case "greaterThan":
      return numVal > target;
    case "greaterThanOrEqual":
      return numVal >= target;
    case "lessThan":
      return numVal < target;
    case "lessThanOrEqual":
      return numVal <= target;
  }
}

export function matchesFilterOperator(val: unknown, item: DataTableFilterItem): boolean {
  const lowerItemValue = String(item.value ?? "").toLowerCase();

  switch (item.operator) {
    case "isEmpty":
      return val === null || val === undefined || val === "";
    case "isNotEmpty":
      return val !== null && val !== undefined && val !== "";
    case "contains":
      return String(val ?? "")
        .toLowerCase()
        .includes(lowerItemValue);
    case "notContains":
      return !String(val ?? "")
        .toLowerCase()
        .includes(lowerItemValue);
    case "is":
    case "equals": {
      if (typeof val === "boolean") return val === (lowerItemValue === "true" || lowerItemValue === "1");
      if (typeof val === "number" && (lowerItemValue === "true" || lowerItemValue === "false")) {
        return (val === 1) === (lowerItemValue === "true");
      }
      return String(val ?? "").toLowerCase() === lowerItemValue;
    }
    case "notEquals": {
      if (typeof val === "boolean") return val !== (lowerItemValue === "true" || lowerItemValue === "1");
      if (typeof val === "number" && (lowerItemValue === "true" || lowerItemValue === "false")) {
        return (val === 1) !== (lowerItemValue === "true");
      }
      return String(val ?? "").toLowerCase() !== lowerItemValue;
    }
    case "startsWith":
      return String(val ?? "")
        .toLowerCase()
        .startsWith(lowerItemValue);
    case "endsWith":
      return String(val ?? "")
        .toLowerCase()
        .endsWith(lowerItemValue);
    case "greaterThan":
    case "greaterThanOrEqual":
    case "lessThan":
    case "lessThanOrEqual":
      return compareNumericValue(val, Number(item.value), item.operator);
    default:
      return true;
  }
}

export function evaluateQuickFilter<TData>(
  row: TData,
  tokens: string[],
  visibleColumns: DataTableColDef<TData>[],
): boolean {
  if (tokens.length === 0) return true;
  const cellStrings: string[] = [];
  for (const col of visibleColumns) {
    const val = readCellValue(row, col);
    if (val !== null && val !== undefined && val !== "") {
      cellStrings.push(String(val).toLowerCase());
    }
  }
  return tokens.every((term) => cellStrings.some((str) => str.includes(term)));
}

export function buildColumnFiltersState(items: DataTableFilterItem[] | undefined): ColumnFiltersState {
  if (!items || items.length === 0) return [];
  const grouped = new Map<string, DataTableFilterItem[]>();
  for (const item of items) {
    const bucket = grouped.get(item.field);
    if (bucket) bucket.push(item);
    else grouped.set(item.field, [item]);
  }
  return Array.from(grouped.entries()).map(([id, value]) => ({ id, value }));
}
