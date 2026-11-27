"use client";

import { type KeyboardEvent, type MouseEvent, useDeferredValue, useEffect, useRef, useState } from "react";

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
import { useTreeExpandedState } from "./useTreeExpandedState";

const EMPTY_VALUES: TreeSelectValue[] = [];

export interface UseTreeSelectStateOptions {
  treeData: TreeSelectNode[];
  value?: TreeSelectValue | TreeSelectValue[];
  defaultValue?: TreeSelectValue | TreeSelectValue[];
  onChange?: (
    value: TreeSelectValue | TreeSelectValue[] | undefined,
    selectedNodes: TreeSelectNode[] | TreeSelectNode | undefined,
    extra?: { triggerValue?: TreeSelectValue; checked?: boolean; allCheckedKeys?: TreeSelectValue[] },
  ) => void;
  disabled: boolean;
  readOnly: boolean;
  onBlur?: () => void;
  allowClear: boolean;
  clearable: boolean;
  multiple: boolean;
  treeCheckable: boolean;
  showCheckedStrategy: ShowCheckedStrategy;
  onlyLeafSelectable: boolean;
  treeDefaultExpandAll: boolean;
  treeExpandedKeys?: TreeSelectValue[];
  onTreeExpand?: (keys: TreeSelectValue[]) => void;
  loadData?: (node: TreeSelectNode) => Promise<void> | void;
  fieldNames?: TreeSelectFieldNames;
  filterTreeNode?: (searchValue: string, node: TreeSelectNode) => boolean;
}

export function useTreeSelectState({
  treeData,
  value: controlledValue,
  defaultValue,
  onChange,
  disabled,
  readOnly,
  onBlur,
  allowClear,
  clearable,
  multiple,
  treeCheckable,
  showCheckedStrategy,
  onlyLeafSelectable,
  treeDefaultExpandAll,
  treeExpandedKeys: controlledExpandedKeys,
  onTreeExpand,
  loadData,
  fieldNames,
  filterTreeNode,
}: UseTreeSelectStateOptions) {
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isMultiple = multiple || treeCheckable;
  const isControlled = controlledValue !== undefined;

  const [uncontrolledValue, setUncontrolledValue] = useState<TreeSelectValue | TreeSelectValue[] | undefined>(() =>
    defaultValue !== undefined ? defaultValue : isMultiple ? EMPTY_VALUES : undefined,
  );
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue);
  const searchKeyword = deferredSearch.trim();

  const fieldKeys = defaultFieldNames(fieldNames);
  const { nodeMap, rootKeys } = buildTreeIndex(treeData, fieldKeys);

  const selectedKeysSet = new Set<TreeSelectValue>();
  if (Array.isArray(activeValue)) {
    for (const k of activeValue) {
      if (k !== undefined && k !== null) selectedKeysSet.add(k);
    }
  } else if (activeValue !== undefined && activeValue !== null) {
    selectedKeysSet.add(activeValue);
  }

  const { checkedKeys: allCascadedChecked, halfCheckedKeys } = treeCheckable
    ? resolveCascadingCheckedState(selectedKeysSet, nodeMap)
    : { checkedKeys: selectedKeysSet, halfCheckedKeys: new Set<TreeSelectValue>() };

  const { matchedKeys, hasSearchFilter, searchExpandedKeys } = collectMatchedTreeKeys(
    nodeMap,
    deferredSearch,
    filterTreeNode,
  );

  const { effectiveExpandedKeys, loadingKeys, handleToggleExpand } = useTreeExpandedState({
    nodeMap,
    treeDefaultExpandAll,
    treeExpandedKeys: controlledExpandedKeys,
    onTreeExpand,
    hasSearchFilter,
    searchKeyword,
    searchExpandedKeys,
    loadData,
    isMountedRef,
  });

  const handleCheckNode = (item: InternalTreeNode) => {
    if (disabled || readOnly || item.disabled || item.disableCheckbox) return;
    const isCurrentlyChecked = allCascadedChecked.has(item.key);
    const nextCheckedSet = applyCascadingCheckChange(allCascadedChecked, item, nodeMap, !isCurrentlyChecked);
    const formattedKeys = filterCheckedKeysByStrategy(nextCheckedSet, showCheckedStrategy, nodeMap);

    if (!isControlled) setUncontrolledValue(formattedKeys);
    const selectedNodes = formattedKeys.map((k) => nodeMap.get(k)?.raw).filter(Boolean) as TreeSelectNode[];
    onChange?.(formattedKeys, selectedNodes, {
      triggerValue: item.key,
      checked: !isCurrentlyChecked,
      allCheckedKeys: Array.from(nextCheckedSet),
    });
  };

  const handleSelectNode = (item: InternalTreeNode) => {
    if (disabled || readOnly || item.disabled || !item.selectable) return;
    if (onlyLeafSelectable && !item.isLeaf) {
      void handleToggleExpand(item);
      return;
    }

    if (!isMultiple) {
      if (!isControlled) setUncontrolledValue(item.key);
      onChange?.(item.key, item.raw, { triggerValue: item.key, checked: true });
      setOpen(false);
      return;
    }

    if (!treeCheckable) {
      const currentArr = Array.isArray(activeValue) ? [...activeValue] : [];
      const exists = currentArr.includes(item.key);
      const nextArr = exists ? currentArr.filter((k) => k !== item.key) : [...currentArr, item.key];
      if (!isControlled) setUncontrolledValue(nextArr);
      const selectedNodes = nextArr.map((k) => nodeMap.get(k)?.raw).filter(Boolean) as TreeSelectNode[];
      onChange?.(nextArr, selectedNodes, { triggerValue: item.key, checked: !exists });
      return;
    }

    handleCheckNode(item);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && (disabled || readOnly)) return;
    setOpen(nextOpen);
    if (!nextOpen) onBlur?.();
  };

  const handleClear = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (disabled || readOnly) return;
    const nextVal = isMultiple ? EMPTY_VALUES : undefined;
    if (!isControlled) setUncontrolledValue(nextVal);
    onChange?.(nextVal, isMultiple ? [] : undefined);
  };

  const handleRemoveTag = (tagKey: TreeSelectValue, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (disabled || readOnly) return;

    if (!treeCheckable) {
      const currentArr = Array.isArray(activeValue) ? activeValue.filter((k) => k !== tagKey) : [];
      if (!isControlled) setUncontrolledValue(currentArr);
      const selectedNodes = currentArr.map((k) => nodeMap.get(k)?.raw).filter(Boolean) as TreeSelectNode[];
      onChange?.(currentArr, selectedNodes, { triggerValue: tagKey, checked: false });
      return;
    }

    const item = nodeMap.get(tagKey);
    if (!item) return;

    const nextCheckedSet = applyCascadingCheckChange(allCascadedChecked, item, nodeMap, false);
    const formattedKeys = filterCheckedKeysByStrategy(nextCheckedSet, showCheckedStrategy, nodeMap);
    if (!isControlled) setUncontrolledValue(formattedKeys);
    const selectedNodes = formattedKeys.map((k) => nodeMap.get(k)?.raw).filter(Boolean) as TreeSelectNode[];
    onChange?.(formattedKeys, selectedNodes, { triggerValue: tagKey, checked: false });
  };

  const hasSelection = isMultiple
    ? Array.isArray(activeValue) && activeValue.length > 0
    : activeValue !== undefined && activeValue !== null && activeValue !== "";
  const canClear = Boolean(allowClear && clearable && !disabled && !readOnly && hasSelection);

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (disabled || readOnly) return;
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      handleOpenChange(!open);
    } else if ((e.key === "Backspace" || e.key === "Delete") && canClear) {
      e.preventDefault();
      handleClear();
    }
  };

  return {
    open,
    isMultiple,
    activeValue,
    rawValues: isMultiple && Array.isArray(activeValue) ? activeValue : EMPTY_VALUES,
    hasSelection,
    canClear,
    searchValue,
    setSearchValue,
    searchKeyword,
    nodeMap,
    rootKeys,
    effectiveExpandedKeys,
    loadingKeys,
    allCascadedChecked,
    halfCheckedKeys,
    selectedKeysSet,
    matchedKeys,
    searchExpandedKeys,
    hasSearchFilter,
    handleOpenChange,
    handleClear,
    handleRemoveTag,
    handleTriggerKeyDown,
    handleCheckNode,
    handleSelectNode,
    handleToggleExpand,
  };
}
