import { useState } from "react";

import type { DataTableFilterItem, DataTableFilterModel } from "../../../core/types";
import { isActiveFilterItem, isQueryBuilderRule } from "../utils";

export interface UseFilterPanelStateOptions {
  filterModel: DataTableFilterModel;
  onFilterModelChange: (model: DataTableFilterModel) => void;
  deferFilters?: boolean;
}

export interface UseFilterPanelStateResult {
  open: boolean;
  setOpen: (val: boolean) => void;
  currentItems: DataTableFilterItem[];
  activeCount: number;
  handleValueChange: (field: string, val: any) => void;
  handleAddRule: (field: string, operator?: DataTableFilterItem["operator"], value?: any) => void;
  handleUpdateRule: (id: string, patch: Partial<DataTableFilterItem>) => void;
  handleRemoveRule: (id: string) => void;
  handleResetAll: () => void;
  handleApply: () => void;
}

function generateFilterId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 9);
}

export function useFilterPanelState({
  filterModel,
  onFilterModelChange,
  deferFilters = false,
}: UseFilterPanelStateOptions): UseFilterPanelStateResult {
  const [open, setOpenState] = useState(false);

  const externalItems = filterModel.items || [];
  // Track the external items reference that draft edits are based on so external mutations
  // (pills, status tabs, saved views) immediately reset stale drafts even in aboveContent mode.
  const [draftState, setDraftState] = useState<{
    baseItems: DataTableFilterItem[];
    items: DataTableFilterItem[];
  } | null>(null);

  const setOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraftState(null);
    }
    setOpenState(nextOpen);
  };

  const currentItems = deferFilters
    ? draftState && draftState.baseItems === externalItems
      ? draftState.items
      : externalItems
    : externalItems;

  const activeCount = externalItems.filter(isActiveFilterItem).length;

  const updateItems = (updater: (prevItems: DataTableFilterItem[]) => DataTableFilterItem[]) => {
    if (deferFilters) {
      setDraftState((prev) => {
        const base = prev && prev.baseItems === externalItems ? prev.items : externalItems;
        return { baseItems: externalItems, items: updater(base) };
      });
    } else {
      onFilterModelChange({
        ...filterModel,
        items: updater(externalItems),
      });
    }
  };

  const handleValueChange = (field: string, val: any) => {
    updateItems((prevItems) => {
      if (val === undefined || val === null || val === "" || val === "__all__") {
        return prevItems.filter((i) => !(!isQueryBuilderRule(i) && i.field === field));
      }
      const existingIndex = prevItems.findIndex(
        (i) => !isQueryBuilderRule(i) && i.field === field && (i.operator === "equals" || i.operator === "is"),
      );
      if (existingIndex >= 0) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          operator: "equals",
          value: val,
        };
        return updated;
      }
      return [
        ...prevItems,
        {
          id: generateFilterId(),
          field,
          operator: "equals",
          value: val,
        },
      ];
    });
  };

  const handleAddRule = (field: string, operator: DataTableFilterItem["operator"] = "contains", value: any = "") => {
    const newRule: DataTableFilterItem = {
      id: `qb_${generateFilterId()}`,
      field,
      operator,
      value,
    };
    updateItems((prevItems) => [...prevItems, newRule]);
  };

  const handleUpdateRule = (id: string, patch: Partial<DataTableFilterItem>) => {
    updateItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleRemoveRule = (id: string) => {
    updateItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleResetAll = () => {
    if (deferFilters) {
      setDraftState(null);
    }
    onFilterModelChange({
      ...filterModel,
      items: [],
    });
  };

  const handleApply = () => {
    if (deferFilters) {
      onFilterModelChange({
        ...filterModel,
        items: currentItems,
      });
      setDraftState(null);
    }
    setOpen(false);
  };

  return {
    open,
    setOpen,
    currentItems,
    activeCount,
    handleValueChange,
    handleAddRule,
    handleUpdateRule,
    handleRemoveRule,
    handleResetAll,
    handleApply,
  };
}
