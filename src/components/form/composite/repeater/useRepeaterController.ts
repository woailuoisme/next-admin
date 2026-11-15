"use client";

import { useMemoizedFn } from "ahooks";
import { useMemo, useState } from "react";

import type { RepeaterProps } from "./types";

import { moveArrayItem } from "../sortableBinding";

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

let keySeq = 0;
export function generateUniqueRepeaterKey(): string {
  keySeq += 1;
  return `rep-${Date.now()}-${keySeq}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * 基于 WeakMap 维护无主键对象的稳定 React key（绝不读取可编辑字段 `item.key`），
 * 并在 `updateItem` 生成新对象引用时无缝迁移 key，杜绝击键失焦或等长替换错乱。
 */
const objectKeyRegistry = new WeakMap<object, string>();

function getExplicitObjectId(item: unknown): string | null {
  if (typeof item !== "object" || item === null) return null;
  const rec = item as Record<string, unknown>;
  if (rec.id !== undefined && rec.id !== null && rec.id !== "") return String(rec.id);
  if (rec._id !== undefined && rec._id !== null && rec._id !== "") return String(rec._id);
  return null;
}

function getOrAssignObjectKey(obj: object): string {
  const existing = objectKeyRegistry.get(obj);
  if (existing) return existing;
  const assigned = generateUniqueRepeaterKey();
  objectKeyRegistry.set(obj, assigned);
  return assigned;
}

export function resolveRepeaterItemKey<T>(
  item: T,
  index: number,
  getItemKey?: (item: T, index: number) => string,
): string {
  if (getItemKey) return getItemKey(item, index);
  const explicitId = getExplicitObjectId(item);
  if (explicitId) return explicitId;
  if (typeof item === "object" && item !== null) {
    return getOrAssignObjectKey(item);
  }
  return `rep-prim-${index}`;
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
  // 当前渲染的所有稳定 keys（纯派生，无 render 期 setState）
  const keys = useMemo(
    () => items.map((item, index) => resolveRepeaterItemKey(item, index, getItemKey)),
    [items, getItemKey],
  );

  // 以 itemKey 为维度的折叠状态记录
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item, index) => {
      const key = resolveRepeaterItemKey(item, index, getItemKey);
      const isDefault =
        typeof defaultCollapsed === "function" ? defaultCollapsed(item, index) : Boolean(defaultCollapsed);
      initial[key] = isDefault;
    });
    return initial;
  });

  // 错误自动展开：通过 render 期间衍生值，消除 useEffect 级联渲染
  const effectiveCollapsedMap = useMemo(() => {
    if (!autoExpandOnError || !itemErrors) return collapsedMap;
    const errorIndices = Object.keys(itemErrors).map(Number);
    if (errorIndices.length === 0) return collapsedMap;

    let hasChange = false;
    const next = { ...collapsedMap };
    for (const idx of errorIndices) {
      const key = keys[idx];
      if (key && next[key]) {
        next[key] = false;
        hasChange = true;
      }
    }
    return hasChange ? next : collapsedMap;
  }, [collapsedMap, autoExpandOnError, itemErrors, keys]);

  // 计算全局新增权限
  const isAddAllowed = Boolean(
    !disabled &&
    (maxItems === undefined || items.length < maxItems) &&
    (typeof canAdd === "function" ? canAdd(items) : canAdd),
  );

  // 计算单项删除权限
  const checkCanDelete = useMemoizedFn((item: T, index: number): boolean => {
    if (disabled || items.length <= minItems) return false;
    return typeof canDelete === "function" ? canDelete(item, index) : canDelete;
  });

  // 计算单项克隆权限
  const checkCanDuplicate = useMemoizedFn((_item: T, _index: number): boolean => {
    if (disabled || (maxItems !== undefined && items.length >= maxItems)) return false;
    return canDuplicate;
  });

  // 动作：切换单项折叠
  const toggleCollapse = useMemoizedFn((key: string) => {
    if (!collapsible) return;
    setCollapsedMap((prev) => ({ ...prev, [key]: !prev[key] }));
  });

  // 动作：全部展开
  const expandAll = useMemoizedFn(() => {
    if (!collapsible) return;
    const next: Record<string, boolean> = {};
    for (const k of keys) {
      next[k] = false;
    }
    setCollapsedMap(next);
  });

  // 动作：全部折叠
  const collapseAll = useMemoizedFn(() => {
    if (!collapsible) return;
    const next: Record<string, boolean> = {};
    for (const k of keys) {
      next[k] = true;
    }
    setCollapsedMap(next);
  });

  // 动作：添加新项
  const addItem = useMemoizedFn(() => {
    if (!isAddAllowed) return;
    const newItem = createItem();
    if (typeof newItem === "object" && newItem !== null && !getExplicitObjectId(newItem)) {
      getOrAssignObjectKey(newItem);
    }
    onChange([...items, newItem]);
  });

  // 动作：克隆现有项
  const duplicateItem = useMemoizedFn((index: number) => {
    const target = items[index];
    if (target === undefined || !checkCanDuplicate(target, index)) return;

    let cloned: T;
    if (cloneItem) {
      cloned = cloneItem(target);
    } else if (typeof structuredClone === "function") {
      cloned = structuredClone(target);
    } else {
      cloned = JSON.parse(JSON.stringify(target));
    }

    // 若对象内部带有 id/_id，换新主键避免冲突；无主键对象自动分配独立 WeakMap key
    if (typeof cloned === "object" && cloned !== null) {
      const rec = cloned as Record<string, unknown>;
      if ("id" in rec) rec.id = generateUniqueRepeaterKey();
      if ("_id" in rec) rec._id = generateUniqueRepeaterKey();
      if (!getExplicitObjectId(cloned)) {
        objectKeyRegistry.set(cloned, generateUniqueRepeaterKey());
      }
    }

    const nextItems = [...items];
    nextItems.splice(index + 1, 0, cloned);
    onChange(nextItems);
  });

  // 动作：删除单项
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

  // 动作：按索引移动
  const moveItem = useMemoizedFn((fromIndex: number, toIndex: number) => {
    if (disabled || !reorderable) return;
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return;
    onChange(moveArrayItem(items, fromIndex, toIndex));
  });

  const moveItemUp = useMemoizedFn((index: number) => {
    moveItem(index, index - 1);
  });

  const moveItemDown = useMemoizedFn((index: number) => {
    moveItem(index, index + 1);
  });

  // 动作：更新单项值（不可变替换对象引用时自动沿用旧对象 React key，防止输入框失焦卸载）
  const updateItem = useMemoizedFn((nextVal: T, index: number) => {
    if (index < 0 || index >= items.length) return;
    const prevKey = keys[index];
    if (prevKey && typeof nextVal === "object" && nextVal !== null && !getExplicitObjectId(nextVal)) {
      objectKeyRegistry.set(nextVal, prevKey);
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
