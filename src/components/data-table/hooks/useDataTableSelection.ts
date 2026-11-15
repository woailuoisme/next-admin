import { useLatest, useMemoizedFn } from "ahooks";
import { difference, union } from "es-toolkit";
import { useMemo, useState } from "react";

import { EMPTY_ARRAY } from "../core/constants";
import type { DataTableRowId, DataTableRowSelectionModel } from "../core/types";

export interface UseDataTableSelectionOptions<TData> {
  rows: TData[];
  pagedRows: TData[];
  getRowId: (row: TData) => DataTableRowId;
  checkboxSelection?: boolean;
  rowSelectionModel?: DataTableRowSelectionModel;
  onRowSelectionModelChange?: (model: DataTableRowSelectionModel, selectedRows: TData[]) => void;
  isRowSelectable?: (row: TData) => boolean;
}

function computePageSelectionState<TData>(
  pagedRows: TData[],
  selectionSet: Set<DataTableRowId>,
  getRowId: (row: TData) => DataTableRowId,
  isRowSelectable?: (row: TData) => boolean,
): { isAllPageSelected: boolean; isSomePageSelected: boolean } {
  if (pagedRows.length === 0) {
    return { isAllPageSelected: false, isSomePageSelected: false };
  }
  let hasSelected = false;
  let hasUnselected = false;
  for (const r of pagedRows) {
    if (isRowSelectable && !isRowSelectable(r)) continue;
    if (selectionSet.has(getRowId(r))) {
      hasSelected = true;
    } else {
      hasUnselected = true;
    }
    if (hasSelected && hasUnselected) {
      return { isAllPageSelected: false, isSomePageSelected: true };
    }
  }
  return {
    isAllPageSelected: hasSelected && !hasUnselected,
    isSomePageSelected: false,
  };
}

export function useDataTableSelection<TData extends Record<string, any> = Record<string, any>>({
  rows,
  pagedRows,
  getRowId,
  rowSelectionModel,
  onRowSelectionModelChange,
  isRowSelectable,
}: UseDataTableSelectionOptions<TData>) {
  const [internalSelection, setInternalSelection] = useState<DataTableRowSelectionModel>(EMPTY_ARRAY);
  const selection = rowSelectionModel ?? internalSelection;

  const selectionSet = useMemo(() => new Set(selection), [selection]);

  const rowMap = useMemo(() => {
    const map = new Map<DataTableRowId, TData>();
    for (const row of rows) {
      map.set(getRowId(row), row);
    }
    return map;
  }, [rows, getRowId]);

  const latestRef = useLatest({
    selection,
    selectionSet,
    rowMap,
    getRowId,
    onRowSelectionModelChange,
    isRowSelectable,
  });

  const resolveSelectedRows = (ids: DataTableRowSelectionModel, map: Map<DataTableRowId, TData>): TData[] => {
    if (ids.length === 0) return EMPTY_ARRAY as TData[];
    const result: TData[] = [];
    for (const id of ids) {
      const row = map.get(id);
      if (row) result.push(row);
    }
    return result;
  };

  const handleSelectRow = useMemoizedFn((id: DataTableRowId, checked: boolean, row: TData) => {
    const {
      isRowSelectable: canSelect,
      selection: currentSelection,
      selectionSet: currentSet,
      rowMap: currentRowMap,
      onRowSelectionModelChange: notify,
    } = latestRef.current;

    if (canSelect && !canSelect(row)) return;

    let next: DataTableRowSelectionModel;
    if (checked) {
      next = currentSet.has(id) ? currentSelection : [...currentSelection, id];
    } else {
      next = currentSet.has(id) ? currentSelection.filter((i) => i !== id) : currentSelection;
    }
    setInternalSelection(next);
    notify?.(next, resolveSelectedRows(next, currentRowMap));
  });

  const handleSelectAll = useMemoizedFn((checked: boolean, candidateRows: TData[]) => {
    const {
      isRowSelectable: canSelect,
      selection: currentSelection,
      rowMap: currentRowMap,
      getRowId: getId,
      onRowSelectionModelChange: notify,
    } = latestRef.current;

    const selectableIds: DataTableRowId[] = [];
    for (const r of candidateRows) {
      if (!canSelect || canSelect(r)) {
        selectableIds.push(getId(r));
      }
    }

    const next: DataTableRowSelectionModel = checked
      ? union(currentSelection, selectableIds)
      : difference(currentSelection, selectableIds);

    setInternalSelection(next);
    notify?.(next, resolveSelectedRows(next, currentRowMap));
  });

  const clearSelection = useMemoizedFn(() => {
    setInternalSelection(EMPTY_ARRAY);
    latestRef.current.onRowSelectionModelChange?.(EMPTY_ARRAY, EMPTY_ARRAY);
  });

  const { isAllPageSelected, isSomePageSelected } = useMemo(
    () => computePageSelectionState(pagedRows, selectionSet, getRowId, isRowSelectable),
    [pagedRows, selectionSet, getRowId, isRowSelectable],
  );

  const selectedFullRows = useMemo(() => {
    return resolveSelectedRows(selection, rowMap);
  }, [selection, rowMap]);

  return {
    selection,
    selectionSet,
    selectedFullRows,
    isAllPageSelected,
    isSomePageSelected,
    handleSelectRow,
    handleSelectAll,
    clearSelection,
    setSelection: setInternalSelection,
  };
}
