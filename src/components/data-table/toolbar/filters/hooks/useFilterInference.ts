import { useMemo } from "react";

import type { DataTableColDef, DataTableFilterConfig, DataTableFilterDefinition } from "../../../core/types";

export interface UseFilterInferenceOptions<TData = any> {
  columns: DataTableColDef<TData>[];
  filters?: DataTableFilterDefinition[];
  filterConfig?: DataTableFilterConfig;
  data?: TData[];
}

export interface UseFilterInferenceResult<TData = any> {
  filterableColumns: DataTableColDef<TData>[];
  resolvedFilters: DataTableFilterDefinition[];
}

export function useFilterInference<TData = any>({
  columns,
  filters: directFilters,
  filterConfig,
  data,
}: UseFilterInferenceOptions<TData>): UseFilterInferenceResult<TData> {
  const filterableColumns = useMemo(
    () =>
      columns.filter(
        (col) =>
          col.field !== "__checkbox__" &&
          col.field !== "__actions__" &&
          col.field !== "__actions" &&
          col.field !== "actions" &&
          col.filterable !== false,
      ),
    [columns],
  );

  const configFilters = filterConfig?.filters;

  const resolvedFilters = useMemo<DataTableFilterDefinition[]>(() => {
    if (directFilters && directFilters.length > 0) return directFilters;
    if (configFilters && configFilters.length > 0) {
      return configFilters;
    }

    // Auto-infer filters when no explicit filters are passed
    const autoList: DataTableFilterDefinition[] = [];
    for (const col of filterableColumns) {
      if (col.type === "boolean") {
        autoList.push({
          type: "ternary",
          field: col.field,
          label: col.headerName || col.field,
        });
      }
    }

    // Default Select filter fallback (status, category, role, type, state, singleSelect, or first filterable column)
    const selectCandidate =
      filterableColumns.find((col) => col.type === "singleSelect") ||
      filterableColumns.find((col) => /^(status|category|role|type|state)$/i.test(col.field)) ||
      filterableColumns.find(
        (col) =>
          col.type !== "boolean" &&
          !/^(id|created_at|updated_at|createdAt|updatedAt|avatar|image|icon|imageUrl|avatarUrl)$/i.test(
            col.field,
          ),
      ) ||
      filterableColumns[0];

    if (selectCandidate && !autoList.some((f) => (f.field ?? f.name) === selectCandidate.field)) {
      let options: { label: string; value: string }[] = [];
      if (selectCandidate.valueOptions && Array.isArray(selectCandidate.valueOptions)) {
        options = selectCandidate.valueOptions.map((opt) =>
          typeof opt === "string" ? { label: opt, value: opt } : opt,
        );
      } else if (data && data.length > 0) {
        const uniqueVals = Array.from(
          new Set(
            data
              .map((row: any) => row?.[selectCandidate.field])
              .filter((v) => v !== undefined && v !== null && v !== ""),
          ),
        ).slice(0, 20);
        options = uniqueVals.map((val) => {
          const str = String(val);
          return {
            label: str.charAt(0).toUpperCase() + str.slice(1),
            value: str,
          };
        });
      }

      autoList.push({
        type: "select",
        field: selectCandidate.field,
        label: selectCandidate.headerName || selectCandidate.field,
        options,
      });
    }

    return autoList;
  }, [directFilters, configFilters, filterableColumns, data]);

  return {
    filterableColumns,
    resolvedFilters,
  };
}
