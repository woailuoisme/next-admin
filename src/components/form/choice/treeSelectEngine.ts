import type { ReactNode } from "react";

export type {
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
  const titleFallback =
    typeof node.title === "string" || typeof node.title === "number" ? String(node.title) : String(node.value ?? "");
  return { labelText: titleFallback, labelNode: raw as ReactNode };
}

/** Builds an O(N) single-pass lookup map and root key list from hierarchical tree nodes. */
export function buildTreeIndex(
  nodes: TreeSelectNode[] | undefined,
  fieldKeys: Required<TreeSelectFieldNames>,
): {
  nodeMap: Map<TreeSelectValue, InternalTreeNode>;
  rootKeys: TreeSelectValue[];
} {
  const nodeMap = new Map<TreeSelectValue, InternalTreeNode>();
  if (!nodes || nodes.length === 0) {
    return { nodeMap, rootKeys: [] };
  }

  function traverse(
    list: TreeSelectNode[],
    parentKey: TreeSelectValue | null,
    level: number,
    ancestorPath: TreeSelectValue[],
    ancestorLabels: string[],
    ancestorNodes: TreeSelectNode[],
  ): {
    directKeys: TreeSelectValue[];
    descendants: TreeSelectValue[];
    leaves: TreeSelectValue[];
  } {
    const directKeys: TreeSelectValue[] = [];
    const descendants: TreeSelectValue[] = [];
    const leaves: TreeSelectValue[] = [];

    for (const node of list) {
      const key = (node[fieldKeys.value] ?? node.value) as TreeSelectValue;
      if (key === undefined || key === null || (typeof key === "number" && Number.isNaN(key))) continue;
      if (nodeMap.has(key)) continue;

      const { labelText, labelNode } = getNodeLabel(node, fieldKeys.label);
      const childrenRaw = node[fieldKeys.children] ?? node.children;
      const hasChildren = Array.isArray(childrenRaw) && childrenRaw.length > 0;
      const isLeaf = node.isLeaf !== undefined ? Boolean(node.isLeaf) : !hasChildren;

      const currentPath = [...ancestorPath, key];
      const currentLabels = [...ancestorLabels, labelText];
      const currentNodes = [...ancestorNodes, node];

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
        childrenKeys: [],
        descendantKeys: [],
        leafKeys: [key],
        path: currentPath,
        pathLabels: currentLabels,
        pathNodes: currentNodes,
        icon: node.icon,
      };
      // Register key before recursing to guard against duplicate descendant keys.
      nodeMap.set(key, internalNode);
      directKeys.push(key);
      descendants.push(key);

      if (hasChildren) {
        const sub = traverse(childrenRaw as TreeSelectNode[], key, level + 1, currentPath, currentLabels, currentNodes);
        internalNode.childrenKeys = sub.directKeys;
        internalNode.descendantKeys = sub.descendants;
        internalNode.leafKeys = sub.leaves.length > 0 ? sub.leaves : [key];
        descendants.push(...sub.descendants);
        leaves.push(...(sub.leaves.length > 0 ? sub.leaves : [key]));
      } else {
        leaves.push(key);
      }
    }

    return { directKeys, descendants, leaves };
  }

  const rootResult = traverse(nodes, null, 0, [], [], []);
  return { nodeMap, rootKeys: rootResult.directKeys };
}
