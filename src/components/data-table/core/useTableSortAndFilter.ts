"use client";

import { useLatest, useMemoizedFn } from "ahooks";
import { useState } from "react";

import { EMPTY_ARRAY } from "./constants";
import { resolveNextSortDirection } from "./tableEngineHelpers";
import type { DataTableColDef, DataTableFilterModel, DataTableSortModel } from "./types";

interface UseTableSortAndFilterOptions<TData> {
  columnByField: Map<string, DataTableColDef<TData>>;
  controlledSortModel?: DataTableSortModel;
  onSortModelChange?: (model: DataTableSortModel) => void;
  onSortChange?: (field: string, order: "asc" | "desc" | null) => void;
  hasAdapterSortModelHandler?: boolean;
  controlledFilterModel?: DataTableFilterModel;
  onFilterModelChange?: (model: DataTableFilterModel) => void;
  onSearchChange?: (search: string) => void;
  hasAdapterFilterModelHandler?: boolean;
  onResetClientPage: () => void;
}

/**
 * 管理 DataTable 排序模型与筛选/快捷搜索状态（支持受控/非受控双模式）。
 */
export function useTableSortAndFilter<TData>({
  columnByField,
  controlledSortModel,
  onSortModelChange,
  onSortChange,
  hasAdapterSortModelHandler = false,
  controlledFilterModel,
  onFilterModelChange,
  onSearchChange,
  hasAdapterFilterModelHandler = false,
  onResetClientPage,
}: UseTableSortAndFilterOptions<TData>) {
  const [internalSortModel, setInternalSortModel] = useState<DataTableSortModel>(EMPTY_ARRAY);
  const sortModel = controlledSortModel ?? internalSortModel;

  const [internalFilterModel, setInternalFilterModel] = useState<DataTableFilterModel>({
    items: EMPTY_ARRAY,
    quickFilterValues: EMPTY_ARRAY,
  });
  const [internalQuickFilterText, setInternalQuickFilterText] = useState("");

  const filterModel = controlledFilterModel ?? internalFilterModel;
  const quickFilterText =
    controlledFilterModel !== undefined
      ? (controlledFilterModel.quickFilterValues ?? EMPTY_ARRAY).join(" ")
      : internalQuickFilterText;
  const quickFilterTokens = filterModel.quickFilterValues ?? EMPTY_ARRAY;
  const isFiltered = Boolean(
    quickFilterText.trim() || quickFilterTokens.length > 0 || (filterModel.items && filterModel.items.length > 0),
  );

  const latestSortRef = useLatest({ sortModel, columnByField, onSortModelChange, onSortChange });
  const handleSortModelChange = useMemoizedFn((next: DataTableSortModel) => {
    setInternalSortModel(next);
    latestSortRef.current.onSortModelChange?.(next);
    onResetClientPage();
  });

  const handleSortClick = useMemoizedFn((field: string) => {
    const {
      columnByField: colMap,
      sortModel: cur,
      onSortModelChange: notify,
      onSortChange: notifySingle,
    } = latestSortRef.current;
    if (colMap.get(field)?.sortable === false) return;
    const direction = resolveNextSortDirection(cur, field);
    const next: DataTableSortModel = direction ? [{ field, sort: direction }] : EMPTY_ARRAY;
    setInternalSortModel(next);
    notify?.(next);
    if (!hasAdapterSortModelHandler && notifySingle) notifySingle(field, direction);
    onResetClientPage();
  });

  const latestFilterRef = useLatest({ filterModel, controlledFilterModel, onFilterModelChange, onSearchChange });
  const handleFilterModelChange = useMemoizedFn((model: DataTableFilterModel) => {
    if (latestFilterRef.current.controlledFilterModel === undefined) setInternalFilterModel(model);
    latestFilterRef.current.onFilterModelChange?.(model);
    onResetClientPage();
  });

  const handleQuickFilterChange = useMemoizedFn((val: string) => {
    const {
      controlledFilterModel: controlled,
      filterModel: cur,
      onSearchChange: notifySearch,
      onFilterModelChange: notifyModel,
    } = latestFilterRef.current;
    if (notifySearch && controlled !== undefined) {
      notifySearch(val);
      return;
    }
    const trimmed = val.trim();
    const newModel: DataTableFilterModel = {
      ...cur,
      quickFilterValues: trimmed ? trimmed.toLowerCase().split(/\s+/) : (EMPTY_ARRAY as unknown as string[]),
    };
    if (controlled === undefined) {
      setInternalQuickFilterText(val);
      setInternalFilterModel(newModel);
    }
    notifyModel?.(newModel);
    notifySearch?.(val);
    onResetClientPage();
  });

  const handleResetFilters = useMemoizedFn(() => {
    const {
      controlledFilterModel: controlled,
      onFilterModelChange: notifyModel,
      onSearchChange: notifySearch,
    } = latestFilterRef.current;
    const emptyModel: DataTableFilterModel = {
      items: EMPTY_ARRAY as unknown as DataTableFilterModel["items"],
      quickFilterValues: EMPTY_ARRAY as unknown as string[],
    };
    if (controlled === undefined) {
      setInternalQuickFilterText("");
      setInternalFilterModel(emptyModel);
    }
    notifyModel?.(emptyModel);
    if (notifySearch && !hasAdapterFilterModelHandler) notifySearch("");
    onResetClientPage();
  });

  return {
    sortModel,
    handleSortClick,
    handleSortModelChange,
    filterModel,
    quickFilterText,
    quickFilterTokens,
    isFiltered,
    handleFilterModelChange,
    handleQuickFilterChange,
    handleResetFilters,
  };
}
