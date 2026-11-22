"use client";

import { useMemoizedFn } from "ahooks";
import { type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from "react";

import {
  collectCascaderSearchPaths,
  DEFAULT_CASCADER_FIELD_NAMES,
  getCascaderOptionChildren,
  getCascaderOptionValue,
  resolveCascaderOptionsByValue,
  type CascaderFieldNames,
  type CascaderOption,
} from "./treeEngine";

const EMPTY_VALUES: (string | number)[] = [];

export interface UseCascaderStateOptions {
  options: CascaderOption[];
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  onChange?: (value: (string | number)[], selectedOptions: CascaderOption[]) => void;
  expandTrigger: "click" | "hover";
  changeOnSelect: boolean;
  loadData?: (selectedOptions: CascaderOption[]) => Promise<void> | void;
  customFieldNames?: CascaderFieldNames;
  allowClear: boolean;
  clearable: boolean;
  disabled: boolean;
  readOnly: boolean;
  onBlur?: () => void;
}

export function useCascaderState({
  options,
  value: controlledValue,
  defaultValue = EMPTY_VALUES,
  onChange,
  expandTrigger,
  changeOnSelect,
  loadData,
  customFieldNames,
  allowClear,
  clearable,
  disabled,
  readOnly,
  onBlur,
}: UseCascaderStateOptions) {
  const fieldNames: Required<CascaderFieldNames> = {
    ...DEFAULT_CASCADER_FIELD_NAMES,
    ...customFieldNames,
  };

  const isClearable = allowClear && clearable;
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<(string | number)[]>(defaultValue);
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [activeValuePath, setActiveValuePath] = useState<(string | number)[]>(() =>
    resolveCascaderOptionsByValue(options, currentValue, fieldNames).map((item) =>
      getCascaderOptionValue(item, fieldNames),
    ),
  );

  const activePath = resolveCascaderOptionsByValue(options, activeValuePath, fieldNames);

  const isMountedRef = useRef(true);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (nextOpen && (disabled || readOnly)) return;
    setOpen(nextOpen);
    if (nextOpen) {
      setActiveValuePath(
        resolveCascaderOptionsByValue(options, currentValue, fieldNames).map((item) =>
          getCascaderOptionValue(item, fieldNames),
        ),
      );
      setSearchQuery("");
    } else {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      onBlur?.();
    }
  });

  const selectedOptions = resolveCascaderOptionsByValue(options, currentValue, fieldNames);

  const columns: CascaderOption[][] = [options];
  for (let i = 0; i < activePath.length; i++) {
    const item = activePath[i];
    const children = item ? getCascaderOptionChildren(item, fieldNames) : undefined;
    if (children && children.length > 0) columns.push(children);
    else break;
  }

  const searchResults = searchQuery.trim()
    ? collectCascaderSearchPaths(options, [], searchQuery, changeOnSelect, fieldNames)
    : [];

  const handleClear = useMemoizedFn((e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (disabled || readOnly) return;
    if (!isControlled) setUncontrolledValue([]);
    setActiveValuePath([]);
    onChange?.([], []);
  });

  const handleSelectPath = useMemoizedFn((path: CascaderOption[], shouldClose: boolean) => {
    const newValues = path.map((item) => getCascaderOptionValue(item, fieldNames));
    if (!isControlled) setUncontrolledValue(newValues);
    onChange?.(newValues, path);
    if (shouldClose) setOpen(false);
  });

  const handleOptionInteraction = useMemoizedFn(
    async (option: CascaderOption, columnIndex: number, isHover = false) => {
      if (option.disabled) return;

      const rawOptValue = getCascaderOptionValue(option, fieldNames);
      const optValue = String(rawOptValue);
      const newValuePath = [...activeValuePath.slice(0, columnIndex), rawOptValue];
      const newPath = [...activePath.slice(0, columnIndex), option];
      setActiveValuePath(newValuePath);

      const children = getCascaderOptionChildren(option, fieldNames);
      const hasChildren = Boolean(children && children.length > 0);
      const canLoadAsync = !hasChildren && option.isLeaf === false && typeof loadData === "function";
      const isLeafNode = option.isLeaf === true || (!hasChildren && !canLoadAsync);

      if (canLoadAsync && !loadingMap[optValue]) {
        setLoadingMap((prev) => ({ ...prev, [optValue]: true }));
        try {
          await loadData(newPath);
        } catch {
          return;
        } finally {
          if (isMountedRef.current) {
            setLoadingMap((prev) => ({ ...prev, [optValue]: false }));
          }
        }
      }

      if (changeOnSelect) {
        if (!isHover) handleSelectPath(newPath, isLeafNode);
      } else if (isLeafNode && !isHover) {
        handleSelectPath(newPath, true);
      }
    },
  );

  const handleItemClick = useMemoizedFn((option: CascaderOption, columnIndex: number) => {
    void handleOptionInteraction(option, columnIndex, false);
  });

  const handleItemMouseEnter = useMemoizedFn((option: CascaderOption, columnIndex: number) => {
    if (expandTrigger !== "hover") return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      void handleOptionInteraction(option, columnIndex, true);
    }, 120);
  });

  const canClear = Boolean(isClearable && currentValue.length > 0 && !disabled && !readOnly);

  const handleTriggerKeyDown = useMemoizedFn((e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || readOnly) return;
    if ((e.key === "Backspace" || e.key === "Delete") && canClear) {
      e.preventDefault();
      handleClear();
    }
  });

  return {
    fieldNames,
    open,
    searchQuery,
    setSearchQuery,
    loadingMap,
    currentValue,
    activePath,
    selectedOptions,
    columns,
    searchResults,
    canClear,
    handleOpenChange,
    handleClear,
    handleSelectPath,
    handleItemClick,
    handleItemMouseEnter,
    handleTriggerKeyDown,
  };
}
