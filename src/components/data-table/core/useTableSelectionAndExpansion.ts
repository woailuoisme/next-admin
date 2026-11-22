"use client";

import type { ExpandedState, RowSelectionState } from "@tanstack/react-table";
import { useMemoizedFn } from "ahooks";
import { useState } from "react";

import { EMPTY_ARRAY } from "./constants";
import type { DataTableRowId, DataTableRowSelectionModel } from "./types";

interface UseTableSelectionAndExpansionOptions<TData> {
  rows: TData[];
  getRowId: (row: TData) => DataTableRowId;
  getPagedRows: () => TData[];
  controlledSelectionModel?: DataTableRowSelectionModel;
  onRowSelectionModelChange?: (ids: DataTableRowSelectionModel, rows: TData[]) => void;
  onSelectedRowsChange?: (rows: TData[]) => void;
  isRowSelectable?: (row: TData) => boolean;
  controlledExpandedIds?: DataTableRowId[];
  defaultExpandedRowIds?: DataTableRowId[];
  onExpandedRowsChange?: (expandedIds: DataTableRowId[]) => void;
  singleExpand?: boolean;
}

/**
 * 管理 DataTable 行选择（支持跨页保留与可选过滤）与行展开（支持单行手风琴模式）。
 */
export function useTableSelectionAndExpansion<TData>({
  rows,
  getRowId,
  getPagedRows,
  controlledSelectionModel,
  onRowSelectionModelChange,
  onSelectedRowsChange,
  isRowSelectable,
  controlledExpandedIds,
  defaultExpandedRowIds = EMPTY_ARRAY,
  onExpandedRowsChange,
  singleExpand = false,
}: UseTableSelectionAndExpansionOptions<TData>) {
  const [internalSelection, setInternalSelection] = useState<DataTableRowSelectionModel>(EMPTY_ARRAY);
  const selection = controlledSelectionModel ?? internalSelection;
  const selectionSet = new Set(selection);
  const rowMap = new Map<DataTableRowId, TData>(rows.map((r) => [getRowId(r), r]));
  const rowSelectionState: RowSelectionState = Object.fromEntries(selection.map((id) => [String(id), true]));

  const resolveSelectedRows = (ids: DataTableRowSelectionModel): TData[] =>
    ids.length === 0 ? (EMPTY_ARRAY as TData[]) : ids.map((id) => rowMap.get(id)).filter((r): r is TData => Boolean(r));
  const selectedFullRows = resolveSelectedRows(selection);

  const commitSelection = useMemoizedFn((nextIds: DataTableRowSelectionModel) => {
    setInternalSelection(nextIds);
    const nextRows = resolveSelectedRows(nextIds);
    onRowSelectionModelChange?.(nextIds, nextRows);
    onSelectedRowsChange?.(nextRows);
  });

  const handleSelectRow = useMemoizedFn((id: DataTableRowId, checked: boolean, row: TData) => {
    if (isRowSelectable && !isRowSelectable(row)) return;
    if (checked) {
      if (!selectionSet.has(id)) commitSelection([...selection, id]);
    } else {
      commitSelection(selection.filter((item) => item !== id));
    }
  });

  const handleSelectAll = useMemoizedFn((checked: boolean, targetRows?: TData[]) => {
    const scopeRows = targetRows ?? getPagedRows();
    const selectableIds = scopeRows.filter((r) => !isRowSelectable || isRowSelectable(r)).map((r) => getRowId(r));
    if (checked) {
      const seen = new Set(selection);
      commitSelection([...selection, ...selectableIds.filter((id) => !seen.has(id))]);
    } else {
      const removeSet = new Set(selectableIds);
      commitSelection(selection.filter((id) => !removeSet.has(id)));
    }
  });

  const clearSelection = useMemoizedFn(() => commitSelection(EMPTY_ARRAY));

  const [uncontrolledExpandedIds, setUncontrolledExpandedIds] = useState<DataTableRowId[]>(defaultExpandedRowIds);
  const expandedRowIds = controlledExpandedIds ?? uncontrolledExpandedIds;
  const expandedSet = new Set(expandedRowIds);
  const expandedState: ExpandedState = Object.fromEntries(expandedRowIds.map((id) => [String(id), true]));

  const updateExpandedIds = useMemoizedFn((nextIds: DataTableRowId[]) => {
    if (controlledExpandedIds === undefined) setUncontrolledExpandedIds(nextIds);
    onExpandedRowsChange?.(nextIds);
  });

  const isRowExpanded = useMemoizedFn((id: DataTableRowId) => expandedSet.has(id));

  const toggleRowExpanded = useMemoizedFn((id: DataTableRowId) => {
    if (singleExpand) updateExpandedIds(expandedSet.has(id) ? [] : [id]);
    else
      updateExpandedIds(expandedSet.has(id) ? expandedRowIds.filter((item) => item !== id) : [...expandedRowIds, id]);
  });

  const collapseAll = useMemoizedFn(() => updateExpandedIds(EMPTY_ARRAY));

  return {
    rowSelectionState,
    selectionSet,
    selectedFullRows,
    handleSelectRow,
    handleSelectAll,
    clearSelection,
    expandedRowIds,
    expandedSet,
    expandedState,
    isRowExpanded,
    toggleRowExpanded,
    collapseAll,
  };
}
