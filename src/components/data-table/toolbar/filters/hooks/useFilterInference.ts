import type { DataTableColDef, DataTableFilterConfig, DataTableFilterDefinition } from "../../../core/types";
import { readCellValue } from "../../../core/utils";
import { isSystemColumn, resolveFilterField } from "../utils";

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

const EXCLUDED_AUTO_SELECT_FIELDS =
  /^(id|created_at|updated_at|createdAt|updatedAt|avatar|image|icon|imageUrl|avatarUrl)$/i;
const PREFERRED_SELECT_FIELDS = /^(status|category|role|type|state)$/i;

export function useFilterInference<TData = any>({
  columns,
  filters: directFilters,
  filterConfig,
  data,
}: UseFilterInferenceOptions<TData>): UseFilterInferenceResult<TData> {
  const filterableColumns = columns.filter((col) => !isSystemColumn(col) && col.filterable !== false);
  const configFilters = filterConfig?.filters;

  if (directFilters && directFilters.length > 0) {
    return { filterableColumns, resolvedFilters: directFilters };
  }
  if (configFilters && configFilters.length > 0) {
    return { filterableColumns, resolvedFilters: configFilters };
  }

  // Auto-infer filters when no explicit filters are passed
  const autoList: DataTableFilterDefinition[] = [];
  let singleSelectCol: DataTableColDef<TData> | undefined;
  let preferredNamedCol: DataTableColDef<TData> | undefined;
  let generalCol: DataTableColDef<TData> | undefined;

  for (const col of filterableColumns) {
    if (col.type === "boolean") {
      autoList.push({
        type: "ternary",
        field: col.field,
        label: col.headerName || col.field,
      });
      continue;
    }
    if (!singleSelectCol && col.type === "singleSelect") singleSelectCol = col;
    if (!preferredNamedCol && PREFERRED_SELECT_FIELDS.test(col.field)) preferredNamedCol = col;
    if (!generalCol && !EXCLUDED_AUTO_SELECT_FIELDS.test(col.field)) generalCol = col;
  }

  const selectCandidate = singleSelectCol || preferredNamedCol || generalCol || filterableColumns[0];

  if (selectCandidate && !autoList.some((f) => resolveFilterField(f) === selectCandidate.field)) {
    let options: { label: string; value: string }[] = [];
    if (selectCandidate.valueOptions && Array.isArray(selectCandidate.valueOptions)) {
      options = selectCandidate.valueOptions.map((opt) => (typeof opt === "string" ? { label: opt, value: opt } : opt));
    } else if (data && data.length > 0) {
      // shortcut: 只采样前 200 行推导选项，超过 200 行且候选值仅出现在尾部时下拉会缺值，需要精确全量选项时改用显式 valueOptions
      const limit = Math.min(data.length, 200);
      const uniqueVals = new Set<string>();
      for (let i = 0; i < limit && uniqueVals.size < 20; i++) {
        const val = readCellValue(data[i], selectCandidate);
        if (val !== undefined && val !== null && val !== "") {
          uniqueVals.add(String(val));
        }
      }
      options = Array.from(uniqueVals, (str) => ({
        label: str.charAt(0).toUpperCase() + str.slice(1),
        value: str,
      }));
    }

    autoList.push({
      type: "select",
      field: selectCandidate.field,
      label: selectCandidate.headerName || selectCandidate.field,
      options,
    });
  }

  return {
    filterableColumns,
    resolvedFilters: autoList,
  };
}
