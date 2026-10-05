import { useMemoizedFn } from "ahooks";
import { keyBy } from "es-toolkit";
import { useMemo, useState } from "react";

import type { DataTableColDef, DataTableFilterItem, DataTableFilterModel } from "../core/types";

import { readCellValue } from "../core/utils";

export interface UseDataTableFilteringOptions<TData> {
  rows: TData[];
  columns: DataTableColDef<TData>[];
  visibleColumns: DataTableColDef<TData>[];
  filterMode?: "client" | "server";
  filterModel?: DataTableFilterModel;
  onFilterModelChange?: (model: DataTableFilterModel) => void;
}

export function useDataTableFiltering<TData = Record<string, unknown>>({
  rows,
  columns,
  visibleColumns,
  filterMode = "client",
  filterModel: controlledFilterModel,
  onFilterModelChange,
}: UseDataTableFilteringOptions<TData>) {
  const [internalFilterModel, setInternalFilterModel] = useState<DataTableFilterModel>({
    items: [],
    quickFilterValues: [],
  });
  const filterModel = controlledFilterModel ?? internalFilterModel;
  const [quickFilterText, setQuickFilterText] = useState("");

  const handleFilterModelChange = useMemoizedFn((m: DataTableFilterModel) => {
    setInternalFilterModel(m);
    onFilterModelChange?.(m);
  });

  const handleQuickFilterChange = useMemoizedFn((val: string) => {
    setQuickFilterText(val);
    setInternalFilterModel((prev) => {
      const newModel: DataTableFilterModel = {
        ...prev,
        quickFilterValues: val.trim() ? val.trim().toLowerCase().split(/\s+/) : [],
      };
      onFilterModelChange?.(newModel);
      return newModel;
    });
  });

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

    // 1. Quick Filter (Full text across visible columns)
    if (hasQuickFilter && searchTerms) {
      list = list.filter((row) => {
        return searchTerms.every((term) =>
          visibleColumns.some((col) => {
            const val = readCellValue(row, col);
            return String(val ?? "")
              .toLowerCase()
              .includes(term);
          }),
        );
      });
    }

    // 2. Advanced rule items
    if (hasItems && filterModel.items) {
      const columnMap = keyBy(columns, (c) => c.field);
      // Pre-normalize filter values outside the row loop
      const preparedItems = filterModel.items.map((item: DataTableFilterItem) => ({
        item,
        col: columnMap[item.field],
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
            case "equals": {
              if (typeof val === "boolean") {
                return val === (lowerItemValue === "true" || lowerItemValue === "1");
              }
              if (
                typeof val === "number" &&
                (lowerItemValue === "true" || lowerItemValue === "false")
              ) {
                return (val === 1) === (lowerItemValue === "true");
              }
              return String(val ?? "").toLowerCase() === lowerItemValue;
            }
            case "notEquals": {
              if (typeof val === "boolean") {
                return val !== (lowerItemValue === "true" || lowerItemValue === "1");
              }
              if (
                typeof val === "number" &&
                (lowerItemValue === "true" || lowerItemValue === "false")
              ) {
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
              return Number(val) > numItemValue;
            case "greaterThanOrEqual":
              return Number(val) >= numItemValue;
            case "lessThan":
              return Number(val) < numItemValue;
            case "lessThanOrEqual":
              return Number(val) <= numItemValue;
            default:
              return true;
          }
        });
      });
    }

    return list;
  }, [rows, filterMode, filterModel, visibleColumns, columns]);

  return {
    filterModel,
    quickFilterText,
    filteredRows,
    handleFilterModelChange,
    handleQuickFilterChange,
    quickFilterTokens: filterModel.quickFilterValues ?? [],
  };
}
