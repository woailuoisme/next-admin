"use client";

import { useLatest, useMemoizedFn } from "ahooks";
import { useMemo, useState } from "react";

import { EMPTY_ARRAY } from "../core/constants";
import type { DataTableColDef, DataTableFilterItem, DataTableFilterModel } from "../core/types";

import { readCellValue } from "../core/utils";

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

export interface UseDataTableFilteringOptions<TData> {
  rows: TData[];
  columns: DataTableColDef<TData>[];
  visibleColumns: DataTableColDef<TData>[];
  filterMode?: "client" | "server";
  filterModel?: DataTableFilterModel;
  onFilterModelChange?: (model: DataTableFilterModel) => void;
}

export function useDataTableFiltering<TData = Record<string, any>>({
  rows,
  columns,
  visibleColumns,
  filterMode = "client",
  filterModel: controlledFilterModel,
  onFilterModelChange,
}: UseDataTableFilteringOptions<TData>) {
  const [internalFilterModel, setInternalFilterModel] = useState<DataTableFilterModel>({
    items: EMPTY_ARRAY,
    quickFilterValues: EMPTY_ARRAY,
  });
  const filterModel = controlledFilterModel ?? internalFilterModel;
  const [internalQuickFilterText, setInternalQuickFilterText] = useState("");
  const quickFilterText =
    controlledFilterModel !== undefined
      ? (controlledFilterModel.quickFilterValues ?? EMPTY_ARRAY).join(" ")
      : internalQuickFilterText;

  const latestRef = useLatest({
    filterModel,
    controlledFilterModel,
    onFilterModelChange,
  });

  const handleFilterModelChange = useMemoizedFn((m: DataTableFilterModel) => {
    if (latestRef.current.controlledFilterModel === undefined) {
      setInternalFilterModel(m);
    }
    latestRef.current.onFilterModelChange?.(m);
  });

  const handleQuickFilterChange = useMemoizedFn((val: string) => {
    const trimmed = val.trim();
    const newModel: DataTableFilterModel = {
      ...latestRef.current.filterModel,
      quickFilterValues: trimmed ? trimmed.toLowerCase().split(/\s+/) : (EMPTY_ARRAY as unknown as string[]),
    };
    if (latestRef.current.controlledFilterModel === undefined) {
      setInternalQuickFilterText(val);
      setInternalFilterModel(newModel);
    }
    latestRef.current.onFilterModelChange?.(newModel);
  });

  const handleResetFilters = useMemoizedFn(() => {
    const emptyModel: DataTableFilterModel = {
      items: EMPTY_ARRAY as unknown as DataTableFilterModel["items"],
      quickFilterValues: EMPTY_ARRAY as unknown as string[],
    };
    if (latestRef.current.controlledFilterModel === undefined) {
      setInternalQuickFilterText("");
      setInternalFilterModel(emptyModel);
    }
    latestRef.current.onFilterModelChange?.(emptyModel);
  });

  const columnMap = useMemo(() => {
    const map = new Map<string, DataTableColDef<TData>>();
    for (const col of columns) {
      map.set(col.field, col);
    }
    return map;
  }, [columns]);

  const filteredRows = useMemo(() => {
    if (filterMode === "server") {
      return rows;
    }

    const searchTerms = filterModel.quickFilterValues;
    const hasQuickFilter = Boolean(searchTerms && searchTerms.length > 0);
    const hasItems = Boolean(filterModel.items && filterModel.items.length > 0);

    // Fast path: early return if no filters applied (zero-allocation)
    if (!hasQuickFilter && !hasItems) {
      return rows;
    }

    let list = rows;

    // 1. Quick Filter (Full text across visible columns; pre-extract lowered strings per row instead of per term)
    if (hasQuickFilter && searchTerms) {
      list = list.filter((row) => {
        const cellStrings: string[] = [];
        for (const col of visibleColumns) {
          const val = readCellValue(row, col);
          if (val !== null && val !== undefined && val !== "") {
            cellStrings.push(String(val).toLowerCase());
          }
        }
        for (const term of searchTerms) {
          let matched = false;
          for (const str of cellStrings) {
            if (str.includes(term)) {
              matched = true;
              break;
            }
          }
          if (!matched) return false;
        }
        return true;
      });
    }

    // 2. Advanced rule items
    if (hasItems && filterModel.items) {
      // Pre-normalize filter values outside the row loop
      const preparedItems = filterModel.items.map((item: DataTableFilterItem) => ({
        item,
        col: columnMap.get(item.field),
        lowerItemValue: String(item.value ?? "").toLowerCase(),
        numItemValue: Number(item.value),
      }));

      list = list.filter((row) => {
        return preparedItems.every(({ item, col, lowerItemValue, numItemValue }) => {
          const val = col ? readCellValue(row, col) : (row as Record<string, unknown>)[item.field];

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
              if (typeof val === "boolean") {
                return val === (lowerItemValue === "true" || lowerItemValue === "1");
              }
              if (typeof val === "number" && (lowerItemValue === "true" || lowerItemValue === "false")) {
                return (val === 1) === (lowerItemValue === "true");
              }
              return String(val ?? "").toLowerCase() === lowerItemValue;
            }
            case "notEquals": {
              if (typeof val === "boolean") {
                return val !== (lowerItemValue === "true" || lowerItemValue === "1");
              }
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
              return compareNumericValue(val, numItemValue, item.operator);
            default:
              return true;
          }
        });
      });
    }

    return list;
  }, [rows, filterMode, filterModel, visibleColumns, columnMap]);

  return {
    filterModel,
    quickFilterText,
    filteredRows,
    handleFilterModelChange,
    handleQuickFilterChange,
    handleResetFilters,
    quickFilterTokens: filterModel.quickFilterValues ?? EMPTY_ARRAY,
  };
}
