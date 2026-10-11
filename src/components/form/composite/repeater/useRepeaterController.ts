import { type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMemoizedFn } from "ahooks";
import { useMemo, useState } from "react";

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

let keySeq = 0;
function generateUniqueKey(): string {
  keySeq += 1;
  return `rep-${Date.now()}-${keySeq}-${Math.random().toString(36).slice(2, 7)}`;
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
  // 稳定 item 唯一键列表
  const [itemKeys, setItemKeys] = useState<string[]>(() => items.map(() => generateUniqueKey()));
  const [prevItemCount, setPrevItemCount] = useState(items.length);

  // 保证 keys 数量与 items 一致（React 推荐的状态与 props 同步模式）
  if (items.length !== prevItemCount) {
    setPrevItemCount(items.length);
    const nextKeys = [...itemKeys];
    while (nextKeys.length < items.length) {
      nextKeys.push(generateUniqueKey());
    }
    setItemKeys(nextKeys.slice(0, items.length));
  }

  // 获取条目的唯一稳定 Key
  const resolveItemKey = useMemoizedFn((item: T, index: number): string => {
    if (getItemKey) return getItemKey(item, index);
    if (typeof item === "object" && item !== null) {
      const rec = item as Record<string, unknown>;
      if (rec.id !== undefined && rec.id !== null) return String(rec.id);
      if (rec._id !== undefined && rec._id !== null) return String(rec._id);
      if (rec.key !== undefined && rec.key !== null) return String(rec.key);
    }
    return itemKeys[index] || `item-${index}`;
  });

  // 以 itemKey 为维度的折叠状态记录
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item, index) => {
      const key = resolveItemKey(item, index);
      if (key) {
        const isDefault =
          typeof defaultCollapsed === "function" ? defaultCollapsed(item, index) : Boolean(defaultCollapsed);
        initial[key] = isDefault;
      }
    });
    return initial;
  });

  // 当前渲染的所有稳定 keys
  const keys = items.map((item, index) => resolveItemKey(item, index));

  // 错误自动展开：通过 render 期间衍生值，消除 useEffect 级联渲染
  const effectiveCollapsedMap = useMemo(() => {
    if (!autoExpandOnError || !itemErrors) return collapsedMap;
    const errorIndices = Object.keys(itemErrors).map(Number);
    if (errorIndices.length === 0) return collapsedMap;

    let hasChange = false;
    const next = { ...collapsedMap };
    for (const idx of errorIndices) {
      const item = items[idx];
      if (item !== undefined) {
        const key = resolveItemKey(item, idx);
        if (next[key]) {
          next[key] = false;
          hasChange = true;
        }
      }
    }
    return hasChange ? next : collapsedMap;
  }, [collapsedMap, autoExpandOnError, itemErrors, items, resolveItemKey]);

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
    const newKey = generateUniqueKey();
    setItemKeys((prev) => [...prev, newKey]);
    const newItem = createItem();
    onChange([...items, newItem]);
  });

  // 动作：克隆现有项
  const duplicateItem = useMemoizedFn((index: number) => {
    const target = items[index];
    if (!target || !checkCanDuplicate(target, index)) return;

    let cloned: T;
    if (cloneItem) {
      cloned = cloneItem(target);
    } else if (typeof structuredClone === "function") {
      cloned = structuredClone(target);
    } else {
      cloned = JSON.parse(JSON.stringify(target));
    }

    // 若对象内部带有 id/_id，剔除或换新，避免主键冲突
    if (typeof cloned === "object" && cloned !== null) {
      const rec = cloned as Record<string, unknown>;
      if ("id" in rec) rec.id = generateUniqueKey();
      if ("_id" in rec) rec._id = generateUniqueKey();
    }

    const nextItems = [...items];
    nextItems.splice(index + 1, 0, cloned);

    setItemKeys((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, generateUniqueKey());
      return next;
    });

    onChange(nextItems);
  });

  // 动作：删除单项
  const removeItem = useMemoizedFn((index: number) => {
    const target = items[index];
    if (!target || !checkCanDelete(target, index)) return;

    const targetKey = keys[index] || itemKeys[index];
    if (targetKey) {
      setCollapsedMap((prev) => {
        const next = { ...prev };
        delete next[targetKey];
        return next;
      });
    }

    setItemKeys((prev) => prev.filter((_, i) => i !== index));
    onChange(items.filter((_, i) => i !== index));
  });

  // 动作：按索引移动
  const moveItem = useMemoizedFn((fromIndex: number, toIndex: number) => {
    if (disabled || !reorderable) return;
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return;

    setItemKeys((prev) => arrayMove(prev, fromIndex, toIndex));
    onChange(arrayMove(items, fromIndex, toIndex));
  });

  const moveItemUp = useMemoizedFn((index: number) => {
    moveItem(index, index - 1);
  });

  const moveItemDown = useMemoizedFn((index: number) => {
    moveItem(index, index + 1);
  });

  // 动作：更新单项值
  const updateItem = useMemoizedFn((nextVal: T, index: number) => {
    if (index < 0 || index >= items.length) return;
    const next = [...items];
    next[index] = nextVal;
    onChange(next);
  });

  // @dnd-kit sensors 与 拖拽结束处理
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useMemoizedFn((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = keys.indexOf(String(active.id));
    const newIndex = keys.indexOf(String(over.id));

    if (oldIndex !== -1 && newIndex !== -1) {
      setItemKeys((prev) => arrayMove(prev, oldIndex, newIndex));
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  });

  return {
    keys,
    collapsedMap: effectiveCollapsedMap,
    sensors,
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
    handleDragEnd,
  };
}
