import { useMemoizedFn } from "ahooks";
import { useMemo, useState } from "react";

import type { DataTableFilterItem, DataTableFilterModel } from "../../../core/types";

export interface UseFilterPanelStateOptions {
  filterModel: DataTableFilterModel;
  onFilterModelChange: (model: DataTableFilterModel) => void;
  deferFilters?: boolean;
}

export interface UseFilterPanelStateResult {
  open: boolean;
  setOpen: (val: boolean) => void;
  currentItems: DataTableFilterItem[];
  draftItems: DataTableFilterItem[];
  activeCount: number;
  handleSelectChange: (field: string, val: string) => void;
  handleTernaryChange: (field: string, val: string) => void;
  handleCustomChange: (field: string, val: any) => void;
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

const isPreset = (item: DataTableFilterItem) => !item.id?.startsWith("qb_");

export function useFilterPanelState({
  filterModel,
  onFilterModelChange,
  deferFilters = false,
}: UseFilterPanelStateOptions): UseFilterPanelStateResult {
  const [open, setOpen] = useState(false);

  // Local draft state for deferred filter commits
  const [draftItems, setDraftItems] = useState<DataTableFilterItem[]>(filterModel.items || []);
  const [prevFilterItems, setPrevFilterItems] = useState(filterModel.items);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen || (open && filterModel.items !== prevFilterItems)) {
    setPrevOpen(open);
    setPrevFilterItems(filterModel.items);
    if (open) {
      setDraftItems(filterModel.items || []);
    }
  }

  const currentItems = deferFilters ? draftItems : filterModel.items || [];

  const activeCount = useMemo(
    () =>
      (filterModel.items || []).filter(
        (item) =>
          item.operator === "isEmpty" ||
          item.operator === "isNotEmpty" ||
          (item.value !== undefined && item.value !== "" && item.value !== "__all__"),
      ).length,
    [filterModel.items],
  );

  const updateItems = useMemoizedFn((nextItems: DataTableFilterItem[]) => {
    if (deferFilters) {
      setDraftItems(nextItems);
    } else {
      onFilterModelChange({
        ...filterModel,
        items: nextItems,
      });
    }
  });

  const setFieldFilter = useMemoizedFn(
    (field: string, val: unknown, operator: DataTableFilterItem["operator"] = "equals") => {
      if (val === undefined || val === null || val === "" || val === "__all__") {
        updateItems(currentItems.filter((i) => !(isPreset(i) && i.field === field)));
      } else {
        const existingIndex = currentItems.findIndex(
          (i) => isPreset(i) && i.field === field && (operator ? i.operator === operator : true),
        );
        if (existingIndex >= 0) {
          const updated = [...currentItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            value: val,
          };
          updateItems(updated);
        } else {
          updateItems([
            ...currentItems,
            {
              id: generateFilterId(),
              field,
              operator,
              value: val,
            },
          ]);
        }
      }
    },
  );

  const handleValueChange = useMemoizedFn((field: string, val: any) => {
    setFieldFilter(field, val, "equals");
  });

  const handleAddRule = useMemoizedFn(
    (field: string, operator: DataTableFilterItem["operator"] = "contains", value: any = "") => {
      const newRule: DataTableFilterItem = {
        id: `qb_${generateFilterId()}`,
        field,
        operator,
        value,
      };
      updateItems([...currentItems, newRule]);
    },
  );

  const handleUpdateRule = useMemoizedFn((id: string, patch: Partial<DataTableFilterItem>) => {
    const updated = currentItems.map((item) => (item.id === id ? { ...item, ...patch } : item));
    updateItems(updated);
  });

  const handleRemoveRule = useMemoizedFn((id: string) => {
    updateItems(currentItems.filter((item) => item.id !== id));
  });

  const handleResetAll = useMemoizedFn(() => {
    if (deferFilters) {
      setDraftItems([]);
    }
    onFilterModelChange({
      ...filterModel,
      items: [],
    });
  });

  const handleApply = useMemoizedFn(() => {
    if (deferFilters) {
      onFilterModelChange({
        ...filterModel,
        items: draftItems,
      });
    }
    setOpen(false);
  });

  return {
    open,
    setOpen,
    currentItems,
    draftItems,
    activeCount,
    handleSelectChange: handleValueChange,
    handleTernaryChange: handleValueChange,
    handleCustomChange: handleValueChange,
    handleAddRule,
    handleUpdateRule,
    handleRemoveRule,
    handleResetAll,
    handleApply,
  };
}
