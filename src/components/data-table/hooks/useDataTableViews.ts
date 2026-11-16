"use client";

import { useMemoizedFn } from "ahooks";
import { useMemo, useState } from "react";

import { useIsHydrated } from "@/hooks/useIsHydrated";

function readStoredViews(
  storageKeyViews: string | null,
  defaultSavedViews: DataTableSavedView[],
): DataTableSavedView[] {
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
}

import { EMPTY_ARRAY } from "../core/constants";
import type {
  DataTableDensity,
  DataTableFilterModel,
  DataTableSavedView,
  DataTableSortModel,
  DataTableTabItem,
} from "../core/types";

export interface UseDataTableViewsOptions<TData = unknown> {
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

export function useDataTableViews<TData = unknown>({
  tabs,
  activeTab: controlledActiveTab,
  defaultActiveTab,
  onTabChange,
  savedViews: controlledSavedViews,
  defaultSavedViews = EMPTY_ARRAY,
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
  const rawActiveTab = isTabControlled ? controlledActiveTab : uncontrolledActiveTab;
  const currentActiveTab =
    tabs && tabs.length > 0 && !tabs.some((t) => t.id === rawActiveTab) ? tabs[0].id : rawActiveTab;

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

  const isHydrated = useIsHydrated();
  const storedViews = useMemo(
    () => (isHydrated ? readStoredViews(storageKeyViews, defaultSavedViews) : defaultSavedViews),
    [isHydrated, defaultSavedViews, storageKeyViews],
  );
  const [overrideViewsState, setOverrideViewsState] = useState<{
    key: string | null;
    views: DataTableSavedView[];
  } | null>(null);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  const isViewsControlled = controlledSavedViews !== undefined;
  const uncontrolledViews =
    overrideViewsState && overrideViewsState.key === storageKeyViews ? overrideViewsState.views : storedViews;
  const allViews = isViewsControlled ? controlledSavedViews : uncontrolledViews;

  const updateViews = useMemoizedFn((nextViews: DataTableSavedView[]) => {
    if (!isViewsControlled) {
      setOverrideViewsState({ key: storageKeyViews, views: nextViews });
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
    const newId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? `view_${crypto.randomUUID()}`
        : `view_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
