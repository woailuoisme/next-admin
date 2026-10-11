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

  const latestRef = useLatest({
    rows,
    selection,
    getRowId,
    onRowSelectionModelChange,
    isRowSelectable,
  });

  const selectionSet = useMemo(() => new Set(selection), [selection]);

  const handleSelectRow = useMemoizedFn((id: DataTableRowId, checked: boolean, row: TData) => {
    const {
      isRowSelectable: canSelect,
      selection: currentSelection,
      rows: currentRows,
      getRowId: getId,
      onRowSelectionModelChange: notify,
    } = latestRef.current;

    if (canSelect && !canSelect(row)) return;

    let next: DataTableRowSelectionModel;
    if (checked) {
      next = currentSelection.includes(id) ? currentSelection : [...currentSelection, id];
    } else {
      next = currentSelection.filter((i) => i !== id);
    }
    setInternalSelection(next);
    const nextSet = new Set(next);
    const selectedRows = currentRows.filter((r) => nextSet.has(getId(r)));
    notify?.(next, selectedRows);
  });

  const handleSelectAll = useMemoizedFn((checked: boolean, candidateRows: TData[]) => {
    const {
      isRowSelectable: canSelect,
      selection: currentSelection,
      rows: currentRows,
      getRowId: getId,
      onRowSelectionModelChange: notify,
    } = latestRef.current;

    const selectable = candidateRows.filter((r) => !canSelect || canSelect(r));
    const selectableIds = selectable.map((r) => getId(r));

    const next: DataTableRowSelectionModel = checked
      ? union(currentSelection, selectableIds)
      : difference(currentSelection, selectableIds);

    setInternalSelection(next);
    const nextSet = new Set(next);
    const selectedRows = currentRows.filter((r) => nextSet.has(getId(r)));
    notify?.(next, selectedRows);
  });

  const clearSelection = useMemoizedFn(() => {
    setInternalSelection(EMPTY_ARRAY);
    latestRef.current.onRowSelectionModelChange?.(EMPTY_ARRAY, EMPTY_ARRAY);
  });

  const isAllPageSelected = useMemo(() => {
    return pagedRows.length > 0 && pagedRows.every((r) => selectionSet.has(getRowId(r)));
  }, [pagedRows, selectionSet, getRowId]);

  const isSomePageSelected = useMemo(() => {
    return pagedRows.some((r) => selectionSet.has(getRowId(r))) && !isAllPageSelected;
  }, [pagedRows, selectionSet, getRowId, isAllPageSelected]);

  const selectedFullRows = useMemo(() => {
    return rows.filter((r) => selectionSet.has(getRowId(r)));
  }, [rows, selectionSet, getRowId]);

  return {
    selection,
    selectedFullRows,
    isAllPageSelected,
    isSomePageSelected,
    handleSelectRow,
    handleSelectAll,
    clearSelection,
    setSelection: setInternalSelection,
  };
}
