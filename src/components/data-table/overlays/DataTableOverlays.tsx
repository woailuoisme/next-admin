import { useTranslations } from "next-intl";
import { ArrowUpDown, FilterX, Loader2, RotateCcw } from "lucide-react";
import { type CSSProperties, isValidElement, memo, type ReactElement, type ReactNode, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "cn";

import type { DataTableColDef, DataTableSlots } from "../core/types";
import type { TableEmptyStateConfig, TableEmptyStateContext, TableEmptyStateProps } from "../empty-state";

import { EMPTY_ARRAY } from "../core/constants";
import { useOptionalDataTableContext } from "../core/DataTableContext";
import { toColumnCssVarKey } from "../core/utils";
import { TableEmptyState } from "../empty-state";

export interface DataTableSkeletonRowsProps<TData = any> {
  count: number;
  visibleColumns?: DataTableColDef<TData>[];
  checkboxSelection?: boolean;
  hasExpandColumn?: boolean;
  pinnedLeftFields?: string[];
  pinnedRightFields?: string[];
  leftOffsets?: Record<string, number>;
  rightOffsets?: Record<string, number>;
  columnWidths?: Record<string, number>;
  densityRowClass?: string;
}

const WIDTH_CLASSES = ["w-4/5", "w-2/3", "w-1/2", "w-3/5", "w-3/4"];

export const DataTableSkeletonRows = memo(function DataTableSkeletonRows<TData = any>({
  count,
  visibleColumns: propVisibleColumns,
  checkboxSelection: propCheckboxSelection,
  hasExpandColumn: propHasExpandColumn,
  pinnedLeftFields: propPinnedLeftFields,
  pinnedRightFields: propPinnedRightFields,
  leftOffsets,
  rightOffsets,
  columnWidths,
  densityRowClass: propDensityRowClass,
}: DataTableSkeletonRowsProps<TData>) {
  const ctx = useOptionalDataTableContext<TData>();
  const visibleColumns = propVisibleColumns ?? ctx?.visibleColumns ?? EMPTY_ARRAY;
  const checkboxSelection = propCheckboxSelection ?? ctx?.checkboxSelection ?? false;
  const hasExpandColumn = propHasExpandColumn ?? Boolean(ctx?.renderExpandedRow);
  const pinnedLeftFields = propPinnedLeftFields ?? ctx?.pinnedLeftFields ?? EMPTY_ARRAY;
  const pinnedRightFields = propPinnedRightFields ?? ctx?.pinnedRightFields ?? EMPTY_ARRAY;
  const densityRowClass = propDensityRowClass ?? ctx?.densityRowClass;

  const pinnedLeftSet = useMemo(() => new Set(pinnedLeftFields), [pinnedLeftFields]);
  const pinnedRightSet = useMemo(() => new Set(pinnedRightFields), [pinnedRightFields]);
  const lastPinnedLeftField = pinnedLeftFields[pinnedLeftFields.length - 1];
  const firstPinnedRightField = pinnedRightFields[0];

  const rows = useMemo(() => {
    return Array.from({ length: Math.max(1, count) });
  }, [count]);

  return (
    <>
      {rows.map((_, rowIndex) => {
        const rowKey = `skeleton-row-${rowIndex}`;
        return (
          <TableRow key={rowKey} className={cn("hover:bg-transparent", densityRowClass)} aria-hidden="true">
            {checkboxSelection && (
              <TableCell className="bg-card sticky left-0 z-15 w-11 px-3 py-2 text-center">
                <Skeleton className="mx-auto size-4 rounded-xs" />
              </TableCell>
            )}

            {hasExpandColumn && (
              <TableCell
                style={{
                  left: checkboxSelection ? "44px" : pinnedLeftFields.length > 0 ? "0px" : undefined,
                }}
                className={cn(
                  "w-9 px-1 text-center",
                  (checkboxSelection || pinnedLeftFields.length > 0) &&
                    "sticky z-10 border-r border-border/80 bg-card shadow-pin-left",
                )}
              >
                <Skeleton className="mx-auto size-3.5 rounded-xs" />
              </TableCell>
            )}

            {visibleColumns.map((col, colIndex) => {
              const isPinnedLeft = pinnedLeftSet.has(col.field);
              const isPinnedRight = pinnedRightSet.has(col.field);
              const isLastPinnedLeft = lastPinnedLeftField === col.field;
              const isFirstPinnedRight = firstPinnedRightField === col.field;
              const varKey = toColumnCssVarKey(col.field);

              const actualWidth = columnWidths?.[col.field] ?? col.width;
              const style: CSSProperties = {
                width: `var(--col-w-${varKey}, ${actualWidth ? `${actualWidth}px` : "auto"})`,
                minWidth: col.minWidth ? `${col.minWidth}px` : undefined,
                maxWidth: col.maxWidth ? `${col.maxWidth}px` : undefined,
                ...(isPinnedLeft ? { left: `var(--col-left-${varKey}, ${leftOffsets?.[col.field] ?? 0}px)` } : {}),
                ...(isPinnedRight ? { right: `var(--col-right-${varKey}, ${rightOffsets?.[col.field] ?? 0}px)` } : {}),
              };

              const cellKey = `skeleton-cell-${rowIndex}-${col.field}`;
              const widthClass = WIDTH_CLASSES[(rowIndex + colIndex) % WIDTH_CLASSES.length];

              return (
                <TableCell
                  key={cellKey}
                  style={style}
                  className={cn(
                    "px-4 py-2",
                    isPinnedLeft && "sticky z-10 bg-card",
                    isPinnedRight && "sticky z-10 bg-card",
                    isLastPinnedLeft && "border-r border-border/80 shadow-pin-left",
                    isFirstPinnedRight && "border-l border-border/80 shadow-pin-right",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                  )}
                >
                  <Skeleton
                    className={cn(
                      "h-4 rounded-md",
                      widthClass,
                      col.align === "right" && "ml-auto",
                      col.align === "center" && "mx-auto",
                    )}
                  />
                </TableCell>
              );
            })}
          </TableRow>
        );
      })}
    </>
  );
}) as <TData = any>(props: DataTableSkeletonRowsProps<TData>) => ReactElement | null;

function useResolvedLoadingText(loadingText?: string) {
  const ctx = useOptionalDataTableContext();
  const t = useTranslations("table");
  return loadingText ?? ctx?.loadingText ?? t("loading_text");
}

export interface DataTableBackdropLoaderProps {
  slots?: DataTableSlots;
  loadingText?: string;
}

export const DataTableBackdropLoader = memo(function DataTableBackdropLoader({
  slots,
  loadingText,
}: DataTableBackdropLoaderProps) {
  const resolvedLoadingText = useResolvedLoadingText(loadingText);

  if (slots?.loadingOverlay) {
    return <slots.loadingOverlay />;
  }

  return (
    <div
      role="status"
      className="bg-background/55 absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-[1.5px] transition-all duration-200"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="border-border/60 bg-card/95 text-foreground flex items-center gap-3 rounded-xl border px-5 py-3 text-sm font-medium shadow-lg backdrop-blur-md">
        <Loader2 aria-hidden="true" className="text-primary size-5 animate-spin" />
        <span>{resolvedLoadingText}</span>
      </div>
    </div>
  );
});

export interface DataTableLoadingOverlayProps {
  colSpan: number;
  slots?: DataTableSlots;
  loadingText?: string;
}

export const DataTableLoadingOverlay = memo(function DataTableLoadingOverlay({
  colSpan,
  slots,
  loadingText,
}: DataTableLoadingOverlayProps) {
  const resolvedLoadingText = useResolvedLoadingText(loadingText);

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-64 text-center">
        {slots?.loadingOverlay ? (
          <slots.loadingOverlay />
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-3" role="status">
            <Loader2 aria-hidden="true" className="text-primary size-8 animate-spin" />
            <span className="text-xs font-medium tracking-wide">{resolvedLoadingText}</span>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
});

export interface DataTableEmptyOverlayProps {
  colSpan: number;
  emptyMessage?: string;
  noResultsMessage?: string;
  resetFiltersText?: string;
  isFiltered?: boolean;
  onResetFilters?: () => void;
  slots?: DataTableSlots;
  emptyState?: ReactNode | TableEmptyStateConfig | ((context: TableEmptyStateContext) => ReactNode);
}

export const DataTableEmptyOverlay = memo(function DataTableEmptyOverlay({
  colSpan,
  emptyMessage,
  noResultsMessage,
  resetFiltersText,
  isFiltered = false,
  onResetFilters,
  slots,
  emptyState,
}: DataTableEmptyOverlayProps) {
  const ctx = useOptionalDataTableContext();
  const t = useTranslations("table");

  const resolvedEmptyMessage = emptyMessage ?? ctx?.emptyMessage ?? t("empty_heading");
  const resolvedNoResultsMessage = noResultsMessage ?? ctx?.noResultsMessage ?? t("no_results_heading");
  const resolvedResetFiltersText = resetFiltersText ?? ctx?.resetFiltersText ?? t("reset_filters_action");
  const resolvedEmptyDescription = t("empty_description");
  const resolvedNoResultsDescription = t("no_results_description");

  // 1. Slots have highest priority for backward compatibility
  const SlotOverlay = isFiltered ? slots?.noResultsOverlay : slots?.noRowsOverlay;
  if (SlotOverlay) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="h-64 text-center">
          <SlotOverlay />
        </TableCell>
      </TableRow>
    );
  }

  // 2. 自定义 emptyState 或默认空状态：共用同一套配置回退与文案
  let content: ReactNode = null;
  const emptyStateContext: TableEmptyStateContext = {
    isFiltered,
    resetFilters: onResetFilters,
    onResetFilters,
    resetFiltersText: resolvedResetFiltersText,
  };

  // 过滤态下的默认「重置筛选」动作，供自定义与默认空状态共用
  const resetActions: TableEmptyStateProps["actions"] =
    isFiltered && onResetFilters
      ? [
          {
            label: resolvedResetFiltersText,
            icon: RotateCcw,
            onClick: onResetFilters,
            variant: "outline" as const,
          },
        ]
      : undefined;

  if (typeof emptyState === "function") {
    content = emptyState(emptyStateContext);
  } else if (isValidElement(emptyState)) {
    content = emptyState;
  } else {
    // 未传配置时等价于空配置，图标 / 文案 / 动作全部走下方默认值
    // 走到这里只剩 undefined / false / 配置对象；显式判对象，避免依赖布尔装箱
    const baseConfig: TableEmptyStateConfig =
      typeof emptyState === "object" && emptyState !== null ? (emptyState as TableEmptyStateConfig) : {};
    const config = isFiltered && baseConfig.filtered ? { ...baseConfig, ...baseConfig.filtered } : baseConfig;

    content = (
      <TableEmptyState
        icon={config.icon ?? (isFiltered ? FilterX : ArrowUpDown)}
        iconColor={config.iconColor ?? (isFiltered ? "warning" : "muted")}
        heading={config.heading ?? (isFiltered ? resolvedNoResultsMessage : resolvedEmptyMessage)}
        description={config.description ?? (isFiltered ? resolvedNoResultsDescription : resolvedEmptyDescription)}
        actions={config.actions ?? resetActions}
        renderActions={config.renderActions}
        size={config.size ?? "md"}
        className={config.className}
      />
    );
  }

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-64 text-center">
        {content}
      </TableCell>
    </TableRow>
  );
});
