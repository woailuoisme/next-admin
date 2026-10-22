import { ArrowUpDown, FilterX, Loader2, RotateCcw } from "lucide-react";
import { type CSSProperties, isValidElement, memo, type ReactElement, type ReactNode, useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { DataTableColDef, DataTableSlots } from "../core/types";
import type { TableEmptyStateConfig, TableEmptyStateContext, TableEmptyStateProps } from "../empty-state";

import { EMPTY_ARRAY, EMPTY_RECORD } from "../core/constants";
import { TableEmptyState } from "../empty-state";

export interface DataTableSkeletonRowsProps<TData = any> {
  count: number;
  visibleColumns: DataTableColDef<TData>[];
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
  visibleColumns,
  checkboxSelection = false,
  hasExpandColumn = false,
  pinnedLeftFields = EMPTY_ARRAY,
  pinnedRightFields = EMPTY_ARRAY,
  leftOffsets = EMPTY_RECORD,
  rightOffsets = EMPTY_RECORD,
  columnWidths = EMPTY_RECORD,
  densityRowClass,
}: DataTableSkeletonRowsProps<TData>) {
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
              <TableCell
                className={cn(
                  "w-12 px-3 py-2 text-center",
                  pinnedLeftFields.includes("__checkbox__") && "sticky left-0 z-10 bg-card",
                )}
              >
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
                    "sticky z-10 border-r border-border/80 bg-card shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]",
                )}
              >
                <Skeleton className="mx-auto size-3.5 rounded-xs" />
              </TableCell>
            )}

            {visibleColumns.map((col, colIndex) => {
              const isPinnedLeft = pinnedLeftFields.includes(col.field);
              const isPinnedRight = pinnedRightFields.includes(col.field);
              const isLastPinnedLeft =
                pinnedLeftFields.length > 0 && pinnedLeftFields[pinnedLeftFields.length - 1] === col.field;
              const isFirstPinnedRight = pinnedRightFields.length > 0 && pinnedRightFields[0] === col.field;

              const actualWidth = columnWidths[col.field] ?? col.width;
              const style: CSSProperties = {
                width: actualWidth ? `${actualWidth}px` : undefined,
                minWidth: col.minWidth ? `${col.minWidth}px` : undefined,
                maxWidth: col.maxWidth ? `${col.maxWidth}px` : undefined,
                ...(isPinnedLeft ? { left: `${leftOffsets[col.field] ?? 0}px` } : {}),
                ...(isPinnedRight ? { right: `${rightOffsets[col.field] ?? 0}px` } : {}),
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
                    isLastPinnedLeft && "border-r border-border/80 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]",
                    isFirstPinnedRight &&
                      "border-l border-border/80 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.05)]",
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

export interface DataTableBackdropLoaderProps {
  slots?: DataTableSlots;
  loadingText?: string;
}

export const DataTableBackdropLoader = memo(function DataTableBackdropLoader({
  slots,
  loadingText = "Loading records...",
}: DataTableBackdropLoaderProps) {
  if (slots?.loadingOverlay) {
    return <slots.loadingOverlay />;
  }

  return (
    <div
      className="bg-background/55 absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-[1.5px] transition-all duration-200"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="border-border/60 bg-card/95 text-foreground flex items-center gap-3 rounded-xl border px-5 py-3 text-sm font-medium shadow-lg backdrop-blur-md">
        <Loader2 className="text-primary size-5 animate-spin" />
        <span>{loadingText}</span>
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
  loadingText = "Loading records...",
}: DataTableLoadingOverlayProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-64 text-center">
        {slots?.loadingOverlay ? (
          <slots.loadingOverlay />
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-3">
            <Loader2 className="text-primary size-8 animate-spin" />
            <span className="text-xs font-medium tracking-wide">{loadingText}</span>
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
  emptyMessage = "No records found.",
  noResultsMessage = "No matching records found.",
  resetFiltersText = "Reset filters",
  isFiltered = false,
  onResetFilters,
  slots,
  emptyState,
}: DataTableEmptyOverlayProps) {
  // 1. Slots have highest priority for backward compatibility
  if (isFiltered && slots?.noResultsOverlay) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="h-64 text-center">
          <slots.noResultsOverlay />
        </TableCell>
      </TableRow>
    );
  }

  if (!isFiltered && slots?.noRowsOverlay) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="h-64 text-center">
          <slots.noRowsOverlay />
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
    resetFiltersText,
  };

  // 过滤态下的默认「重置筛选」动作，供自定义与默认空状态共用
  const resetActions: TableEmptyStateProps["actions"] =
    isFiltered && onResetFilters
      ? [
          {
            label: resetFiltersText,
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
    const baseConfig = (emptyState as TableEmptyStateConfig | undefined) ?? {};
    const config = isFiltered && baseConfig.filtered ? { ...baseConfig, ...baseConfig.filtered } : baseConfig;

    content = (
      <TableEmptyState
        icon={config.icon ?? (isFiltered ? FilterX : ArrowUpDown)}
        iconColor={config.iconColor ?? (isFiltered ? "warning" : "muted")}
        heading={config.heading ?? (isFiltered ? noResultsMessage : emptyMessage)}
        description={
          config.description ??
          (isFiltered
            ? "No records match your active filters or search criteria."
            : "There is no data available to display right now.")
        }
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
