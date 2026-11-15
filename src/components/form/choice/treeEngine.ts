import type { ReactNode } from "react";

// ==========================================
// TreeSelect Types & Pure Engine
// ==========================================

export type TreeSelectValue = string | number;

export interface TreeSelectNode {
  value: TreeSelectValue;
  label?: ReactNode;
  title?: ReactNode;
  children?: TreeSelectNode[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  icon?: ReactNode | ((node: TreeSelectNode, expanded: boolean) => ReactNode);
  selectable?: boolean;
  [key: string]: unknown;
}

export interface TreeSelectFieldNames {
  label?: string;
  value?: string;
  children?: string;
}

export type ShowCheckedStrategy = "SHOW_ALL" | "SHOW_PARENT" | "SHOW_CHILD";

export interface InternalTreeNode {
  key: TreeSelectValue;
  raw: TreeSelectNode;
  label: string;
  labelNode: ReactNode;
  parentKey: TreeSelectValue | null;
  level: number;
  isLeaf: boolean;
  disabled: boolean;
  disableCheckbox: boolean;
  selectable: boolean;
  childrenKeys: TreeSelectValue[];
  descendantKeys: TreeSelectValue[];
  leafKeys: TreeSelectValue[];
  path: TreeSelectValue[];
  pathLabels: string[];
  pathNodes: TreeSelectNode[];
  icon?: ReactNode | ((node: TreeSelectNode, expanded: boolean) => ReactNode);
}

/**
 * Normalizes custom `fieldNames` for TreeSelect nodes with default keys.
 */
export function defaultFieldNames(fieldNames?: TreeSelectFieldNames): Required<TreeSelectFieldNames> {
  return {
    label: fieldNames?.label ?? "label",
    value: fieldNames?.value ?? "value",
    children: fieldNames?.children ?? "children",
  };
}

/**
 * Extracts plain-text search label and renderable node label for a tree item.
 */
export function getNodeLabel(node: TreeSelectNode, labelKey: string): { labelText: string; labelNode: ReactNode } {
  const raw = node[labelKey] ?? node.label ?? node.title ?? String(node.value ?? "");
  if (typeof raw === "string" || typeof raw === "number") {
    return { labelText: String(raw), labelNode: raw };
  }
  return { labelText: String(node.value ?? ""), labelNode: raw as ReactNode };
}

/**
 * Builds an O(1) lookup map and root key list from hierarchical tree nodes.
 */
export function buildTreeIndex(
  nodes: TreeSelectNode[] | undefined,
  fieldKeys: Required<TreeSelectFieldNames>,
): {
  nodeMap: Map<TreeSelectValue, InternalTreeNode>;
  rootKeys: TreeSelectValue[];
} {
  const nodeMap = new Map<TreeSelectValue, InternalTreeNode>();
  const rootKeys: TreeSelectValue[] = [];

  if (!nodes || nodes.length === 0) {
    return { nodeMap, rootKeys };
  }

  function traverse(
    list: TreeSelectNode[],
    parentKey: TreeSelectValue | null,
    level: number,
    ancestorPath: TreeSelectValue[],
    ancestorLabels: string[],
    ancestorNodes: TreeSelectNode[],
  ): TreeSelectValue[] {
    const directKeys: TreeSelectValue[] = [];

    for (const node of list) {
      const key = (node[fieldKeys.value] ?? node.value) as TreeSelectValue;
      if (key === undefined || key === null) continue;

      directKeys.push(key);
      const { labelText, labelNode } = getNodeLabel(node, fieldKeys.label);
      const childrenRaw = node[fieldKeys.children] ?? node.children;
      const hasChildren = Array.isArray(childrenRaw) && childrenRaw.length > 0;
      const isLeaf = node.isLeaf !== undefined ? Boolean(node.isLeaf) : !hasChildren;

      const currentPath = [...ancestorPath, key];
      const currentLabels = [...ancestorLabels, labelText];
      const currentNodes = [...ancestorNodes, node];

      let childKeys: TreeSelectValue[] = [];
      if (hasChildren) {
        childKeys = traverse(childrenRaw as TreeSelectNode[], key, level + 1, currentPath, currentLabels, currentNodes);
      }

      const internalNode: InternalTreeNode = {
        key,
        raw: node,
        label: labelText,
        labelNode,
        parentKey,
        level,
        isLeaf,
        disabled: Boolean(node.disabled),
        disableCheckbox: Boolean(node.disableCheckbox),
        selectable: node.selectable !== false,
        childrenKeys: childKeys,
        descendantKeys: [],
        leafKeys: [],
        path: currentPath,
        pathLabels: currentLabels,
        pathNodes: currentNodes,
        icon: node.icon,
      };

      nodeMap.set(key, internalNode);
    }

    return directKeys;
  }

  const directRoots = traverse(nodes, null, 0, [], [], []);
  rootKeys.push(...directRoots);

  for (const [key, item] of nodeMap) {
    const descendants: TreeSelectValue[] = [];
    const leaves: TreeSelectValue[] = [];

    function gather(currentKey: TreeSelectValue) {
      const curr = nodeMap.get(currentKey);
      if (!curr) return;
      for (const childKey of curr.childrenKeys) {
        descendants.push(childKey);
        const childNode = nodeMap.get(childKey);
        if (childNode) {
          if (childNode.childrenKeys.length === 0) {
            leaves.push(childKey);
          } else {
            gather(childKey);
          }
        }
      }
    }

    gather(key);
    item.descendantKeys = descendants;
    item.leafKeys = leaves.length > 0 ? leaves : [key];
  }

  return { nodeMap, rootKeys };
}

/**
 * Resolves full checked and indeterminate (half-checked) key sets using bottom-up aggregation.
 */
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

/**
 * Applies or removes a cascading check change for a node across its descendants and ancestors.
 */
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

/**
 * Filters checked keys according to SHOW_ALL, SHOW_PARENT, or SHOW_CHILD strategy.
 */
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

/**
 * Collects matched node keys and ancestor keys to auto-expand for a tree search query.
 */
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

// ==========================================
// Cascader Types & Pure Engine
// ==========================================

export interface CascaderFieldNames {
  label?: string;
  value?: string;
  children?: string;
}

export interface CascaderOption {
  value?: string | number;
  label?: ReactNode;
  children?: CascaderOption[];
  disabled?: boolean;
  isLeaf?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  title?: string;
  [key: string]: unknown;
}

export interface CascaderSearchResultItem {
  path: CascaderOption[];
  labels: string[];
  values: (string | number)[];
  disabled: boolean;
}

export const DEFAULT_CASCADER_FIELD_NAMES: Required<CascaderFieldNames> = {
  label: "label",
  value: "value",
  children: "children",
};

/**
 * Reads a cascader option value respecting custom fieldNames.
 */
export function getCascaderOptionValue(
  option: CascaderOption,
  fieldNames: Required<CascaderFieldNames> = DEFAULT_CASCADER_FIELD_NAMES,
): string | number {
  return (option[fieldNames.value] ?? option.value ?? "") as string | number;
}

/**
 * Reads a cascader option string label respecting custom fieldNames.
 */
export function getCascaderOptionLabel(
  option: CascaderOption,
  fieldNames: Required<CascaderFieldNames> = DEFAULT_CASCADER_FIELD_NAMES,
): string {
  const raw = option[fieldNames.label] ?? option.label ?? "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  return "";
}

/**
 * Reads cascader child options respecting custom fieldNames.
 */
export function getCascaderOptionChildren(
  option: CascaderOption,
  fieldNames: Required<CascaderFieldNames> = DEFAULT_CASCADER_FIELD_NAMES,
): CascaderOption[] | undefined {
  return (option[fieldNames.children] ?? option.children) as CascaderOption[] | undefined;
}

/**
 * Resolves an array of option objects matching a sequence of path values.
 */
export function resolveCascaderOptionsByValue(
  options: CascaderOption[],
  pathValues?: (string | number)[],
  fieldNames: Required<CascaderFieldNames> = DEFAULT_CASCADER_FIELD_NAMES,
): CascaderOption[] {
  if (!pathValues || pathValues.length === 0) return [];
  const result: CascaderOption[] = [];
  let currentLevelOptions: CascaderOption[] | undefined = options;

  for (const val of pathValues) {
    if (!currentLevelOptions) break;
    const match: CascaderOption | undefined = currentLevelOptions.find(
      (opt) => String(getCascaderOptionValue(opt, fieldNames)) === String(val),
    );
    if (!match) break;
    result.push(match);
    currentLevelOptions = getCascaderOptionChildren(match, fieldNames);
  }

  return result;
}

/**
 * Traverses cascader options recursively to collect all paths matching a search query.
 */
export function collectCascaderSearchPaths(
  options: CascaderOption[],
  currentPath: CascaderOption[] = [],
  query: string,
  changeOnSelect: boolean,
  fieldNames: Required<CascaderFieldNames> = DEFAULT_CASCADER_FIELD_NAMES,
): CascaderSearchResultItem[] {
  const results: CascaderSearchResultItem[] = [];
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return results;

  for (const option of options) {
    const nextPath = [...currentPath, option];
    const children = getCascaderOptionChildren(option, fieldNames);
    const isLeaf = Boolean(
      option.isLeaf === true ||
      (!children && option.isLeaf !== false) ||
      (children && children.length === 0 && option.isLeaf !== false),
    );

    const pathLabels = nextPath.map((o) => getCascaderOptionLabel(o, fieldNames));
    const fullText = pathLabels.join(" / ").toLowerCase();

    if (fullText.includes(lowerQuery) && (changeOnSelect || isLeaf)) {
      results.push({
        path: nextPath,
        labels: pathLabels,
        values: nextPath.map((o) => getCascaderOptionValue(o, fieldNames)),
        disabled: nextPath.some((o) => Boolean(o.disabled)),
      });
    }

    if (children && children.length > 0) {
      results.push(...collectCascaderSearchPaths(children, nextPath, query, changeOnSelect, fieldNames));
    }
  }

  return results;
}

// ==========================================
// Shared Highlight Slicer (Safe indexOf)
// ==========================================

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/**
 * Splits text into plain/highlighted segments via literal indexOf (immune to regex meta/ReDoS).
 */
export function splitHighlightSegments(text: string, query: string): HighlightSegment[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [{ text, highlighted: false }];
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const segments: HighlightSegment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const idx = lowerText.indexOf(lowerQuery, cursor);
    if (idx === -1) {
      segments.push({ text: text.slice(cursor), highlighted: false });
      break;
    }
    if (idx > cursor) {
      segments.push({ text: text.slice(cursor, idx), highlighted: false });
    }
    segments.push({
      text: text.slice(idx, idx + trimmed.length),
      highlighted: true,
    });
    cursor = idx + trimmed.length;
  }

  return segments;
}
