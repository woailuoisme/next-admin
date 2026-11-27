"use client";

import { useState } from "react";

import { moveArrayItem } from "../sortableBinding";
import {
  cloneRepeaterItem,
  generateUniqueRepeaterKey,
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

function deduplicateKeys(rawKeys: string[]): string[] {
  const counts = new Map<string, number>();
  return rawKeys.map((base) => {
    const prevCount = counts.get(base) ?? 0;
    counts.set(base, prevCount + 1);
    return prevCount === 0 ? base : `${base}__${prevCount}`;
  });
}

function hasNonEmptyError(err: string | string[] | undefined): boolean {
  if (!err) return false;
  return Array.isArray(err) ? err.length > 0 : true;
}

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
  const [primitiveKeys, setPrimitiveKeys] = useState<string[]>(() => items.map(() => generateUniqueRepeaterKey()));

  if (primitiveKeys.length !== items.length) {
    const nextPool = items.map((_, idx) => primitiveKeys[idx] ?? generateUniqueRepeaterKey());
    setPrimitiveKeys(nextPool);
  }

  const keys = deduplicateKeys(
    items.map((item, index) => resolveRepeaterItemKey(item, index, getItemKey, primitiveKeys)),
  );

  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});
  const [autoExpandedErrorKeys, setAutoExpandedErrorKeys] = useState<Set<string>>(() => new Set());

  const currentErrorKeys = new Set<string>();
  if (autoExpandOnError && itemErrors) {
    keys.forEach((key, index) => {
      if (hasNonEmptyError(itemErrors[index])) {
        currentErrorKeys.add(key);
      }
    });
  }

  const newlyErroredKeys: string[] = [];
  for (const key of currentErrorKeys) {
    if (!autoExpandedErrorKeys.has(key)) {
      newlyErroredKeys.push(key);
    }
  }
  const hasClearedErrors = Array.from(autoExpandedErrorKeys).some((key) => !currentErrorKeys.has(key));

  if (newlyErroredKeys.length > 0 || hasClearedErrors) {
    setAutoExpandedErrorKeys(currentErrorKeys);
    if (newlyErroredKeys.length > 0) {
      setCollapsedMap((prev) => {
        const next = { ...prev };
        for (const k of newlyErroredKeys) {
          next[k] = false;
        }
        return next;
      });
    }
  }

  const effectiveCollapsedMap: Record<string, boolean> = {};
  keys.forEach((key, index) => {
    if (newlyErroredKeys.includes(key)) {
      effectiveCollapsedMap[key] = false;
      return;
    }
    if (key in collapsedMap) {
      effectiveCollapsedMap[key] = Boolean(collapsedMap[key]);
      return;
    }
    const item = items[index] as T;
    effectiveCollapsedMap[key] =
      typeof defaultCollapsed === "function" ? defaultCollapsed(item, index) : Boolean(defaultCollapsed);
  });

  const isAddAllowed = Boolean(
    !disabled &&
    (maxItems === undefined || items.length < maxItems) &&
    (typeof canAdd === "function" ? canAdd(items) : canAdd),
  );

  const checkCanDelete = (item: T, index: number): boolean => {
    if (disabled || items.length <= minItems) return false;
    return typeof canDelete === "function" ? canDelete(item, index) : canDelete;
  };

  const checkCanDuplicate = (_item: T, _index: number): boolean => {
    if (disabled || (maxItems !== undefined && items.length >= maxItems)) return false;
    return canDuplicate;
  };

  const toggleCollapse = (key: string) => {
    if (!collapsible) return;
    const current = Boolean(effectiveCollapsedMap[key]);
    setCollapsedMap((prev) => ({ ...prev, [key]: !current }));
  };

  const expandAll = () => {
    if (!collapsible) return;
    setCollapsedMap(Object.fromEntries(keys.map((k) => [k, false])));
  };

  const collapseAll = () => {
    if (!collapsible) return;
    setCollapsedMap(Object.fromEntries(keys.map((k) => [k, true])));
  };

  const addItem = () => {
    if (!isAddAllowed) return;
    const newItem = createItem();
    if (typeof newItem === "object" && newItem !== null && !getExplicitObjectId(newItem)) {
      getOrAssignObjectKey(newItem);
    }
    setPrimitiveKeys((prev) => [...prev, generateUniqueRepeaterKey()]);
    onChange([...items, newItem]);
  };

  const duplicateItem = (index: number) => {
    const target = items[index];
    if (target === undefined || !checkCanDuplicate(target, index)) return;
    const cloned = cloneRepeaterItem(target, cloneItem);
    const nextItems = [...items];
    nextItems.splice(index + 1, 0, cloned);
    setPrimitiveKeys((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, generateUniqueRepeaterKey());
      return next;
    });
    onChange(nextItems);
  };

  const removeItem = (index: number) => {
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

    setPrimitiveKeys((prev) => prev.filter((_, i) => i !== index));
    onChange(items.filter((_, i) => i !== index));
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (disabled || !reorderable) return;
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return;
    setPrimitiveKeys((prev) => moveArrayItem(prev, fromIndex, toIndex));
    onChange(moveArrayItem(items, fromIndex, toIndex));
  };

  const moveItemUp = (index: number) => moveItem(index, index - 1);
  const moveItemDown = (index: number) => moveItem(index, index + 1);

  const updateItem = (nextVal: T, index: number) => {
    if (index < 0 || index >= items.length) return;
    const prevKey = keys[index];
    if (prevKey && typeof nextVal === "object" && nextVal !== null && !getExplicitObjectId(nextVal)) {
      repeaterObjectKeyRegistry.set(nextVal, prevKey);
    }
    const next = [...items];
    next[index] = nextVal;
    onChange(next);
  };

  const handleReorder = (activeId: string, overId: string) => {
    if (disabled || !reorderable) return;
    const oldIndex = keys.indexOf(activeId);
    const newIndex = keys.indexOf(overId);
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      setPrimitiveKeys((prev) => moveArrayItem(prev, oldIndex, newIndex));
      onChange(moveArrayItem(items, oldIndex, newIndex));
    }
  };

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
