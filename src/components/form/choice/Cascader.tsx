"use client";

import { useMemoizedFn } from "ahooks";
import { Check, ChevronDown, ChevronRight, Loader2, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type KeyboardEvent,
  memo,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import { FieldClearButton } from "../core";
import { HighlightedText } from "./HighlightedText";
import {
  collectCascaderSearchPaths,
  DEFAULT_CASCADER_FIELD_NAMES,
  getCascaderOptionChildren,
  getCascaderOptionLabel,
  getCascaderOptionValue,
  resolveCascaderOptionsByValue,
  type CascaderFieldNames,
  type CascaderOption,
} from "./treeEngine";

export type { CascaderFieldNames, CascaderOption };

export {
  getCascaderOptionChildren as getOptionChildren,
  getCascaderOptionLabel as getOptionLabel,
  getCascaderOptionValue as getOptionValue,
  resolveCascaderOptionsByValue as resolveOptionsByValue,
};

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
  clearable?: boolean;
  separator?: string;
  displayRender?: (labels: string[], selectedOptions: CascaderOption[]) => ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  onBlur?: () => void;
  className?: string;
  popupClassName?: string;
  id?: string;
  size?: "sm" | "default" | "lg";
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

const EMPTY_OPTIONS: CascaderOption[] = [];
const EMPTY_VALUES: (string | number)[] = [];

const SIZE_CLASSES = {
  sm: "h-8 px-2 text-xs",
  default: "h-9 px-3 text-sm",
  lg: "h-10 px-3.5 text-base",
} as const;

interface CascaderColumnOptionRowProps {
  option: CascaderOption;
  columnIndex: number;
  fieldNames: Required<CascaderFieldNames>;
  isActive: boolean;
  isFinalLeaf: boolean;
  isLoading: boolean;
  hasSubMenu: boolean;
  onClickOption: (option: CascaderOption, columnIndex: number) => void;
  onMouseEnterOption: (option: CascaderOption, columnIndex: number) => void;
}

const CascaderColumnOptionRow = memo(function CascaderColumnOptionRow({
  option,
  columnIndex,
  fieldNames,
  isActive,
  isFinalLeaf,
  isLoading,
  hasSubMenu,
  onClickOption,
  onMouseEnterOption,
}: CascaderColumnOptionRowProps) {
  const optLabel = getCascaderOptionLabel(option, fieldNames);

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      role="menuitem"
      disabled={Boolean(option.disabled)}
      title={option.title ?? (typeof option.label === "string" ? option.label : optLabel)}
      onClick={() => onClickOption(option, columnIndex)}
      onMouseEnter={() => onMouseEnterOption(option, columnIndex)}
      className={cn(
        "relative flex h-auto w-full cursor-pointer items-center justify-between gap-1.5 rounded-md px-2.5 py-1.5 text-left text-xs font-normal shadow-none select-none transition-colors outline-hidden",
        "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
        isActive && "bg-accent/80 text-accent-foreground font-medium",
        option.disabled && "pointer-events-none opacity-50",
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        {option.icon && <span className="size-3.5 shrink-0">{option.icon}</span>}
        <span className="truncate">{option.label ?? optLabel}</span>
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
    </Button>
  );
});

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
  placeholder: propPlaceholder,
  searchPlaceholder: propSearchPlaceholder,
  emptyText: propEmptyText,
  allowClear = true,
  clearable = true,
  separator = " / ",
  displayRender,
  disabled = false,
  readOnly = false,
  onBlur,
  className,
  popupClassName,
  id,
  size = "default",
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: CascaderProps) {
  const t = useTranslations("form");
  const placeholder = propPlaceholder ?? t("cascader_placeholder");
  const searchPlaceholder = propSearchPlaceholder ?? t("cascader_search_placeholder");
  const emptyText = propEmptyText ?? t("cascader_empty");

  const autoId = useId();
  const triggerId = id || `cascader-${autoId}`;
  const contentId = `cascader-content-${autoId}`;

  const fieldNames: Required<CascaderFieldNames> = useMemo(
    () => ({
      ...DEFAULT_CASCADER_FIELD_NAMES,
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
  const [activePath, setActivePath] = useState<CascaderOption[]>(() =>
    resolveCascaderOptionsByValue(options, currentValue, fieldNames),
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
    if (nextOpen && (disabled || readOnly)) return;
    setOpen(nextOpen);
    if (nextOpen) {
      setActivePath(resolveCascaderOptionsByValue(options, currentValue, fieldNames));
      setSearchQuery("");
    } else {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      onBlur?.();
    }
  });

  const selectedOptions = useMemo(
    () => resolveCascaderOptionsByValue(options, currentValue, fieldNames),
    [options, currentValue, fieldNames],
  );

  const columns = useMemo(() => {
    const cols: CascaderOption[][] = [options];
    for (let i = 0; i < activePath.length; i++) {
      const item = activePath[i];
      const children = item ? getCascaderOptionChildren(item, fieldNames) : undefined;
      if (children && children.length > 0) {
        cols.push(children);
      } else {
        break;
      }
    }
    return cols;
  }, [options, activePath, fieldNames]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return collectCascaderSearchPaths(options, [], searchQuery, changeOnSelect, fieldNames);
  }, [options, searchQuery, changeOnSelect, fieldNames]);

  const handleClear = useMemoizedFn((e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (disabled || readOnly) return;
    if (!isControlled) {
      setUncontrolledValue([]);
    }
    setActivePath([]);
    onChange?.([], []);
  });

  const handleSelectPath = useMemoizedFn((path: CascaderOption[], shouldClose: boolean) => {
    const newValues = path.map((item) => getCascaderOptionValue(item, fieldNames));
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

      const optValue = String(getCascaderOptionValue(option, fieldNames));
      const newPath = [...activePath.slice(0, columnIndex), option];
      setActivePath(newPath);

      const children = getCascaderOptionChildren(option, fieldNames);
      const hasChildren = Boolean(children && children.length > 0);
      const canLoadAsync = !hasChildren && option.isLeaf === false && typeof loadData === "function";
      const isLeafNode = option.isLeaf === true || (!hasChildren && !canLoadAsync);

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

      if (changeOnSelect) {
        if (!isHover) {
          handleSelectPath(newPath, isLeafNode);
        }
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

  const displayText = useMemo(() => {
    if (selectedOptions.length === 0) return null;
    const labels = selectedOptions.map((o) => getCascaderOptionLabel(o, fieldNames));
    if (displayRender) {
      return displayRender(labels, selectedOptions);
    }
    return labels.join(separator);
  }, [selectedOptions, displayRender, separator, fieldNames]);

  const canClear = Boolean(isClearable && currentValue.length > 0 && !disabled && !readOnly);

  const handleTriggerKeyDown = useMemoizedFn((e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || readOnly) return;
    if ((e.key === "Backspace" || e.key === "Delete") && canClear) {
      e.preventDefault();
      handleClear();
    }
  });

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className="relative flex w-full items-center">
        <PopoverTrigger asChild>
          <Button
            id={triggerId}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls={contentId}
            aria-readonly={readOnly || undefined}
            aria-label={ariaLabel || placeholder}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            disabled={disabled}
            onKeyDown={handleTriggerKeyDown}
            onBlur={() => !open && onBlur?.()}
            className={cn(
              "w-full justify-between text-left font-normal select-none transition-colors",
              SIZE_CLASSES[size],
              canClear && "pr-8",
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
              className={cn("ml-2 size-4 shrink-0 opacity-50 transition-transform duration-200", open && "rotate-180")}
            />
          </Button>
        </PopoverTrigger>

        {canClear && (
          <FieldClearButton
            onClick={handleClear}
            ariaLabel={t("cascader_clear")}
            className="hover:bg-muted absolute right-7 z-10"
          />
        )}
      </div>

      <PopoverContent
        id={contentId}
        align="start"
        sideOffset={4}
        className={cn("ring-border/50 z-50 w-auto min-w-[200px] p-0 shadow-lg ring-1", popupClassName)}
      >
        {showSearch && (
          <div className="border-border border-b p-2">
            <div className="relative flex items-center">
              <Search className="text-muted-foreground pointer-events-none absolute left-2.5 size-3.5" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="bg-muted/50 h-8 w-full pr-7 pl-8 text-xs shadow-none"
              />
              {searchQuery && (
                <FieldClearButton
                  onClick={() => setSearchQuery("")}
                  ariaLabel={t("cascader_clear_search")}
                  className="absolute right-1.5"
                />
              )}
            </div>
          </div>
        )}

        {searchQuery.trim() ? (
          <div className="no-scrollbar max-h-64 min-w-[280px] overflow-y-auto p-1 text-sm">
            {searchResults.length === 0 ? (
              <div className="text-muted-foreground flex h-24 items-center justify-center text-xs">{emptyText}</div>
            ) : (
              searchResults.map((item, idx) => {
                const isSelected =
                  item.values.length === currentValue.length &&
                  item.values.every((v, i) => String(v) === String(currentValue[i]));

                return (
                  <Button
                    key={item.values.join("-") || idx}
                    type="button"
                    variant="ghost"
                    size="xs"
                    disabled={item.disabled}
                    onClick={() => handleSelectPath(item.path, true)}
                    className={cn(
                      "flex h-auto w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-normal shadow-none transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent/70 text-accent-foreground font-medium",
                      item.disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    <span className="truncate">
                      <HighlightedText text={item.labels.join(separator)} keyword={searchQuery} variant="inline" />
                    </span>
                    {isSelected && <Check className="text-primary size-3.5 shrink-0" />}
                  </Button>
                );
              })
            )}
          </div>
        ) : (
          <div className="divide-border flex divide-x">
            {columns.map((columnOptions, colIndex) => {
              const activeOptionInCol = activePath[colIndex];

              return (
                <div
                  key={colIndex}
                  role="menu"
                  className="no-scrollbar h-64 max-w-[200px] min-w-[130px] overflow-y-auto p-1 text-sm"
                >
                  {columnOptions.length === 0 ? (
                    <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                      {emptyText}
                    </div>
                  ) : (
                    columnOptions.map((opt) => {
                      const optVal = getCascaderOptionValue(opt, fieldNames);
                      const optChildren = getCascaderOptionChildren(opt, fieldNames);

                      const isActive = Boolean(
                        activeOptionInCol &&
                        String(getCascaderOptionValue(activeOptionInCol, fieldNames)) === String(optVal),
                      );

                      const isSelectedInFinal =
                        currentValue.length > colIndex && String(currentValue[colIndex]) === String(optVal);

                      const isFinalLeaf = Boolean(
                        isSelectedInFinal &&
                        (opt.isLeaf === true ||
                          (!optChildren && opt.isLeaf !== false) ||
                          currentValue.length === colIndex + 1),
                      );

                      const isLoading = Boolean(opt.loading || loadingMap[String(optVal)]);
                      const hasSubMenu = Boolean((optChildren && optChildren.length > 0) || opt.isLeaf === false);

                      return (
                        <CascaderColumnOptionRow
                          key={String(optVal)}
                          option={opt}
                          columnIndex={colIndex}
                          fieldNames={fieldNames}
                          isActive={isActive}
                          isFinalLeaf={isFinalLeaf}
                          isLoading={isLoading}
                          hasSubMenu={hasSubMenu}
                          onClickOption={handleItemClick}
                          onMouseEnterOption={handleItemMouseEnter}
                        />
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
