import { useMemoizedFn } from "ahooks";
import { keyBy, orderBy } from "es-toolkit";
import { useCallback, useState } from "react";

import { EMPTY_ARRAY } from "../core/constants";
import type { DataTableColDef, DataTableSortModel } from "../core/types";

import { readCellValue } from "../core/utils";

/** 计算点击列头后的下一个排序方向（null 表示取消排序） */
export function resolveNextSortDirection(
  sortModel: DataTableSortModel,
  field: string,
): "asc" | "desc" | null {
  const existing = sortModel.find((s) => s.field === field);
  if (!existing) return "asc";
  return existing.sort === "asc" ? "desc" : null;
}

export interface UseDataTableSortingOptions<TData extends Record<string, any> = Record<string, any>> {
  columns: DataTableColDef<TData>[];
  sortingMode?: "client" | "server";
  sortModel?: DataTableSortModel;
  onSortModelChange?: (model: DataTableSortModel) => void;
}

export function useDataTableSorting<TData extends Record<string, any> = Record<string, any>>({
  columns,
  sortingMode = "client",
  sortModel: controlledSortModel,
  onSortModelChange,
}: UseDataTableSortingOptions<TData>) {
  const [internalSortModel, setInternalSortModel] = useState<DataTableSortModel>(EMPTY_ARRAY);
  const sortModel = controlledSortModel ?? internalSortModel;

  const handleSortClick = useMemoizedFn((field: string) => {
    const targetCol = columns.find((c) => c.field === field);
    if (targetCol?.sortable === false) {
      return;
    }

    const direction = resolveNextSortDirection(sortModel, field);
    const next: DataTableSortModel = direction ? [{ field, sort: direction }] : EMPTY_ARRAY;
    setInternalSortModel(next);
    onSortModelChange?.(next);
  });

  const sortRows = useCallback(
    (rows: TData[]): TData[] => {
      if (sortingMode === "server" || sortModel.length === 0) {
        return rows;
      }

      const columnMap = keyBy(columns, (c) => c.field);
      const sortFields: ((row: TData) => unknown)[] = [];
      const sortOrders: ("asc" | "desc")[] = [];

      for (const s of sortModel) {
        const col = columnMap[s.field];
        sortFields.push((r: TData) => (col ? readCellValue(r, col) : r[s.field]));
        sortOrders.push(s.sort);
      }

      return orderBy(rows, sortFields, sortOrders) as TData[];
    },
    [sortingMode, sortModel, columns],
  );

  const handleSortModelChange = useMemoizedFn((next: DataTableSortModel) => {
    setInternalSortModel(next);
    onSortModelChange?.(next);
  });

  return {
    sortModel,
    handleSortClick,
    handleSortModelChange,
    sortRows,
  };
}
