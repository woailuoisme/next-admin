"use client";

import { useMemoizedFn } from "ahooks";
import { useState } from "react";

import { moveArrayItem } from "../sortableBinding";
import {
  cloneRepeaterItem,
  getExplicitObjectId,
  getOrAssignObjectKey,
  repeaterObjectKeyRegistry,
  resolveRepeaterItemKey,
} from "./repeaterKeys";
import type { RepeaterProps } from "./types";

interface UseRepeaterControllerOptions<T> extends Pick<
  RepeaterProps<T>,
  | "createItem"
  | "cloneItem"
  | "getItemKey"
  | "minItems"
  | "maxItems"
  | "collapsible"
  | "defaultCollapsed"
  | "reorderable"
  | "canAdd"
  | "canDelete"
  | "canDuplicate"
  | "itemErrors"
  | "autoExpandOnError"
> {
  items: T[];
  onChange: (items: T[]) => void;
  disabled?: boolean;
}

export { generateUniqueRepeaterKey, resolveRepeaterItemKey } from "./repeaterKeys";

export function useRepeaterController<T>({
  items,
  onChange,
  disabled,
  createItem,
  cloneItem,
  getItemKey,
  minItems = 0,
  maxItems,
  collapsible = true,
  defaultCollapsed = false,
  reorderable = true,
  canAdd = true,
  canDelete = true,
  canDuplicate = true,
  itemErrors,
  autoExpandOnError = true,
}: UseRepeaterControllerOptions<T>) {
  const keys = items.map((item, index) => resolveRepeaterItemKey(item, index, getItemKey));

  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  const effectiveCollapsedMap = (() => {
    const errorIndices = autoExpandOnError && itemErrors ? new Set(Object.keys(itemErrors).map(Number)) : null;
    const next: Record<string, boolean> = {};

    keys.forEach((key, index) => {
      if (errorIndices?.has(index)) {
        next[key] = false;
        return;
      }
      if (key in collapsedMap) {
        next[key] = Boolean(collapsedMap[key]);
        return;
      }
      const item = items[index] as T;
      next[key] = typeof defaultCollapsed === "function" ? defaultCollapsed(item, index) : Boolean(defaultCollapsed);
    });

    return next;
  })();

  const isAddAllowed = Boolean(
    !disabled &&
    (maxItems === undefined || items.length < maxItems) &&
    (typeof canAdd === "function" ? canAdd(items) : canAdd),
  );

  const checkCanDelete = useMemoizedFn((item: T, index: number): boolean => {
    if (disabled || items.length <= minItems) return false;
    return typeof canDelete === "function" ? canDelete(item, index) : canDelete;
  });

  const checkCanDuplicate = useMemoizedFn((_item: T, _index: number): boolean => {
    if (disabled || (maxItems !== undefined && items.length >= maxItems)) return false;
    return canDuplicate;
  });

  const toggleCollapse = useMemoizedFn((key: string) => {
    if (!collapsible) return;
    const current = Boolean(effectiveCollapsedMap[key]);
    setCollapsedMap((prev) => ({ ...prev, [key]: !current }));
  });

  const expandAll = useMemoizedFn(() => {
    if (!collapsible) return;
    setCollapsedMap(Object.fromEntries(keys.map((k) => [k, false])));
  });

  const collapseAll = useMemoizedFn(() => {
    if (!collapsible) return;
    setCollapsedMap(Object.fromEntries(keys.map((k) => [k, true])));
  });

  const addItem = useMemoizedFn(() => {
    if (!isAddAllowed) return;
    const newItem = createItem();
    if (typeof newItem === "object" && newItem !== null && !getExplicitObjectId(newItem)) {
      getOrAssignObjectKey(newItem);
    }
    onChange([...items, newItem]);
  });

  const duplicateItem = useMemoizedFn((index: number) => {
    const target = items[index];
    if (target === undefined || !checkCanDuplicate(target, index)) return;
    const cloned = cloneRepeaterItem(target, cloneItem);
    const nextItems = [...items];
    nextItems.splice(index + 1, 0, cloned);
    onChange(nextItems);
  });

  const removeItem = useMemoizedFn((index: number) => {
    const target = items[index];
    if (target === undefined || !checkCanDelete(target, index)) return;

    const targetKey = keys[index];
    if (targetKey) {
      setCollapsedMap((prev) => {
        if (!(targetKey in prev)) return prev;
        const next = { ...prev };
        delete next[targetKey];
        return next;
      });
    }

    onChange(items.filter((_, i) => i !== index));
  });

  const moveItem = useMemoizedFn((fromIndex: number, toIndex: number) => {
    if (disabled || !reorderable) return;
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return;
    onChange(moveArrayItem(items, fromIndex, toIndex));
  });

  const moveItemUp = useMemoizedFn((index: number) => moveItem(index, index - 1));
  const moveItemDown = useMemoizedFn((index: number) => moveItem(index, index + 1));

  const updateItem = useMemoizedFn((nextVal: T, index: number) => {
    if (index < 0 || index >= items.length) return;
    const prevKey = keys[index];
    if (prevKey && typeof nextVal === "object" && nextVal !== null && !getExplicitObjectId(nextVal)) {
      repeaterObjectKeyRegistry.set(nextVal, prevKey);
    }
    const next = [...items];
    next[index] = nextVal;
    onChange(next);
  });

  const handleReorder = useMemoizedFn((activeId: string, overId: string) => {
    if (disabled || !reorderable) return;
    const oldIndex = keys.indexOf(activeId);
    const newIndex = keys.indexOf(overId);
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      onChange(moveArrayItem(items, oldIndex, newIndex));
    }
  });

  return {
    keys,
    collapsedMap: effectiveCollapsedMap,
    isAddAllowed,
    checkCanDelete,
    checkCanDuplicate,
    toggleCollapse,
    expandAll,
    collapseAll,
    addItem,
    duplicateItem,
    removeItem,
    moveItemUp,
    moveItemDown,
    updateItem,
    handleReorder,
  };
}
