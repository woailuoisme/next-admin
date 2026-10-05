import { useMemoizedFn } from "ahooks";
import { useEffect, useMemo, useState } from "react";

import type {
  DataTableDensity,
  DataTableFilterModel,
  DataTableSavedView,
  DataTableSortModel,
  DataTableTabItem,
} from "../core/types";

export interface UseDataTableViewsOptions<TData = any> {
  // Status Tabs
  tabs?: DataTableTabItem<TData>[];
  activeTab?: string;
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;

  // Saved Views
  savedViews?: DataTableSavedView[];
  defaultSavedViews?: DataTableSavedView[];
  onSavedViewsChange?: (views: DataTableSavedView[]) => void;
  enableSavedViews?: boolean;
  storageKey?: string;

  // Current table snapshot states
  currentFilterModel?: DataTableFilterModel;
  currentSortModel?: DataTableSortModel;
  currentColumnVisibility?: Record<string, boolean>;
  currentDensity?: DataTableDensity;

  // State setters to apply a view
  onApplyFilterModel?: (model: DataTableFilterModel) => void;
  onApplySortModel?: (model: DataTableSortModel) => void;
  onApplyColumnVisibility?: (model: Record<string, boolean>) => void;
  onApplyDensity?: (density: DataTableDensity) => void;
}

export function useDataTableViews<TData = any>({
  tabs,
  activeTab: controlledActiveTab,
  defaultActiveTab,
  onTabChange,
  savedViews: controlledSavedViews,
  defaultSavedViews = [],
  onSavedViewsChange,
  storageKey,
  currentFilterModel,
  currentSortModel,
  currentColumnVisibility,
  currentDensity,
  onApplyFilterModel,
  onApplySortModel,
  onApplyColumnVisibility,
  onApplyDensity,
}: UseDataTableViewsOptions<TData>) {
  // 1. Status Tabs State
  const initialTab = controlledActiveTab ?? defaultActiveTab ?? tabs?.[0]?.id ?? "";
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState<string>(initialTab);

  const isTabControlled = controlledActiveTab !== undefined;
  const currentActiveTab = isTabControlled ? controlledActiveTab : uncontrolledActiveTab;

  const handleTabChange = useMemoizedFn((tabId: string) => {
    if (!isTabControlled) {
      setUncontrolledActiveTab(tabId);
    }
    onTabChange?.(tabId);

    const targetTab = tabs?.find((t) => t.id === tabId);
    if (targetTab && onApplyFilterModel) {
      onApplyFilterModel(targetTab.filterModel ?? { items: [] });
    }
  });

  // Active tab item
  const activeTabItem = useMemo(() => {
    return tabs?.find((t) => t.id === currentActiveTab);
  }, [tabs, currentActiveTab]);

  // 2. Saved Views State
  const storageKeyViews = storageKey ? `${storageKey}_saved_views` : null;

  const loadStoredViews = (): DataTableSavedView[] => {
    if (typeof window === "undefined" || !storageKeyViews) {
      return defaultSavedViews;
    }
    try {
      const raw = window.localStorage.getItem(storageKeyViews);
      if (!raw) return defaultSavedViews;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : defaultSavedViews;
    } catch {
      return defaultSavedViews;
    }
  };

  const [uncontrolledViews, setUncontrolledViews] = useState<DataTableSavedView[]>(loadStoredViews);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  const isViewsControlled = controlledSavedViews !== undefined;
  const allViews = isViewsControlled ? controlledSavedViews : uncontrolledViews;

  const updateViews = useMemoizedFn((nextViews: DataTableSavedView[]) => {
    if (!isViewsControlled) {
      setUncontrolledViews(nextViews);
      if (storageKeyViews && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(storageKeyViews, JSON.stringify(nextViews));
        } catch {
          // Ignore localStorage quota errors
        }
      }
    }
    onSavedViewsChange?.(nextViews);
  });

  // Apply a saved view
  const applyView = useMemoizedFn((viewId: string) => {
    const targetView = allViews.find((v) => v.id === viewId);
    if (!targetView) return;

    setActiveViewId(viewId);

    if (targetView.filterModel && onApplyFilterModel) {
      onApplyFilterModel(targetView.filterModel);
    }
    if (targetView.sortModel && onApplySortModel) {
      onApplySortModel(targetView.sortModel);
    }
    if (targetView.columnVisibilityModel && onApplyColumnVisibility) {
      onApplyColumnVisibility(targetView.columnVisibilityModel);
    }
    if (targetView.density && onApplyDensity) {
      onApplyDensity(targetView.density);
    }
  });

  // Save current state as new view
  const saveCurrentAsView = useMemoizedFn((name: string) => {
    const newId = `view_${Date.now()}`;
    const newView: DataTableSavedView = {
      id: newId,
      name,
      filterModel: currentFilterModel,
      sortModel: currentSortModel,
      columnVisibilityModel: currentColumnVisibility,
      density: currentDensity,
    };
    updateViews([...allViews, newView]);
    setActiveViewId(newId);
    return newId;
  });

  // Delete a custom view
  const deleteView = useMemoizedFn((viewId: string) => {
    const target = allViews.find((v) => v.id === viewId);
    if (target?.isSystem) return; // Cannot delete system view

    const nextViews = allViews.filter((v) => v.id !== viewId);
    updateViews(nextViews);
    if (activeViewId === viewId) {
      setActiveViewId(null);
    }
  });

  // Rename a custom view
  const renameView = useMemoizedFn((viewId: string, newName: string) => {
    const nextViews = allViews.map((v) => (v.id === viewId ? { ...v, name: newName } : v));
    updateViews(nextViews);
  });

  // Sync default tab if tabs change and activeTab is invalid
  useEffect(() => {
    if (tabs && tabs.length > 0 && !tabs.some((t) => t.id === currentActiveTab)) {
      handleTabChange(tabs[0].id);
    }
  }, [tabs, currentActiveTab, handleTabChange]);

  return {
    // Tabs
    currentActiveTab,
    activeTabItem,
    handleTabChange,

    // Saved Views
    savedViews: allViews,
    activeViewId,
    applyView,
    saveCurrentAsView,
    deleteView,
    renameView,
  };
}

export type UseDataTableViewsReturn = ReturnType<typeof useDataTableViews>;
