import type { SortingState } from "@tanstack/react-table";

import { EMPTY_ARRAY, EMPTY_RECORD } from "./constants";
import type { DataTableColDef, DataTablePinnedColumns, DataTableRowId, DataTableSortModel } from "./types";
import { isSystemColumn } from "../toolbar/filters/utils";

export function normalizeDataTableColumns<TData>(columns: DataTableColDef<TData>[]): DataTableColDef<TData>[] {
  return columns.map((col) => {
    const isActionCol = isSystemColumn(col);
    return {
      ...col,
      sortable: col.sortable ?? !isActionCol,
      filterable: col.filterable ?? !isActionCol,
      align: col.align ?? (isActionCol ? "center" : "left"),
      headerAlign: col.headerAlign ?? (isActionCol ? "center" : (col.align ?? "left")),
    };
  });
}

/** 计算点击列头后的下一个排序方向（null 表示取消排序） */
export function resolveNextSortDirection(sortModel: DataTableSortModel, field: string): "asc" | "desc" | null {
  const existing = sortModel.find((s) => s.field === field);
  if (!existing) return "asc";
  return existing.sort === "asc" ? "desc" : null;
}

export function toTanStackSortingState(sortModel: DataTableSortModel): SortingState {
  return sortModel.map((item) => ({ id: item.field, desc: item.sort === "desc" }));
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

export interface ComputePinningOffsetsOptions<TData = any> {
  pinnedLeftFields: string[];
  pinnedRightFields: string[];
  columnByField: Map<string, DataTableColDef<TData>>;
  columnWidths: Record<string, number>;
  checkboxSelection?: boolean;
  hasExpandColumn?: boolean;
}

/**
 * 计算左右固定列的 sticky 像素偏移；供 TanStack 状态提交与 rAF 拖拽 CSS 变量写入共用。
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

/** 计算当前页行选择汇总态（全选 / 半选） */
export function computePageSelectionSummary<TData>(
  pagedRows: TData[],
  selectionSet: Set<DataTableRowId>,
  getRowId: (row: TData) => DataTableRowId,
  isRowSelectable?: (row: TData) => boolean,
) {
  let hasSelectedOnPage = false;
  let hasUnselectedOnPage = false;
  for (const r of pagedRows) {
    if (isRowSelectable && !isRowSelectable(r)) continue;
    if (selectionSet.has(getRowId(r))) hasSelectedOnPage = true;
    else hasUnselectedOnPage = true;
    if (hasSelectedOnPage && hasUnselectedOnPage) break;
  }
  return {
    isAllPageSelected: pagedRows.length > 0 && hasSelectedOnPage && !hasUnselectedOnPage,
    isSomePageSelected: pagedRows.length > 0 && hasSelectedOnPage && hasUnselectedOnPage,
  };
}
