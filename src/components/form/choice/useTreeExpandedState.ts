"use client";

import { useMemoizedFn } from "ahooks";
import { type MouseEvent, type MutableRefObject, useState } from "react";

import type { InternalTreeNode, TreeSelectNode, TreeSelectValue } from "./treeEngine";

interface UseTreeExpandedStateOptions {
  nodeMap: Map<TreeSelectValue, InternalTreeNode>;
  treeDefaultExpandAll: boolean;
  treeExpandedKeys?: TreeSelectValue[];
  onTreeExpand?: (keys: TreeSelectValue[]) => void;
  hasSearchFilter: boolean;
  searchExpandedKeys: Set<TreeSelectValue>;
  loadData?: (node: TreeSelectNode) => Promise<void> | void;
  isMountedRef: MutableRefObject<boolean>;
}

export function useTreeExpandedState({
  nodeMap,
  treeDefaultExpandAll,
  treeExpandedKeys: controlledExpandedKeys,
  onTreeExpand,
  hasSearchFilter,
  searchExpandedKeys,
  loadData,
  isMountedRef,
}: UseTreeExpandedStateOptions) {
  const isExpandControlled = controlledExpandedKeys !== undefined;
  const [loadingKeys, setLoadingKeys] = useState<Set<TreeSelectValue>>(() => new Set());
  const [uncontrolledExpandedKeys, setUncontrolledExpandedKeys] = useState<Set<TreeSelectValue> | null>(() =>
    treeDefaultExpandAll ? null : new Set<TreeSelectValue>(),
  );

  const activeExpandedKeys =
    isExpandControlled && controlledExpandedKeys
      ? new Set(controlledExpandedKeys)
      : uncontrolledExpandedKeys === null
        ? new Set(Array.from(nodeMap.keys()))
        : uncontrolledExpandedKeys;

  const setExpandedKeysState = useMemoizedFn((updater: (prev: Set<TreeSelectValue>) => Set<TreeSelectValue>) => {
    const next = updater(activeExpandedKeys);
    if (!isExpandControlled) setUncontrolledExpandedKeys(next);
    onTreeExpand?.(Array.from(next));
  });

  const effectiveExpandedKeys = hasSearchFilter
    ? new Set([...activeExpandedKeys, ...searchExpandedKeys])
    : activeExpandedKeys;

  const handleToggleExpand = useMemoizedFn(async (node: InternalTreeNode, e?: MouseEvent) => {
    e?.stopPropagation();
    const key = node.key;
    const isExpanded = effectiveExpandedKeys.has(key);

    if (!isExpanded && !node.isLeaf && node.childrenKeys.length === 0 && loadData) {
      setLoadingKeys((prev) => new Set(prev).add(key));
      try {
        await loadData(node.raw);
      } catch {
        return;
      } finally {
        if (isMountedRef.current) {
          setLoadingKeys((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }
      }
    }

    setExpandedKeysState((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  });

  return { effectiveExpandedKeys, loadingKeys, handleToggleExpand };
}
