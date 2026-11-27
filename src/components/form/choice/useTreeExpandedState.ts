"use client";

import { type MouseEvent, type MutableRefObject, useState } from "react";

import type { InternalTreeNode, TreeSelectNode, TreeSelectValue } from "./treeEngine";

interface UseTreeExpandedStateOptions {
  nodeMap: Map<TreeSelectValue, InternalTreeNode>;
  treeDefaultExpandAll: boolean;
  treeExpandedKeys?: TreeSelectValue[];
  onTreeExpand?: (keys: TreeSelectValue[]) => void;
  hasSearchFilter: boolean;
  searchKeyword: string;
  searchExpandedKeys: Set<TreeSelectValue>;
  loadData?: (node: TreeSelectNode) => Promise<void> | void;
  isMountedRef: MutableRefObject<boolean>;
}

interface SearchCollapseState {
  keyword: string;
  collapsed: Set<TreeSelectValue>;
}

export function useTreeExpandedState({
  nodeMap,
  treeDefaultExpandAll,
  treeExpandedKeys: controlledExpandedKeys,
  onTreeExpand,
  hasSearchFilter,
  searchKeyword,
  searchExpandedKeys,
  loadData,
  isMountedRef,
}: UseTreeExpandedStateOptions) {
  const isExpandControlled = controlledExpandedKeys !== undefined;
  const [loadingKeys, setLoadingKeys] = useState<Set<TreeSelectValue>>(() => new Set());
  const [uncontrolledExpandedKeys, setUncontrolledExpandedKeys] = useState<Set<TreeSelectValue> | null>(() =>
    treeDefaultExpandAll ? null : new Set<TreeSelectValue>(),
  );
  const [searchCollapseState, setSearchCollapseState] = useState<SearchCollapseState | null>(null);

  const activeExpandedKeys =
    isExpandControlled && controlledExpandedKeys
      ? new Set(controlledExpandedKeys)
      : uncontrolledExpandedKeys === null
        ? new Set(Array.from(nodeMap.keys()))
        : uncontrolledExpandedKeys;

  const activeCollapsedDuringSearch =
    hasSearchFilter && searchCollapseState !== null && searchCollapseState.keyword === searchKeyword
      ? searchCollapseState.collapsed
      : new Set<TreeSelectValue>();

  const setExpandedKeysState = (updater: (prev: Set<TreeSelectValue>) => Set<TreeSelectValue>) => {
    const next = updater(activeExpandedKeys);
    if (!isExpandControlled) setUncontrolledExpandedKeys(next);
    onTreeExpand?.(Array.from(next));
  };

  let effectiveExpandedKeys = activeExpandedKeys;
  if (hasSearchFilter) {
    const merged = new Set(activeExpandedKeys);
    for (const key of searchExpandedKeys) {
      if (!activeCollapsedDuringSearch.has(key)) {
        merged.add(key);
      }
    }
    effectiveExpandedKeys = merged;
  }

  const handleToggleExpand = async (node: InternalTreeNode, e?: MouseEvent) => {
    e?.stopPropagation();
    const key = node.key;
    if (loadingKeys.has(key)) return;

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

    if (hasSearchFilter && searchExpandedKeys.has(key)) {
      const nextCollapsed = new Set(activeCollapsedDuringSearch);
      if (isExpanded) {
        nextCollapsed.add(key);
      } else {
        nextCollapsed.delete(key);
      }
      setSearchCollapseState({ keyword: searchKeyword, collapsed: nextCollapsed });
    }

    setExpandedKeysState((prev) => {
      const next = new Set(prev);
      if (isExpanded) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return { effectiveExpandedKeys, loadingKeys, handleToggleExpand };
}
