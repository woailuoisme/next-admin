"use client";

import {
  memo,
  type ReactNode,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronRight, Check, Folder, FolderOpen, FileText, Loader2, Search, X } from "lucide-react";

// ==========================================
// Types
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

export interface TreeSelectProps {
  treeData?: TreeSelectNode[];
  value?: TreeSelectValue | TreeSelectValue[];
  defaultValue?: TreeSelectValue | TreeSelectValue[];
  onChange?: (
    value: any,
    selectedNodes: TreeSelectNode[] | TreeSelectNode | undefined,
    extra?: {
      triggerValue?: TreeSelectValue;
      checked?: boolean;
      allCheckedKeys?: TreeSelectValue[];
    },
  ) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  treeCheckable?: boolean;
  showCheckedStrategy?: ShowCheckedStrategy;
  onlyLeafSelectable?: boolean;
  treeLine?: boolean;
  showIcon?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  treeDefaultExpandAll?: boolean;
  treeExpandedKeys?: TreeSelectValue[];
  onTreeExpand?: (keys: TreeSelectValue[]) => void;
  loadData?: (node: TreeSelectNode) => Promise<void> | void;
  fieldNames?: TreeSelectFieldNames;
  maxTagCount?: number;
  maxTagPlaceholder?: (omittedValues: TreeSelectValue[]) => ReactNode;
  size?: "sm" | "default" | "lg";
  className?: string;
  popupClassName?: string;
  id?: string;
  filterTreeNode?: (searchValue: string, node: TreeSelectNode) => boolean;
}

// Flat internal indexed representation
interface InternalTreeNode {
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

// ==========================================
// Helpers
// ==========================================

function defaultFieldNames(fieldNames?: TreeSelectFieldNames): Required<TreeSelectFieldNames> {
  return {
    label: fieldNames?.label ?? "label",
    value: fieldNames?.value ?? "value",
    children: fieldNames?.children ?? "children",
  };
}

function getNodeLabel(node: TreeSelectNode, labelKey: string): { labelText: string; labelNode: ReactNode } {
  const raw = node[labelKey] ?? node.label ?? node.title ?? String(node.value ?? "");
  if (typeof raw === "string" || typeof raw === "number") {
    return { labelText: String(raw), labelNode: raw };
  }
  return { labelText: String(node.value ?? ""), labelNode: raw as ReactNode };
}

function buildTreeIndex(
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

  // Compute descendants and leaf keys bottom-up
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

// Parent-child cascading resolution
function resolveCascadingCheckedState(
  selectedKeys: Set<TreeSelectValue>,
  nodeMap: Map<TreeSelectValue, InternalTreeNode>,
): {
  checkedKeys: Set<TreeSelectValue>;
  halfCheckedKeys: Set<TreeSelectValue>;
} {
  const checkedKeys = new Set<TreeSelectValue>(selectedKeys);
  const halfCheckedKeys = new Set<TreeSelectValue>();

  // If a parent was selected, expand downward
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

  // Calculate upward states
  // Sort keys by depth descending
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

function filterCheckedKeysByStrategy(
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

  // SHOW_PARENT: if parent is fully checked, omit child keys
  const result: TreeSelectValue[] = [];
  for (const key of checkedKeys) {
    const item = nodeMap.get(key);
    if (!item) {
      result.push(key);
      continue;
    }
    // If an ancestor is also checked, skip this node
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

// Highlight matched search text
function HighlightMatch({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword.trim()) return <>{text}</>;
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const index = lowerText.indexOf(lowerKeyword);

  if (index === -1) return <>{text}</>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + keyword.length);
  const after = text.slice(index + keyword.length);

  return (
    <>
      {before}
      <mark className="bg-primary/20 text-primary rounded-xs px-0.5 font-medium">{match}</mark>
      <HighlightMatch text={after} keyword={keyword} />
    </>
  );
}

const EMPTY_TREE_DATA: TreeSelectNode[] = [];
const EMPTY_ARRAY: [] = [];

const SIZE_CLASSES = {
  sm: "min-h-8 px-2.5 py-1 text-xs",
  default: "min-h-9 px-3 py-1.5 text-sm",
  lg: "min-h-10 px-3.5 py-2 text-base",
} as const;

// ==========================================
// Component: TreeSelect
// ==========================================

function TreeSelectComponent({
  treeData = EMPTY_TREE_DATA,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder = "请选择...",
  disabled = false,
  allowClear = true,
  clearable = true,
  multiple = false,
  treeCheckable = false,
  showCheckedStrategy = "SHOW_PARENT",
  onlyLeafSelectable = false,
  treeLine = false,
  showIcon = false,
  showSearch = true,
  searchPlaceholder = "搜索节点名称...",
  emptyText = "暂无匹配节点",
  treeDefaultExpandAll = false,
  treeExpandedKeys: controlledExpandedKeys,
  onTreeExpand,
  loadData,
  fieldNames,
  maxTagCount = 3,
  maxTagPlaceholder,
  size = "default",
  className,
  popupClassName,
  id,
  filterTreeNode,
}: TreeSelectProps) {
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const autoId = useId();
  const triggerId = id || `treeselect-${autoId}`;

  const isMultiple = multiple || treeCheckable;
  const isControlled = controlledValue !== undefined;
  const isExpandControlled = controlledExpandedKeys !== undefined;

  // Normalize initial uncontrolled value with lazy initializer
  const [uncontrolledValue, setUncontrolledValue] = useState<TreeSelectValue | TreeSelectValue[] | undefined>(() =>
    defaultValue !== undefined ? defaultValue : isMultiple ? EMPTY_ARRAY : undefined,
  );
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  // Dropdown open state
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);

  // Loading keys for async loadData
  const [loadingKeys, setLoadingKeys] = useState<Set<TreeSelectValue>>(new Set());

  // Field names mapping & indexing
  const fieldKeys = useMemo(() => defaultFieldNames(fieldNames), [fieldNames]);
  const { nodeMap, rootKeys } = useMemo(() => buildTreeIndex(treeData, fieldKeys), [treeData, fieldKeys]);

  // Expanded keys management (null means all expanded by default via treeDefaultExpandAll)
  const [uncontrolledExpandedKeys, setUncontrolledExpandedKeys] = useState<Set<TreeSelectValue> | null>(() => {
    if (treeDefaultExpandAll) {
      return null;
    }
    return new Set<TreeSelectValue>();
  });

  const activeExpandedKeys = useMemo(() => {
    if (isExpandControlled && controlledExpandedKeys) {
      return new Set(controlledExpandedKeys);
    }
    if (uncontrolledExpandedKeys === null) {
      return new Set(Array.from(nodeMap.keys()));
    }
    return uncontrolledExpandedKeys;
  }, [isExpandControlled, controlledExpandedKeys, uncontrolledExpandedKeys, nodeMap]);

  const setExpandedKeysState = useCallback(
    (updater: (prev: Set<TreeSelectValue>) => Set<TreeSelectValue>) => {
      if (!isExpandControlled) {
        setUncontrolledExpandedKeys((prev) => {
          const base = prev === null ? new Set(Array.from(nodeMap.keys())) : prev;
          return updater(base);
        });
      }
      if (onTreeExpand) {
        const next = updater(activeExpandedKeys);
        onTreeExpand(Array.from(next));
      }
    },
    [isExpandControlled, onTreeExpand, activeExpandedKeys, nodeMap],
  );

  // Single vs Multiple selection state representation
  const selectedKeysSet = useMemo(() => {
    const set = new Set<TreeSelectValue>();
    if (activeValue === undefined || activeValue === null) return set;
    if (Array.isArray(activeValue)) {
      for (const k of activeValue) {
        if (k !== undefined && k !== null) set.add(k);
      }
    } else {
      set.add(activeValue);
    }
    return set;
  }, [activeValue]);

  // Checkable cascade calculations
  const { checkedKeys: allCascadedChecked, halfCheckedKeys } = useMemo(() => {
    if (!treeCheckable) {
      return {
        checkedKeys: selectedKeysSet,
        halfCheckedKeys: new Set<TreeSelectValue>(),
      };
    }
    return resolveCascadingCheckedState(selectedKeysSet, nodeMap);
  }, [treeCheckable, selectedKeysSet, nodeMap]);

  // Trigger search filter calculation
  const { matchedKeys, hasSearchFilter, searchExpandedKeys } = useMemo(() => {
    const trimmed = deferredSearch.trim().toLowerCase();
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
      const isCustomMatch = filterTreeNode
        ? filterTreeNode(trimmed, node.raw)
        : node.label.toLowerCase().includes(trimmed);

      if (isCustomMatch) {
        matched.add(key);
        // Expand ancestors
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
  }, [deferredSearch, nodeMap, filterTreeNode]);

  // Effective expanded keys taking search auto-expansion into account
  const effectiveExpandedKeys = useMemo(() => {
    if (hasSearchFilter) {
      const merged = new Set(activeExpandedKeys);
      for (const k of searchExpandedKeys) {
        merged.add(k);
      }
      return merged;
    }
    return activeExpandedKeys;
  }, [hasSearchFilter, searchExpandedKeys, activeExpandedKeys]);

  // Expand / collapse toggle
  const handleToggleExpand = useCallback(
    async (node: InternalTreeNode, e?: React.MouseEvent) => {
      e?.stopPropagation();
      const key = node.key;
      const isExpanded = effectiveExpandedKeys.has(key);

      // Async loading
      if (!isExpanded && !node.isLeaf && node.childrenKeys.length === 0 && loadData) {
        setLoadingKeys((prev) => new Set(prev).add(key));
        try {
          await loadData(node.raw);
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
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    },
    [effectiveExpandedKeys, loadData, setExpandedKeysState],
  );

  // Node selection handler
  const handleSelectNode = useCallback(
    (item: InternalTreeNode) => {
      if (item.disabled || !item.selectable) return;
      if (onlyLeafSelectable && !item.isLeaf) {
        handleToggleExpand(item);
        return;
      }

      if (!isMultiple) {
        // Single select mode
        const nextVal = item.key;
        if (!isControlled) {
          setUncontrolledValue(nextVal);
        }
        onChange?.(nextVal, item.raw, { triggerValue: nextVal, checked: true });
        setOpen(false);
        return;
      }

      if (!treeCheckable) {
        // Standard multi-select (independent tags)
        const currentArr = Array.isArray(activeValue) ? [...activeValue] : [];
        const exists = currentArr.includes(item.key);
        const nextArr = exists ? currentArr.filter((k) => k !== item.key) : [...currentArr, item.key];

        if (!isControlled) {
          setUncontrolledValue(nextArr);
        }
        const selectedNodes = nextArr.map((k) => nodeMap.get(k)?.raw).filter(Boolean) as TreeSelectNode[];
        onChange?.(nextArr, selectedNodes, {
          triggerValue: item.key,
          checked: !exists,
        });
        return;
      }

      // Checkbox tree cascade mode
      const isCurrentlyChecked = allCascadedChecked.has(item.key);
      const nextCheckedSet = new Set(allCascadedChecked);

      if (isCurrentlyChecked) {
        // Uncheck item and all descendants
        nextCheckedSet.delete(item.key);
        for (const desc of item.descendantKeys) {
          nextCheckedSet.delete(desc);
        }
        // Also uncheck ancestors
        let p = item.parentKey;
        while (p !== null) {
          nextCheckedSet.delete(p);
          const pNode = nodeMap.get(p);
          p = pNode ? pNode.parentKey : null;
        }
      } else {
        // Check item and all non-disabled descendants
        nextCheckedSet.add(item.key);
        for (const desc of item.descendantKeys) {
          const descNode = nodeMap.get(desc);
          if (descNode && !descNode.disabled && !descNode.disableCheckbox) {
            nextCheckedSet.add(desc);
          }
        }
      }

      const formattedKeys = filterCheckedKeysByStrategy(nextCheckedSet, showCheckedStrategy, nodeMap);

      if (!isControlled) {
        setUncontrolledValue(formattedKeys);
      }
      const selectedNodes = formattedKeys.map((k) => nodeMap.get(k)?.raw).filter(Boolean) as TreeSelectNode[];
      onChange?.(formattedKeys, selectedNodes, {
        triggerValue: item.key,
        checked: !isCurrentlyChecked,
        allCheckedKeys: Array.from(nextCheckedSet),
      });
    },
    [
      onlyLeafSelectable,
      handleToggleExpand,
      isMultiple,
      treeCheckable,
      isControlled,
      onChange,
      activeValue,
      nodeMap,
      allCascadedChecked,
      showCheckedStrategy,
    ],
  );

  // Clear all selection
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      const nextVal = isMultiple ? [] : undefined;
      if (!isControlled) {
        setUncontrolledValue(nextVal);
      }
      onChange?.(nextVal, isMultiple ? [] : undefined);
    },
    [disabled, isMultiple, isControlled, onChange],
  );

  // Remove single tag in multiple mode
  const handleRemoveTag = useCallback(
    (tagKey: TreeSelectValue, e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;

      if (!treeCheckable) {
        const currentArr = Array.isArray(activeValue) ? activeValue.filter((k) => k !== tagKey) : [];
        if (!isControlled) {
          setUncontrolledValue(currentArr);
        }
        const selectedNodes = currentArr.map((k) => nodeMap.get(k)?.raw).filter(Boolean) as TreeSelectNode[];
        onChange?.(currentArr, selectedNodes, { triggerValue: tagKey, checked: false });
        return;
      }

      // Checkbox cascade mode removal
      const item = nodeMap.get(tagKey);
      if (!item) return;

      const nextCheckedSet = new Set(allCascadedChecked);
      nextCheckedSet.delete(tagKey);
      for (const desc of item.descendantKeys) {
        nextCheckedSet.delete(desc);
      }
      let p = item.parentKey;
      while (p !== null) {
        nextCheckedSet.delete(p);
        const pNode = nodeMap.get(p);
        p = pNode ? pNode.parentKey : null;
      }

      const formattedKeys = filterCheckedKeysByStrategy(nextCheckedSet, showCheckedStrategy, nodeMap);
      if (!isControlled) {
        setUncontrolledValue(formattedKeys);
      }
      const selectedNodes = formattedKeys.map((k) => nodeMap.get(k)?.raw).filter(Boolean) as TreeSelectNode[];
      onChange?.(formattedKeys, selectedNodes, { triggerValue: tagKey, checked: false });
    },
    [disabled, treeCheckable, activeValue, isControlled, nodeMap, onChange, allCascadedChecked, showCheckedStrategy],
  );

  // Render tree item recursively
  const renderTreeNode = (key: TreeSelectValue): ReactNode => {
    const item = nodeMap.get(key);
    if (!item) return null;

    // Search filter visibility check
    if (hasSearchFilter) {
      const isMatched = matchedKeys.has(key);
      const hasMatchedDescendant = item.descendantKeys.some((dk) => matchedKeys.has(dk));
      if (!isMatched && !hasMatchedDescendant) {
        return null;
      }
    }

    const isExpanded = effectiveExpandedKeys.has(key);
    const isLoading = loadingKeys.has(key);
    const hasChildren = item.childrenKeys.length > 0 || (loadData && !item.isLeaf);

    const isChecked = allCascadedChecked.has(key);
    const isHalfChecked = halfCheckedKeys.has(key);
    const isSingleSelected = !isMultiple && selectedKeysSet.has(key);

    // Icon resolution
    let iconElement: ReactNode = null;
    if (showIcon) {
      if (typeof item.icon === "function") {
        iconElement = item.icon(item.raw, isExpanded);
      } else if (item.icon) {
        iconElement = item.icon;
      } else if (hasChildren) {
        iconElement = isExpanded ? (
          <FolderOpen className="text-muted-foreground size-4 shrink-0" />
        ) : (
          <Folder className="text-muted-foreground size-4 shrink-0" />
        );
      } else {
        iconElement = <FileText className="text-muted-foreground/80 size-4 shrink-0" />;
      }
    }

    return (
      <div key={String(key)} className="relative flex flex-col">
        {/* Tree Line vertical guide for children */}
        {treeLine && item.level > 0 && (
          <div
            className="border-border/60 pointer-events-none absolute top-0 bottom-0 border-l border-dashed"
            style={{ left: `${(item.level - 1) * 20 + 10}px` }}
          />
        )}

        <div
          onClick={() => handleSelectNode(item)}
          className={cn(
            "group relative flex min-h-8 items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors select-none",
            item.disabled ? "text-muted-foreground/50 cursor-not-allowed" : "hover:bg-accent/60 cursor-pointer",
            isSingleSelected && "bg-primary/10 text-primary font-medium hover:bg-primary/15",
          )}
          style={{ paddingLeft: `${item.level * 20 + 8}px` }}
        >
          {/* Tree Line horizontal branch connector */}
          {treeLine && item.level > 0 && (
            <div
              className="border-border/60 pointer-events-none absolute h-px border-b border-dashed"
              style={{
                left: `${(item.level - 1) * 20 + 10}px`,
                width: "12px",
                top: "50%",
              }}
            />
          )}

          {/* Expand / Collapse Chevron */}
          <span
            role="button"
            tabIndex={hasChildren && !item.disabled ? 0 : -1}
            aria-label={isExpanded ? "收起节点" : "展开节点"}
            aria-expanded={hasChildren ? isExpanded : undefined}
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren && !isLoading) {
                handleToggleExpand(item, e);
              }
            }}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " " || e.key === "ArrowRight") && hasChildren && !isLoading) {
                e.preventDefault();
                e.stopPropagation();
                handleToggleExpand(item);
              }
            }}
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-sm transition-colors",
              hasChildren && !item.disabled ? "hover:bg-accent cursor-pointer" : "cursor-default opacity-0",
            )}
          >
            {isLoading ? (
              <Loader2 className="text-primary size-3.5 animate-spin" />
            ) : isExpanded ? (
              <ChevronDown className="text-muted-foreground size-3.5" />
            ) : (
              <ChevronRight className="text-muted-foreground size-3.5" />
            )}
          </span>

          {/* Checkbox (if treeCheckable) */}
          {treeCheckable && (
            <div onClick={(e) => e.stopPropagation()} className="flex items-center">
              <Checkbox
                checked={isChecked ? true : isHalfChecked ? "indeterminate" : false}
                disabled={item.disabled || item.disableCheckbox}
                onCheckedChange={() => handleSelectNode(item)}
                className="size-4 rounded-xs"
              />
            </div>
          )}

          {/* Optional Icon */}
          {iconElement}

          {/* Label Content */}
          <span className="flex-1 truncate">
            {hasSearchFilter ? <HighlightMatch text={item.label} keyword={deferredSearch.trim()} /> : item.labelNode}
          </span>

          {/* Single Select Checkmark */}
          {isSingleSelected && <Check className="text-primary size-3.5 shrink-0" />}
        </div>

        {/* Child Nodes */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col">{item.childrenKeys.map((childKey) => renderTreeNode(childKey))}</div>
        )}
      </div>
    );
  };

  // Render Trigger content: Single vs Multi tags
  const renderTriggerContent = () => {
    const hasValue = isMultiple
      ? Array.isArray(activeValue) && activeValue.length > 0
      : activeValue !== undefined && activeValue !== null && activeValue !== "";

    if (!hasValue) {
      return <span className="text-muted-foreground truncate">{placeholder}</span>;
    }

    if (!isMultiple) {
      const selectedItem = nodeMap.get(activeValue as TreeSelectValue);
      return (
        <span className="text-foreground flex-1 truncate font-normal">
          {selectedItem?.label ?? String(activeValue)}
        </span>
      );
    }

    // Multiple tags display
    const rawValues = Array.isArray(activeValue) ? activeValue : [];
    const visibleTags = typeof maxTagCount === "number" ? rawValues.slice(0, maxTagCount) : rawValues;
    const omittedCount = rawValues.length - visibleTags.length;

    return (
      <div className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden py-0.5">
        {visibleTags.map((key) => {
          const item = nodeMap.get(key);
          const label = item?.label ?? String(key);
          return (
            <Badge
              key={String(key)}
              variant="secondary"
              className="bg-muted text-foreground hover:bg-muted/80 inline-flex max-w-[160px] items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-normal"
            >
              <span className="truncate">{label}</span>
              {!disabled && (
                <X
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleRemoveTag(key, e)}
                  className="text-muted-foreground hover:text-foreground size-3 shrink-0 cursor-pointer"
                />
              )}
            </Badge>
          );
        })}

        {omittedCount > 0 && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Badge
                    variant="outline"
                    className="border-border bg-background text-muted-foreground hover:bg-accent inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-normal"
                  >
                    +{omittedCount}...
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                {maxTagPlaceholder ? (
                  maxTagPlaceholder(rawValues.slice(maxTagCount))
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {rawValues.slice(maxTagCount).map((k) => (
                      <span key={String(k)} className="bg-muted/60 rounded-xs px-1 py-0.5">
                        {nodeMap.get(k)?.label ?? String(k)}
                      </span>
                    ))}
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  const hasSelection = isMultiple
    ? Array.isArray(activeValue) && activeValue.length > 0
    : activeValue !== undefined && activeValue !== null && activeValue !== "";

  const canClear = Boolean((allowClear || clearable) && !disabled && hasSelection);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={triggerId}
          type="button"
          disabled={disabled}
          className={cn(
            "border-input bg-background text-foreground ring-offset-background flex w-full items-center justify-between gap-2 rounded-md border text-left shadow-xs transition-colors",
            "focus-visible:ring-ring focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-1",
            disabled && "cursor-not-allowed opacity-50",
            SIZE_CLASSES[size],
            className,
          )}
        >
          {renderTriggerContent()}

          <div className="flex shrink-0 items-center gap-1.5">
            {canClear && (
              <span
                onClick={handleClear}
                className="hover:bg-muted text-muted-foreground hover:text-foreground flex size-4 items-center justify-center rounded-full transition-colors"
                title="清空"
              >
                <X className="size-3" />
              </span>
            )}
            <ChevronDown
              className={cn(
                "text-muted-foreground size-4 shrink-0 transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn(
          "border-border bg-popover text-popover-foreground w-(--radix-popover-trigger-width) min-w-[260px] p-0 shadow-md",
          popupClassName,
        )}
      >
        {/* Search Header */}
        {showSearch && (
          <div className="border-border/60 flex items-center gap-2 border-b px-2.5 py-2">
            <Search className="text-muted-foreground size-4 shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className="placeholder:text-muted-foreground text-foreground flex-1 bg-transparent text-xs outline-hidden"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="hover:bg-muted text-muted-foreground flex size-4 items-center justify-center rounded-xs"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        )}

        {/* Tree Container */}
        <div className="max-h-72 scrollbar-thin overflow-y-auto p-1.5">
          {rootKeys.length === 0 ? (
            <div className="text-muted-foreground py-6 text-center text-xs">{emptyText}</div>
          ) : (
            <>
              {rootKeys.map((rootKey) => renderTreeNode(rootKey))}
              {hasSearchFilter && matchedKeys.size === 0 && (
                <div className="text-muted-foreground py-6 text-center text-xs">{emptyText}</div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const TreeSelect = memo(TreeSelectComponent);
TreeSelect.displayName = "TreeSelect";
