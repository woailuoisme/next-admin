"use client";

import { useMemoizedFn } from "ahooks";
import { Check, ChevronDown, ChevronRight, Loader2, Search, X } from "lucide-react";
import * as React from "react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface CascaderFieldNames {
  label?: string;
  value?: string;
  children?: string;
}

export interface CascaderOption {
  value?: string | number;
  label?: React.ReactNode;
  children?: CascaderOption[];
  disabled?: boolean;
  isLeaf?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  title?: string;
  [key: string]: unknown;
}

export interface CascaderProps {
  options: CascaderOption[];
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  onChange?: (value: (string | number)[], selectedOptions: CascaderOption[]) => void;
  expandTrigger?: "click" | "hover";
  changeOnSelect?: boolean;
  loadData?: (selectedOptions: CascaderOption[]) => Promise<void> | void;
  showSearch?: boolean;
  fieldNames?: CascaderFieldNames;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allowClear?: boolean;
  clearable?: boolean; // 别名支持
  separator?: string;
  displayRender?: (labels: string[], selectedOptions: CascaderOption[]) => React.ReactNode;
  disabled?: boolean;
  className?: string;
  popupClassName?: string;
  id?: string;
  size?: "sm" | "default" | "lg";
  "aria-label"?: string;
  "aria-invalid"?: boolean;
}

interface SearchResultItem {
  path: CascaderOption[];
  labels: string[];
  values: (string | number)[];
  disabled: boolean;
}

const DEFAULT_FIELD_NAMES: Required<CascaderFieldNames> = {
  label: "label",
  value: "value",
  children: "children",
};

const EMPTY_OPTIONS: CascaderOption[] = [];
const EMPTY_VALUES: (string | number)[] = [];

const SIZE_CLASSES = {
  sm: "h-8 px-2 text-xs",
  default: "h-9 px-3 text-sm",
  lg: "h-10 px-3.5 text-base",
} as const;

// 高亮搜索匹配字符
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} className="text-primary font-semibold">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function getOptionValue(
  option: CascaderOption,
  fieldNames: Required<CascaderFieldNames> = DEFAULT_FIELD_NAMES,
): string | number {
  return (option[fieldNames.value] ?? option.value ?? "") as string | number;
}

export function getOptionLabel(
  option: CascaderOption,
  fieldNames: Required<CascaderFieldNames> = DEFAULT_FIELD_NAMES,
): string {
  const raw = option[fieldNames.label] ?? option.label ?? "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  return "";
}

export function getOptionChildren(
  option: CascaderOption,
  fieldNames: Required<CascaderFieldNames> = DEFAULT_FIELD_NAMES,
): CascaderOption[] | undefined {
  return (option[fieldNames.children] ?? option.children) as CascaderOption[] | undefined;
}

// 递归根据 value 路径查找对应的节点对象链
export function resolveOptionsByValue(
  options: CascaderOption[],
  pathValues?: (string | number)[],
  fieldNames: Required<CascaderFieldNames> = DEFAULT_FIELD_NAMES,
): CascaderOption[] {
  if (!pathValues || pathValues.length === 0) return [];
  const result: CascaderOption[] = [];
  let currentLevelOptions: CascaderOption[] | undefined = options;

  for (const val of pathValues) {
    if (!currentLevelOptions) break;
    const match: CascaderOption | undefined = currentLevelOptions.find(
      (opt) => String(getOptionValue(opt, fieldNames)) === String(val),
    );
    if (!match) break;
    result.push(match);
    currentLevelOptions = getOptionChildren(match, fieldNames);
  }

  return result;
}

// 递归搜寻所有符合条件的路径项
function collectSearchPaths(
  options: CascaderOption[],
  currentPath: CascaderOption[] = [],
  query: string,
  changeOnSelect: boolean,
  fieldNames: Required<CascaderFieldNames>,
): SearchResultItem[] {
  const results: SearchResultItem[] = [];
  const lowerQuery = query.toLowerCase().trim();

  for (const option of options) {
    const nextPath = [...currentPath, option];
    const children = getOptionChildren(option, fieldNames);
    const isLeaf =
      option.isLeaf === true ||
      (!children && option.isLeaf !== false) ||
      (children && children.length === 0 && option.isLeaf !== false);

    const pathLabels = nextPath.map((o) => getOptionLabel(o, fieldNames));
    const fullText = pathLabels.join(" / ").toLowerCase();
    const isMatch = fullText.includes(lowerQuery);

    if (isMatch && (changeOnSelect || isLeaf)) {
      results.push({
        path: nextPath,
        labels: pathLabels,
        values: nextPath.map((o) => getOptionValue(o, fieldNames)),
        disabled: nextPath.some((o) => Boolean(o.disabled)),
      });
    }

    if (children && children.length > 0) {
      results.push(...collectSearchPaths(children, nextPath, query, changeOnSelect, fieldNames));
    }
  }

  return results;
}

function CascaderComponent({
  options = EMPTY_OPTIONS,
  value: controlledValue,
  defaultValue = EMPTY_VALUES,
  onChange,
  expandTrigger = "click",
  changeOnSelect = false,
  loadData,
  showSearch = false,
  fieldNames: customFieldNames,
  placeholder = "请选择...",
  searchPlaceholder = "搜索选项路径...",
  emptyText = "暂无匹配数据",
  allowClear = true,
  clearable = true,
  separator = " / ",
  displayRender,
  disabled = false,
  className,
  popupClassName,
  id,
  size = "default",
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}: CascaderProps) {
  const fieldNames: Required<CascaderFieldNames> = useMemo(
    () => ({
      ...DEFAULT_FIELD_NAMES,
      ...customFieldNames,
    }),
    [customFieldNames],
  );

  const isClearable = allowClear && clearable;
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<(string | number)[]>(defaultValue);
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // 展开列的激活路径
  const [activePath, setActivePath] = useState<CascaderOption[]>(() =>
    resolveOptionsByValue(options, currentValue, fieldNames),
  );

  const isMountedRef = useRef(true);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setActivePath(resolveOptionsByValue(options, currentValue, fieldNames));
      setSearchQuery("");
    } else {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    }
  });

  // 获取当前实际选中的选项链
  const selectedOptions = useMemo(
    () => resolveOptionsByValue(options, currentValue, fieldNames),
    [options, currentValue, fieldNames],
  );

  // 构建各列要显示的数据（多列级联）
  const columns = useMemo(() => {
    const cols: CascaderOption[][] = [options];
    for (let i = 0; i < activePath.length; i++) {
      const item = activePath[i];
      const children = item ? getOptionChildren(item, fieldNames) : undefined;
      if (children && children.length > 0) {
        cols.push(children);
      } else {
        break;
      }
    }
    return cols;
  }, [options, activePath, fieldNames]);

  // 搜索结果列表
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return collectSearchPaths(options, [], searchQuery, changeOnSelect, fieldNames);
  }, [options, searchQuery, changeOnSelect, fieldNames]);

  const handleClear = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (!isControlled) {
      setUncontrolledValue([]);
    }
    setActivePath([]);
    onChange?.([], []);
  });

  const handleSelectPath = useMemoizedFn((path: CascaderOption[], shouldClose: boolean) => {
    const newValues = path.map((item) => getOptionValue(item, fieldNames));
    if (!isControlled) {
      setUncontrolledValue(newValues);
    }
    onChange?.(newValues, path);
    if (shouldClose) {
      setOpen(false);
    }
  });

  const handleOptionInteraction = useMemoizedFn(
    async (option: CascaderOption, columnIndex: number, isHover = false) => {
      if (option.disabled) return;

      const optValue = String(getOptionValue(option, fieldNames));
      const newPath = [...activePath.slice(0, columnIndex), option];
      setActivePath(newPath);

      const children = getOptionChildren(option, fieldNames);
      const hasChildren = children && children.length > 0;
      const canLoadAsync = !hasChildren && option.isLeaf === false && typeof loadData === "function";
      const isLeafNode = option.isLeaf === true || (!hasChildren && !canLoadAsync);

      // 处理动态异步加载 (Ant Design loadData 规范)
      if (canLoadAsync && !loadingMap[optValue]) {
        setLoadingMap((prev) => ({ ...prev, [optValue]: true }));
        try {
          await loadData(newPath);
        } finally {
          if (isMountedRef.current) {
            setLoadingMap((prev) => ({ ...prev, [optValue]: false }));
          }
        }
      }

      // 如果允许任意级选择 (changeOnSelect)
      if (changeOnSelect) {
        if (!isHover) {
          handleSelectPath(newPath, isLeafNode);
        }
      } else {
        // 严格模式：仅末级叶子节点可以完成最终赋值并关闭弹层
        if (isLeafNode && !isHover) {
          handleSelectPath(newPath, true);
        }
      }
    },
  );

  const handleItemClick = (option: CascaderOption, columnIndex: number) => {
    handleOptionInteraction(option, columnIndex, false);
  };

  const handleItemMouseEnter = (option: CascaderOption, columnIndex: number) => {
    if (expandTrigger !== "hover") return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      handleOptionInteraction(option, columnIndex, true);
    }, 120);
  };

  // 渲染触发器文本
  const displayText = useMemo(() => {
    if (selectedOptions.length === 0) return null;
    const labels = selectedOptions.map((o) => getOptionLabel(o, fieldNames));
    if (displayRender) {
      return displayRender(labels, selectedOptions);
    }
    return labels.join(separator);
  }, [selectedOptions, displayRender, separator, fieldNames]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel || placeholder}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          className={cn(
            "group relative w-full justify-between text-left font-normal select-none transition-colors",
            SIZE_CLASSES[size],
            isClearable && currentValue.length > 0 && !disabled && "pr-8",
            currentValue.length === 0 && "text-muted-foreground",
            ariaInvalid && "border-destructive focus-visible:ring-destructive",
            className,
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOptions[0]?.icon && <span className="shrink-0">{selectedOptions[0].icon}</span>}
            <span className="truncate">{displayText || placeholder}</span>
          </span>

          <ChevronDown
            className={cn(
              "ml-2 size-4 shrink-0 opacity-50 transition-transform duration-200",
              open && "rotate-180",
            )}
          />

          {isClearable && currentValue.length > 0 && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClear(e as unknown as React.MouseEvent);
                }
              }}
              aria-label="清除选中"
              className="text-muted-foreground hover:bg-muted hover:text-foreground absolute right-7 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full transition-colors"
            >
              <X className="size-3.5" />
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={4}
        className={cn("ring-border/50 z-50 w-auto min-w-[200px] p-0 shadow-lg ring-1", popupClassName)}
      >
        {/* 顶部搜索栏 (可选跨路径搜索) */}
        {showSearch && (
          <div className="border-border border-b p-2">
            <div className="relative flex items-center">
              <Search className="text-muted-foreground absolute left-2.5 size-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="bg-muted/50 placeholder:text-muted-foreground focus-visible:ring-ring h-8 w-full rounded-md pr-7 pl-8 text-xs outline-hidden focus-visible:ring-1"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-muted-foreground hover:text-foreground absolute right-2 size-4 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 路径搜索结果视图 */}
        {searchQuery.trim() ? (
          <div className="no-scrollbar max-h-64 min-w-[280px] overflow-y-auto p-1 text-sm">
            {searchResults.length === 0 ? (
              <div className="text-muted-foreground flex h-24 items-center justify-center text-xs">
                {emptyText}
              </div>
            ) : (
              searchResults.map((item, idx) => {
                const isSelected =
                  item.values.length === currentValue.length &&
                  item.values.every((v, i) => String(v) === String(currentValue[i]));

                return (
                  <button
                    key={item.values.join("-") || idx}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => handleSelectPath(item.path, true)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent/70 text-accent-foreground font-medium",
                      item.disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    <span className="truncate">
                      {highlightMatch(item.labels.join(separator), searchQuery)}
                    </span>
                    {isSelected && <Check className="text-primary size-3.5 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        ) : (
          /* 多列分栏级联视图 (参考 Ant Design Menu Panels) */
          <div className="divide-border flex divide-x">
            {columns.map((columnOptions, colIndex) => {
              const activeOptionInCol = activePath[colIndex];

              return (
                <div
                  key={colIndex}
                  className="no-scrollbar h-64 max-w-[200px] min-w-[130px] overflow-y-auto p-1 text-sm"
                >
                  {columnOptions.length === 0 ? (
                    <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                      {emptyText}
                    </div>
                  ) : (
                    columnOptions.map((opt) => {
                      const optVal = getOptionValue(opt, fieldNames);
                      const optLabel = getOptionLabel(opt, fieldNames);
                      const optChildren = getOptionChildren(opt, fieldNames);

                      const isActive =
                        activeOptionInCol &&
                        String(getOptionValue(activeOptionInCol, fieldNames)) === String(optVal);

                      const isSelectedInFinal =
                        currentValue.length > colIndex && String(currentValue[colIndex]) === String(optVal);

                      const isFinalLeaf =
                        isSelectedInFinal &&
                        (opt.isLeaf === true ||
                          (!optChildren && opt.isLeaf !== false) ||
                          currentValue.length === colIndex + 1);

                      const isLoading = Boolean(opt.loading || loadingMap[String(optVal)]);
                      const hasSubMenu = (optChildren && optChildren.length > 0) || opt.isLeaf === false;

                      return (
                        <div
                          key={String(optVal)}
                          role="menuitem"
                          tabIndex={opt.disabled ? -1 : 0}
                          title={opt.title ?? (typeof opt.label === "string" ? opt.label : optLabel)}
                          onClick={() => handleItemClick(opt, colIndex)}
                          onMouseEnter={() => handleItemMouseEnter(opt, colIndex)}
                          className={cn(
                            "relative flex w-full cursor-pointer items-center justify-between gap-1.5 rounded-md px-2.5 py-1.5 text-xs select-none transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive && "bg-accent/80 text-accent-foreground font-medium",
                            opt.disabled && "pointer-events-none opacity-50",
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-1.5">
                            {opt.icon && <span className="size-3.5 shrink-0">{opt.icon}</span>}
                            <span className="truncate">{opt.label ?? optLabel}</span>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            {isLoading ? (
                              <Loader2 className="text-muted-foreground size-3.5 animate-spin" />
                            ) : hasSubMenu ? (
                              <ChevronRight className="text-muted-foreground size-3.5 opacity-60" />
                            ) : isFinalLeaf ? (
                              <Check className="text-primary size-3.5" />
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export const Cascader = memo(CascaderComponent);
Cascader.displayName = "Cascader";
