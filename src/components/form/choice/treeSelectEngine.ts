import type { ReactNode } from "react";

export {
  applyCascadingCheckChange,
  collectMatchedTreeKeys,
  filterCheckedKeysByStrategy,
  resolveCascadingCheckedState,
} from "./treeCascade";

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

/** Normalizes custom `fieldNames` for TreeSelect nodes with default keys. */
export function defaultFieldNames(fieldNames?: TreeSelectFieldNames): Required<TreeSelectFieldNames> {
  return {
    label: fieldNames?.label ?? "label",
    value: fieldNames?.value ?? "value",
    children: fieldNames?.children ?? "children",
  };
}

/** Extracts plain-text search label and renderable node label for a tree item. */
export function getNodeLabel(node: TreeSelectNode, labelKey: string): { labelText: string; labelNode: ReactNode } {
  const raw = node[labelKey] ?? node.label ?? node.title ?? String(node.value ?? "");
  if (typeof raw === "string" || typeof raw === "number") {
    return { labelText: String(raw), labelNode: raw };
  }
  return { labelText: String(node.value ?? ""), labelNode: raw as ReactNode };
}

/** Builds an O(1) lookup map and root key list from hierarchical tree nodes. */
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

      const childKeys = hasChildren
        ? traverse(childrenRaw as TreeSelectNode[], key, level + 1, currentPath, currentLabels, currentNodes)
        : [];

      nodeMap.set(key, {
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
      });
    }

    return directKeys;
  }

  rootKeys.push(...traverse(nodes, null, 0, [], [], []));

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
