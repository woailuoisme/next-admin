import { useMemoizedFn } from "ahooks";
import { useMemo, useState } from "react";

import type { DataTableRowId } from "../core/types";

export interface UseDataTableExpansionOptions {
  expandedRowIds?: DataTableRowId[];
  defaultExpandedRowIds?: DataTableRowId[];
  onExpandedRowsChange?: (expandedRowIds: DataTableRowId[]) => void;
  singleExpand?: boolean;
}

export function useDataTableExpansion({
  expandedRowIds: controlledExpandedIds,
  defaultExpandedRowIds = [],
  onExpandedRowsChange,
  singleExpand = false,
}: UseDataTableExpansionOptions = {}) {
  const [uncontrolledExpandedIds, setUncontrolledExpandedIds] =
    useState<DataTableRowId[]>(defaultExpandedRowIds);

  const isControlled = controlledExpandedIds !== undefined;
  const currentExpandedIds = isControlled ? controlledExpandedIds : uncontrolledExpandedIds;

  const expandedSet = useMemo(() => new Set(currentExpandedIds), [currentExpandedIds]);

  const updateExpandedIds = useMemoizedFn((nextIds: DataTableRowId[]) => {
    if (!isControlled) {
      setUncontrolledExpandedIds(nextIds);
    }
    onExpandedRowsChange?.(nextIds);
  });

  const toggleRowExpanded = useMemoizedFn((id: DataTableRowId) => {
    if (singleExpand) {
      if (expandedSet.has(id)) {
        updateExpandedIds([]);
      } else {
        updateExpandedIds([id]);
      }
      return;
    }

    if (expandedSet.has(id)) {
      updateExpandedIds(currentExpandedIds.filter((item) => item !== id));
    } else {
      updateExpandedIds([...currentExpandedIds, id]);
    }
  });

  const isRowExpanded = useMemoizedFn((id: DataTableRowId) => expandedSet.has(id));

  const expandAll = useMemoizedFn((ids: DataTableRowId[]) => {
    if (singleExpand) {
      updateExpandedIds(ids.slice(0, 1));
      return;
    }
    updateExpandedIds(ids);
  });

  const collapseAll = useMemoizedFn(() => {
    updateExpandedIds([]);
  });

  return {
    expandedRowIds: currentExpandedIds,
    expandedSet,
    toggleRowExpanded,
    isRowExpanded,
    expandAll,
    collapseAll,
  };
}

export type UseDataTableExpansionReturn = ReturnType<typeof useDataTableExpansion>;
