import { useMemo } from "react";

import type { DataTableColDef, DataTablePinnedColumns } from "../core/types";

export interface UseDataTablePinningOptions<TData> {
  columns: DataTableColDef<TData>[];
  pinnedColumns?: DataTablePinnedColumns;
  columnWidths: Record<string, number>;
  checkboxSelection?: boolean;
  hasExpandColumn?: boolean;
}

export function useDataTablePinning<TData = any>({
  columns,
  pinnedColumns = {},
  columnWidths,
  checkboxSelection = false,
  hasExpandColumn = false,
}: UseDataTablePinningOptions<TData>) {
  const pinnedLeftFields = useMemo(() => {
    const fromProp = pinnedColumns.left ?? [];
    const fromCols = columns.filter((col) => col.pinned === "left").map((col) => col.field);
    return Array.from(new Set([...fromProp, ...fromCols]));
  }, [pinnedColumns.left, columns]);

  const pinnedRightFields = useMemo(() => {
    const fromProp = pinnedColumns.right ?? [];
    const fromCols = columns.filter((col) => col.pinned === "right").map((col) => col.field);
    return Array.from(new Set([...fromProp, ...fromCols]));
  }, [pinnedColumns.right, columns]);

  // 预建 field → colDef 索引，避免在偏移量循环内 O(n) 线性查找
  const columnByField = useMemo(() => new Map(columns.map((col) => [col.field, col])), [columns]);

  const leftOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let current = (checkboxSelection ? 44 : 0) + (hasExpandColumn ? 36 : 0);
    for (const field of pinnedLeftFields) {
      offsets[field] = current;
      current += columnWidths[field] ?? columnByField.get(field)?.width ?? 120;
    }
    return offsets;
  }, [pinnedLeftFields, columnWidths, checkboxSelection, hasExpandColumn, columnByField]);

  const rightOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let current = 0;
    for (let i = pinnedRightFields.length - 1; i >= 0; i--) {
      const field = pinnedRightFields[i];
      offsets[field] = current;
      current += columnWidths[field] ?? columnByField.get(field)?.width ?? 80;
    }
    return offsets;
  }, [pinnedRightFields, columnWidths, columnByField]);

  return {
    pinnedLeftFields,
    pinnedRightFields,
    leftOffsets,
    rightOffsets,
  };
}
