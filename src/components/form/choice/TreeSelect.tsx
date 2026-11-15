"use client";

import { useMemoizedFn } from "ahooks";
import { Check, ChevronDown, ChevronRight, FileText, Folder, FolderOpen, Loader2, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  memo,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import { FieldClearButton } from "../core";
import { HighlightedText } from "./HighlightedText";
import {
  applyCascadingCheckChange,
  buildTreeIndex,
  collectMatchedTreeKeys,
  defaultFieldNames,
  filterCheckedKeysByStrategy,
  resolveCascadingCheckedState,
  type InternalTreeNode,
  type ShowCheckedStrategy,
  type TreeSelectFieldNames,
  type TreeSelectNode,
  type TreeSelectValue,
} from "./treeEngine";

export type { ShowCheckedStrategy, TreeSelectFieldNames, TreeSelectNode, TreeSelectValue };

export interface TreeSelectProps {
  treeData?: TreeSelectNode[];
  value?: TreeSelectValue | TreeSelectValue[];
  defaultValue?: TreeSelectValue | TreeSelectValue[];
  onChange?: (
    value: TreeSelectValue | TreeSelectValue[] | undefined,
    selectedNodes: TreeSelectNode[] | TreeSelectNode | undefined,
    extra?: {
      triggerValue?: TreeSelectValue;
      checked?: boolean;
      allCheckedKeys?: TreeSelectValue[];
    },
  ) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onBlur?: () => void;
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
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

const EMPTY_TREE_DATA: TreeSelectNode[] = [];
const EMPTY_ARRAY: TreeSelectValue[] = [];

const SIZE_CLASSES = {
  sm: "min-h-8 px-2.5 py-1 text-xs",
  default: "min-h-9 px-3 py-1.5 text-sm",
  lg: "min-h-10 px-3.5 py-2 text-base",
} as const;

interface TreeNodeRowProps {
  nodeKey: TreeSelectValue;
  nodeMap: Map<TreeSelectValue, InternalTreeNode>;
  effectiveExpandedKeys: Set<TreeSelectValue>;
  loadingKeys: Set<TreeSelectValue>;
  allCascadedChecked: Set<TreeSelectValue>;
  halfCheckedKeys: Set<TreeSelectValue>;
  selectedKeysSet: Set<TreeSelectValue>;
  matchedKeys: Set<TreeSelectValue>;
  hasSearchFilter: boolean;
  searchKeyword: string;
  isMultiple: boolean;
  treeCheckable: boolean;
  treeLine: boolean;
  showIcon: boolean;
  hasLoadData: boolean;
  expandLabel: string;
  collapseLabel: string;
  onSelectNode: (item: InternalTreeNode) => void;
  onToggleExpand: (item: InternalTreeNode, e?: MouseEvent) => void;
}

const TreeNodeRow = memo(function TreeNodeRow({
  nodeKey,
  nodeMap,
  effectiveExpandedKeys,
  loadingKeys,
  allCascadedChecked,
  halfCheckedKeys,
  selectedKeysSet,
  matchedKeys,
  hasSearchFilter,
  searchKeyword,
  isMultiple,
  treeCheckable,
  treeLine,
  showIcon,
  hasLoadData,
  expandLabel,
  collapseLabel,
  onSelectNode,
  onToggleExpand,
}: TreeNodeRowProps) {
  const item = nodeMap.get(nodeKey);
  if (!item) return null;

  if (hasSearchFilter) {
    const isMatched = matchedKeys.has(nodeKey);
    const hasMatchedDescendant = item.descendantKeys.some((dk) => matchedKeys.has(dk));
    if (!isMatched && !hasMatchedDescendant) {
      return null;
    }
  }

  const isExpanded = effectiveExpandedKeys.has(nodeKey);
  const isLoading = loadingKeys.has(nodeKey);
  const hasChildren = item.childrenKeys.length > 0 || (hasLoadData && !item.isLeaf);

  const isChecked = allCascadedChecked.has(nodeKey);
  const isHalfChecked = halfCheckedKeys.has(nodeKey);
  const isSingleSelected = !isMultiple && selectedKeysSet.has(nodeKey);

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
    <div className="relative flex flex-col">
      {treeLine && item.level > 0 && (
        <div
          className="border-border/60 pointer-events-none absolute top-0 bottom-0 border-l border-dashed"
          style={{ left: `${(item.level - 1) * 20 + 10}px` }}
        />
      )}

      <div
        className={cn(
          "group relative flex min-h-8 items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors select-none",
          item.disabled ? "text-muted-foreground/50 cursor-not-allowed" : "hover:bg-accent/60",
          isSingleSelected && "bg-primary/10 text-primary font-medium hover:bg-primary/15",
        )}
        style={{ paddingLeft: `${item.level * 20 + 8}px` }}
      >
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

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={!hasChildren || item.disabled || isLoading}
          tabIndex={hasChildren && !item.disabled ? 0 : -1}
          aria-label={isExpanded ? collapseLabel : expandLabel}
          aria-expanded={hasChildren ? isExpanded : undefined}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren && !isLoading) {
              onToggleExpand(item, e);
            }
          }}
          className={cn(
            "size-5 shrink-0 rounded-sm p-0",
            hasChildren && !item.disabled ? "cursor-pointer" : "pointer-events-none opacity-0",
          )}
        >
          {isLoading ? (
            <Loader2 className="text-primary size-3.5 animate-spin" />
          ) : isExpanded ? (
            <ChevronDown className="text-muted-foreground size-3.5" />
          ) : (
            <ChevronRight className="text-muted-foreground size-3.5" />
          )}
        </Button>

        {treeCheckable && (
          <Checkbox
            checked={isChecked ? true : isHalfChecked ? "indeterminate" : false}
            disabled={item.disabled || item.disableCheckbox}
            onCheckedChange={() => onSelectNode(item)}
            aria-label={item.label}
            className="size-4 shrink-0 rounded-xs"
          />
        )}

        <Button
          type="button"
          variant="ghost"
          size="xs"
          disabled={item.disabled || !item.selectable}
          onClick={() => onSelectNode(item)}
          className={cn(
            "h-auto min-w-0 flex-1 justify-start gap-1.5 px-1 py-0.5 text-left font-normal shadow-none outline-hidden hover:bg-transparent focus-visible:underline",
            item.disabled || !item.selectable ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          {iconElement}
          <span className="min-w-0 flex-1 truncate">
            {hasSearchFilter ? (
              <HighlightedText text={item.label} keyword={searchKeyword} variant="mark" />
            ) : (
              item.labelNode
            )}
          </span>
          {isSingleSelected && <Check className="text-primary size-3.5 shrink-0" />}
        </Button>
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col">
          {item.childrenKeys.map((childKey) => (
            <TreeNodeRow
              key={String(childKey)}
              nodeKey={childKey}
              nodeMap={nodeMap}
              effectiveExpandedKeys={effectiveExpandedKeys}
              loadingKeys={loadingKeys}
              allCascadedChecked={allCascadedChecked}
              halfCheckedKeys={halfCheckedKeys}
              selectedKeysSet={selectedKeysSet}
              matchedKeys={matchedKeys}
              hasSearchFilter={hasSearchFilter}
              searchKeyword={searchKeyword}
              isMultiple={isMultiple}
              treeCheckable={treeCheckable}
              treeLine={treeLine}
              showIcon={showIcon}
              hasLoadData={hasLoadData}
              expandLabel={expandLabel}
              collapseLabel={collapseLabel}
              onSelectNode={onSelectNode}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
});

function TreeSelectComponent({
  treeData = EMPTY_TREE_DATA,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder: propPlaceholder,
  disabled = false,
  readOnly = false,
  onBlur,
  allowClear = true,
  clearable = true,
  multiple = false,
  treeCheckable = false,
  showCheckedStrategy = "SHOW_PARENT",
  onlyLeafSelectable = false,
  treeLine = false,
  showIcon = false,
  showSearch = true,
  searchPlaceholder: propSearchPlaceholder,
  emptyText: propEmptyText,
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
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: TreeSelectProps) {
  const t = useTranslations("form");
  const placeholder = propPlaceholder ?? t("treeselect_placeholder");
  const searchPlaceholder = propSearchPlaceholder ?? t("treeselect_search_placeholder");
  const emptyText = propEmptyText ?? t("treeselect_empty");

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const autoId = useId();
  const triggerId = id || `treeselect-${autoId}`;
  const listboxId = `treeselect-listbox-${autoId}`;

  const isMultiple = multiple || treeCheckable;
  const isControlled = controlledValue !== undefined;
  const isExpandControlled = controlledExpandedKeys !== undefined;

  const [uncontrolledValue, setUncontrolledValue] = useState<TreeSelectValue | TreeSelectValue[] | undefined>(() =>
    defaultValue !== undefined ? defaultValue : isMultiple ? EMPTY_ARRAY : undefined,
  );
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);
  const [loadingKeys, setLoadingKeys] = useState<Set<TreeSelectValue>>(() => new Set());

  const fieldKeys = useMemo(() => defaultFieldNames(fieldNames), [fieldNames]);
  const { nodeMap, rootKeys } = useMemo(() => buildTreeIndex(treeData, fieldKeys), [treeData, fieldKeys]);

  const [uncontrolledExpandedKeys, setUncontrolledExpandedKeys] = useState<Set<TreeSelectValue> | null>(() =>
    treeDefaultExpandAll ? null : new Set<TreeSelectValue>(),
  );

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
      const next = updater(activeExpandedKeys);
      if (!isExpandControlled) {
        setUncontrolledExpandedKeys(next);
      }
      onTreeExpand?.(Array.from(next));
    },
    [isExpandControlled, activeExpandedKeys, onTreeExpand],
  );

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

  const { checkedKeys: allCascadedChecked, halfCheckedKeys } = useMemo(() => {
    if (!treeCheckable) {
      return {
        checkedKeys: selectedKeysSet,
        halfCheckedKeys: new Set<TreeSelectValue>(),
      };
    }
    return resolveCascadingCheckedState(selectedKeysSet, nodeMap);
  }, [treeCheckable, selectedKeysSet, nodeMap]);

  const { matchedKeys, hasSearchFilter, searchExpandedKeys } = useMemo(
    () => collectMatchedTreeKeys(nodeMap, deferredSearch, filterTreeNode),
    [deferredSearch, nodeMap, filterTreeNode],
  );

  const effectiveExpandedKeys = useMemo(() => {
    if (!hasSearchFilter) return activeExpandedKeys;
    const merged = new Set(activeExpandedKeys);
    for (const k of searchExpandedKeys) {
      merged.add(k);
    }
    return merged;
  }, [hasSearchFilter, searchExpandedKeys, activeExpandedKeys]);

  const handleToggleExpand = useMemoizedFn(async (node: InternalTreeNode, e?: MouseEvent) => {
    e?.stopPropagation();
    const key = node.key;
    const isExpanded = effectiveExpandedKeys.has(key);

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
  });

  const handleSelectNode = useMemoizedFn((item: InternalTreeNode) => {
    if (item.disabled || !item.selectable) return;
    if (onlyLeafSelectable && !item.isLeaf) {
      void handleToggleExpand(item);
      return;
    }

    if (!isMultiple) {
      const nextVal = item.key;
      if (!isControlled) {
        setUncontrolledValue(nextVal);
      }
      onChange?.(nextVal, item.raw, { triggerValue: nextVal, checked: true });
      setOpen(false);
      return;
    }

    if (!treeCheckable) {
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

    const isCurrentlyChecked = allCascadedChecked.has(item.key);
    const nextCheckedSet = applyCascadingCheckChange(allCascadedChecked, item, nodeMap, !isCurrentlyChecked);
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
  });

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (nextOpen && (disabled || readOnly)) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      onBlur?.();
    }
  });

  const handleClear = useMemoizedFn((e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (disabled || readOnly) return;
    const nextVal = isMultiple ? EMPTY_ARRAY : undefined;
    if (!isControlled) {
      setUncontrolledValue(nextVal);
    }
    onChange?.(nextVal, isMultiple ? [] : undefined);
  });

  const handleRemoveTag = useMemoizedFn((tagKey: TreeSelectValue, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (disabled || readOnly) return;

    if (!treeCheckable) {
      const currentArr = Array.isArray(activeValue) ? activeValue.filter((k) => k !== tagKey) : [];
      if (!isControlled) {
        setUncontrolledValue(currentArr);
      }
      const selectedNodes = currentArr.map((k) => nodeMap.get(k)?.raw).filter(Boolean) as TreeSelectNode[];
      onChange?.(currentArr, selectedNodes, { triggerValue: tagKey, checked: false });
      return;
    }

    const item = nodeMap.get(tagKey);
    if (!item) return;

    const nextCheckedSet = applyCascadingCheckChange(allCascadedChecked, item, nodeMap, false);
    const formattedKeys = filterCheckedKeysByStrategy(nextCheckedSet, showCheckedStrategy, nodeMap);
    if (!isControlled) {
      setUncontrolledValue(formattedKeys);
    }
    const selectedNodes = formattedKeys.map((k) => nodeMap.get(k)?.raw).filter(Boolean) as TreeSelectNode[];
    onChange?.(formattedKeys, selectedNodes, { triggerValue: tagKey, checked: false });
  });

  const hasSelection = isMultiple
    ? Array.isArray(activeValue) && activeValue.length > 0
    : activeValue !== undefined && activeValue !== null && activeValue !== "";

  const canClear = Boolean((allowClear || clearable) && !disabled && !readOnly && hasSelection);

  const handleTriggerKeyDown = useMemoizedFn((e: KeyboardEvent<HTMLElement>) => {
    if (disabled || readOnly) return;
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      handleOpenChange(!open);
    } else if ((e.key === "Backspace" || e.key === "Delete") && canClear) {
      e.preventDefault();
      handleClear();
    }
  });

  const rawValues = isMultiple && Array.isArray(activeValue) ? activeValue : EMPTY_ARRAY;
  const visibleTags = typeof maxTagCount === "number" ? rawValues.slice(0, maxTagCount) : rawValues;
  const omittedCount = rawValues.length - visibleTags.length;

  const renderSingleTriggerContent = () => {
    if (!hasSelection) {
      return <span className="text-muted-foreground truncate">{placeholder}</span>;
    }

    const selectedItem = nodeMap.get(activeValue as TreeSelectValue);
    return (
      <span className="text-foreground flex-1 truncate font-normal">{selectedItem?.label ?? String(activeValue)}</span>
    );
  };

  const expandLabel = t("treeselect_expand_node");
  const collapseLabel = t("treeselect_collapse_node");

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className="relative flex w-full items-center">
        {isMultiple ? (
          <div
            className={cn(
              "border-input bg-background flex w-full flex-wrap items-center gap-1 rounded-md border shadow-xs transition-colors",
              canClear && "pr-8",
              disabled && "pointer-events-none cursor-not-allowed opacity-50",
              ariaInvalid && "border-destructive",
              SIZE_CLASSES[size],
              className,
            )}
          >
            {visibleTags.map((key) => {
              const item = nodeMap.get(key);
              const tagLabel = item?.label ?? String(key);
              return (
                <Badge
                  key={String(key)}
                  variant="secondary"
                  className="bg-muted text-foreground hover:bg-muted/80 inline-flex max-w-[160px] items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-normal"
                >
                  <span className="truncate">{tagLabel}</span>
                  {!disabled && !readOnly && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => handleRemoveTag(key, e)}
                      aria-label={t("treeselect_remove_tag", { label: tagLabel })}
                      className="text-muted-foreground hover:text-foreground inline-flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 hover:bg-transparent"
                    >
                      <X className="size-2.5" />
                    </Button>
                  )}
                </Badge>
              );
            })}

            {omittedCount > 0 && (
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
            )}

            <PopoverTrigger asChild>
              <Button
                id={triggerId}
                type="button"
                variant="ghost"
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-haspopup="tree"
                aria-readonly={readOnly || undefined}
                aria-label={ariaLabel || placeholder}
                aria-invalid={ariaInvalid}
                aria-describedby={ariaDescribedBy}
                disabled={disabled}
                onKeyDown={handleTriggerKeyDown}
                onBlur={() => !open && onBlur?.()}
                className={cn(
                  "h-auto min-w-0 flex-1 justify-between gap-2 px-1 py-0.5 text-left font-normal shadow-none hover:bg-transparent",
                  !hasSelection ? "text-muted-foreground" : "justify-end",
                )}
              >
                {!hasSelection ? (
                  <span className="truncate">{placeholder}</span>
                ) : (
                  <span className="sr-only">{placeholder}</span>
                )}
                <ChevronDown
                  className={cn(
                    "text-muted-foreground size-4 shrink-0 transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
              </Button>
            </PopoverTrigger>
          </div>
        ) : (
          <PopoverTrigger asChild>
            <Button
              id={triggerId}
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-haspopup="tree"
              aria-readonly={readOnly || undefined}
              aria-label={ariaLabel || placeholder}
              aria-invalid={ariaInvalid}
              aria-describedby={ariaDescribedBy}
              disabled={disabled}
              onKeyDown={handleTriggerKeyDown}
              onBlur={() => !open && onBlur?.()}
              className={cn(
                "w-full justify-between gap-2 text-left font-normal shadow-xs",
                canClear && "pr-8",
                ariaInvalid && "border-destructive focus-visible:ring-destructive",
                SIZE_CLASSES[size],
                className,
              )}
            >
              {renderSingleTriggerContent()}
              <ChevronDown
                className={cn(
                  "text-muted-foreground size-4 shrink-0 transition-transform duration-200",
                  open && "rotate-180",
                )}
              />
            </Button>
          </PopoverTrigger>
        )}

        {canClear && (
          <FieldClearButton
            onClick={handleClear}
            ariaLabel={t("treeselect_clear")}
            className="hover:bg-muted absolute right-7 z-10"
          />
        )}
      </div>

      <PopoverContent
        id={listboxId}
        align="start"
        className={cn(
          "border-border bg-popover text-popover-foreground w-(--radix-popover-trigger-width) min-w-[260px] p-0 shadow-md",
          popupClassName,
        )}
      >
        {showSearch && (
          <div className="border-border/60 relative flex items-center border-b px-2.5 py-2">
            <Search className="text-muted-foreground pointer-events-none mr-1.5 size-3.5 shrink-0" />
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-7 flex-1 border-0 bg-transparent px-1 pr-6 text-xs shadow-none focus-visible:ring-0"
            />
            {searchValue && (
              <FieldClearButton
                onClick={() => setSearchValue("")}
                ariaLabel={t("treeselect_clear_search")}
                className="absolute right-2.5"
              />
            )}
          </div>
        )}

        <div className="max-h-72 scrollbar-thin overflow-y-auto p-1.5" role="tree">
          {rootKeys.length === 0 ? (
            <div className="text-muted-foreground py-6 text-center text-xs">{emptyText}</div>
          ) : (
            <>
              {rootKeys.map((rootKey) => (
                <TreeNodeRow
                  key={String(rootKey)}
                  nodeKey={rootKey}
                  nodeMap={nodeMap}
                  effectiveExpandedKeys={effectiveExpandedKeys}
                  loadingKeys={loadingKeys}
                  allCascadedChecked={allCascadedChecked}
                  halfCheckedKeys={halfCheckedKeys}
                  selectedKeysSet={selectedKeysSet}
                  matchedKeys={matchedKeys}
                  hasSearchFilter={hasSearchFilter}
                  searchKeyword={deferredSearch.trim()}
                  isMultiple={isMultiple}
                  treeCheckable={treeCheckable}
                  treeLine={treeLine}
                  showIcon={showIcon}
                  hasLoadData={Boolean(loadData)}
                  expandLabel={expandLabel}
                  collapseLabel={collapseLabel}
                  onSelectNode={handleSelectNode}
                  onToggleExpand={handleToggleExpand}
                />
              ))}
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
