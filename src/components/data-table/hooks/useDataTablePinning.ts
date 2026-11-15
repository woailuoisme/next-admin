import { useMemo } from "react";

import { EMPTY_ARRAY, EMPTY_RECORD } from "../core/constants";
import type { DataTableColDef, DataTablePinnedColumns } from "../core/types";

export interface UseDataTablePinningOptions<TData> {
  columns: DataTableColDef<TData>[];
  pinnedColumns?: DataTablePinnedColumns;
  columnWidths: Record<string, number>;
  checkboxSelection?: boolean;
  hasExpandColumn?: boolean;
}

export interface ComputePinningOffsetsOptions<TData = any> {
  pinnedLeftFields: string[];
  pinnedRightFields: string[];
  columnByField: Map<string, DataTableColDef<TData>>;
  columnWidths: Record<string, number>;
  checkboxSelection?: boolean;
  hasExpandColumn?: boolean;
}

/**
 * Pure layout seam helper to compute sticky left/right offsets from pinned fields & current widths.
 * Shared by both committed React state (`useDataTablePinning`) and rAF drag CSS var writes (`useDataTableResize`).
 */
export function computePinningOffsets<TData = any>({
  pinnedLeftFields,
  pinnedRightFields,
  columnByField,
  columnWidths,
  checkboxSelection = false,
  hasExpandColumn = false,
}: ComputePinningOffsetsOptions<TData>) {
  const leftOffsets: Record<string, number> = {};
  let leftCursor = (checkboxSelection ? 44 : 0) + (hasExpandColumn ? 36 : 0);
  for (const field of pinnedLeftFields) {
    leftOffsets[field] = leftCursor;
    leftCursor += columnWidths[field] ?? columnByField.get(field)?.width ?? 120;
  }

  const rightOffsets: Record<string, number> = {};
  let rightCursor = 0;
  for (let i = pinnedRightFields.length - 1; i >= 0; i--) {
    const field = pinnedRightFields[i];
    rightOffsets[field] = rightCursor;
    rightCursor += columnWidths[field] ?? columnByField.get(field)?.width ?? 80;
  }

  return { leftOffsets, rightOffsets };
}

export function resolvePinnedFields<TData = any>(
  columns: DataTableColDef<TData>[],
  pinnedColumns: DataTablePinnedColumns = EMPTY_RECORD,
) {
  const fromLeftProp = pinnedColumns.left ?? EMPTY_ARRAY;
  const fromLeftCols = columns.filter((col) => col.pinned === "left").map((col) => col.field);
  const pinnedLeftFields = Array.from(new Set([...fromLeftProp, ...fromLeftCols]));

  const fromRightProp = pinnedColumns.right ?? EMPTY_ARRAY;
  const fromRightCols = columns.filter((col) => col.pinned === "right").map((col) => col.field);
  const pinnedRightFields = Array.from(new Set([...fromRightProp, ...fromRightCols]));

  return { pinnedLeftFields, pinnedRightFields };
}

export function useDataTablePinning<TData = any>({
  columns,
  pinnedColumns = EMPTY_RECORD,
  columnWidths,
  checkboxSelection = false,
  hasExpandColumn = false,
}: UseDataTablePinningOptions<TData>) {
  const { pinnedLeftFields, pinnedRightFields } = useMemo(
    () => resolvePinnedFields(columns, pinnedColumns),
    [columns, pinnedColumns],
  );

  // 预建 field → colDef 索引，避免在偏移量循环内 O(n) 线性查找
  const columnByField = useMemo(() => new Map(columns.map((col) => [col.field, col])), [columns]);

  const { leftOffsets, rightOffsets } = useMemo(
    () =>
      computePinningOffsets({
        pinnedLeftFields,
        pinnedRightFields,
        columnByField,
        columnWidths,
        checkboxSelection,
        hasExpandColumn,
      }),
    [pinnedLeftFields, pinnedRightFields, columnByField, columnWidths, checkboxSelection, hasExpandColumn],
  );

  return {
    pinnedLeftFields,
    pinnedRightFields,
    leftOffsets,
    rightOffsets,
  };
}
