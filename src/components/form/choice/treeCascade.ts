import type { InternalTreeNode, ShowCheckedStrategy, TreeSelectNode, TreeSelectValue } from "./treeSelectEngine";

/** Resolves full checked and indeterminate (half-checked) key sets using bottom-up aggregation. */
export function resolveCascadingCheckedState(
  selectedKeys: Set<TreeSelectValue>,
  nodeMap: Map<TreeSelectValue, InternalTreeNode>,
): {
  checkedKeys: Set<TreeSelectValue>;
  halfCheckedKeys: Set<TreeSelectValue>;
} {
  const checkedKeys = new Set<TreeSelectValue>(selectedKeys);
  const halfCheckedKeys = new Set<TreeSelectValue>();

  for (const key of selectedKeys) {
    const item = nodeMap.get(key);
    if (item && item.descendantKeys.length > 0) {
      for (const descKey of item.descendantKeys) {
        const descNode = nodeMap.get(descKey);
        if (descNode && !descNode.disabled && !descNode.disableCheckbox) {
          checkedKeys.add(descKey);
        }
      }
    }
  }

  const sortedKeys = Array.from(nodeMap.values())
    .sort((a, b) => b.level - a.level)
    .map((item) => item.key);

  for (const key of sortedKeys) {
    const item = nodeMap.get(key);
    if (!item || item.childrenKeys.length === 0) continue;

    const selectableChildren = item.childrenKeys.filter((ck) => {
      const child = nodeMap.get(ck);
      return child && !child.disabled && !child.disableCheckbox;
    });
    if (selectableChildren.length === 0) continue;

    const allChildrenChecked = selectableChildren.every((ck) => checkedKeys.has(ck));
    const someChildrenCheckedOrHalf = selectableChildren.some((ck) => checkedKeys.has(ck) || halfCheckedKeys.has(ck));

    if (allChildrenChecked) {
      checkedKeys.add(key);
      halfCheckedKeys.delete(key);
    } else if (someChildrenCheckedOrHalf) {
      checkedKeys.delete(key);
      halfCheckedKeys.add(key);
    } else {
      checkedKeys.delete(key);
      halfCheckedKeys.delete(key);
    }
  }

  return { checkedKeys, halfCheckedKeys };
}

/** Applies or removes a cascading check change for a node across its descendants and ancestors. */
export function applyCascadingCheckChange(
  currentCheckedKeys: Set<TreeSelectValue>,
  item: InternalTreeNode,
  nodeMap: Map<TreeSelectValue, InternalTreeNode>,
  shouldCheck: boolean,
): Set<TreeSelectValue> {
  const nextCheckedSet = new Set(currentCheckedKeys);

  if (!shouldCheck) {
    nextCheckedSet.delete(item.key);
    for (const desc of item.descendantKeys) {
      nextCheckedSet.delete(desc);
    }
    let parentKey = item.parentKey;
    while (parentKey !== null) {
      nextCheckedSet.delete(parentKey);
      const parentNode = nodeMap.get(parentKey);
      parentKey = parentNode ? parentNode.parentKey : null;
    }
    return nextCheckedSet;
  }

  nextCheckedSet.add(item.key);
  for (const desc of item.descendantKeys) {
    const descNode = nodeMap.get(desc);
    if (descNode && !descNode.disabled && !descNode.disableCheckbox) {
      nextCheckedSet.add(desc);
    }
  }
  return nextCheckedSet;
}

/** Filters checked keys according to SHOW_ALL, SHOW_PARENT, or SHOW_CHILD strategy. */
export function filterCheckedKeysByStrategy(
  checkedKeys: Set<TreeSelectValue>,
  strategy: ShowCheckedStrategy,
  nodeMap: Map<TreeSelectValue, InternalTreeNode>,
): TreeSelectValue[] {
  if (strategy === "SHOW_ALL") {
    return Array.from(checkedKeys);
  }

  if (strategy === "SHOW_CHILD") {
    return Array.from(checkedKeys).filter((k) => {
      const item = nodeMap.get(k);
      return !item || item.childrenKeys.length === 0;
    });
  }

  const result: TreeSelectValue[] = [];
  for (const key of checkedKeys) {
    const item = nodeMap.get(key);
    if (!item) {
      result.push(key);
      continue;
    }
    let hasCheckedAncestor = false;
    let currParent = item.parentKey;
    while (currParent !== null) {
      if (checkedKeys.has(currParent)) {
        hasCheckedAncestor = true;
        break;
      }
      const parentNode = nodeMap.get(currParent);
      currParent = parentNode ? parentNode.parentKey : null;
    }
    if (!hasCheckedAncestor) {
      result.push(key);
    }
  }
  return result;
}

/** Collects matched node keys and ancestor keys to auto-expand for a tree search query. */
export function collectMatchedTreeKeys(
  nodeMap: Map<TreeSelectValue, InternalTreeNode>,
  keyword: string,
  filterTreeNode?: (searchValue: string, node: TreeSelectNode) => boolean,
): {
  matchedKeys: Set<TreeSelectValue>;
  hasSearchFilter: boolean;
  searchExpandedKeys: Set<TreeSelectValue>;
} {
  const trimmed = keyword.trim().toLowerCase();
  if (!trimmed) {
    return {
      matchedKeys: new Set<TreeSelectValue>(),
      hasSearchFilter: false,
      searchExpandedKeys: new Set<TreeSelectValue>(),
    };
  }

  const matched = new Set<TreeSelectValue>();
  const autoExpand = new Set<TreeSelectValue>();

  for (const [key, node] of nodeMap) {
    const isMatch = filterTreeNode ? filterTreeNode(trimmed, node.raw) : node.label.toLowerCase().includes(trimmed);
    if (isMatch) {
      matched.add(key);
      for (const pKey of node.path.slice(0, -1)) {
        autoExpand.add(pKey);
      }
    }
  }

  return {
    matchedKeys: matched,
    hasSearchFilter: true,
    searchExpandedKeys: autoExpand,
  };
}
