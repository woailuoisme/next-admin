import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { memo, useMemo, type MouseEvent, type ReactElement, type ReactNode } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "cn";

import type { DataTableColDef, DataTableRenderExpandedRowParams, DataTableSortModel } from "../core/types";

import { JUSTIFY_ALIGN_CLASSES } from "../cells/base";
import { EMPTY_ARRAY, NOOP } from "../core/constants";
import { useOptionalDataTableContext } from "../core/DataTableContext";
import { toColumnCssVarKey } from "../core/utils";

export interface DataTableHeaderProps<TData = unknown> {
  visibleColumns?: DataTableColDef<TData>[];
  checkboxSelection?: boolean;
  hasExpandColumn?: boolean;
  renderExpandedRow?: (params: DataTableRenderExpandedRowParams<TData>) => ReactNode;
  isAllPageSelected?: boolean;
  isSomePageSelected?: boolean;
  onSelectAll?: (checked: boolean) => void;
  columnWidths?: Record<string, number>;
  pinnedLeftFields?: string[];
  pinnedRightFields?: string[];
  leftOffsets?: Record<string, number>;
  rightOffsets?: Record<string, number>;
  sortModel?: DataTableSortModel;
  onSortClick?: (field: string) => void;
  onResizeStart?: (field: string, initialWidth: number, e: MouseEvent) => void;
  onResizeStep?: (field: string, delta: number) => void;
}

function DataTableHeaderInner<TData = unknown>(props: DataTableHeaderProps<TData>) {
  const ctx = useOptionalDataTableContext<TData>();
  const t = useTranslations("table");

  const visibleColumns = props.visibleColumns ?? ctx?.visibleColumns ?? EMPTY_ARRAY;
  const checkboxSelection = props.checkboxSelection ?? ctx?.checkboxSelection ?? false;
  const renderExpandedRow = props.renderExpandedRow ?? ctx?.renderExpandedRow;
  const hasExpandColumn = props.hasExpandColumn ?? Boolean(renderExpandedRow);
  const isAllPageSelected = props.isAllPageSelected ?? false;
  const isSomePageSelected = props.isSomePageSelected ?? false;
  const onSelectAll = props.onSelectAll ?? NOOP;
  const columnWidths = props.columnWidths;
  const pinnedLeftFields = props.pinnedLeftFields ?? ctx?.pinnedLeftFields ?? EMPTY_ARRAY;
  const pinnedRightFields = props.pinnedRightFields ?? ctx?.pinnedRightFields ?? EMPTY_ARRAY;
  const pinnedLeftSet = useMemo(() => new Set(pinnedLeftFields), [pinnedLeftFields]);
  const pinnedRightSet = useMemo(() => new Set(pinnedRightFields), [pinnedRightFields]);
  const leftOffsets = props.leftOffsets;
  const rightOffsets = props.rightOffsets;
  const sortModel = props.sortModel ?? EMPTY_ARRAY;
  const sortDirectionByField = useMemo(() => new Map(sortModel.map((s) => [s.field, s.sort])), [sortModel]);
  const onSortClick = props.onSortClick ?? ctx?.handleSortClick ?? NOOP;
  const onResizeStart = props.onResizeStart ?? ctx?.handleResizeStart ?? NOOP;
  const onResizeStep = props.onResizeStep ?? ctx?.handleResizeStep ?? NOOP;

  return (
    <TableHeader className="bg-muted/60 sticky top-0 z-20 backdrop-blur-xs">
      <TableRow className="border-border/60 border-b hover:bg-transparent">
        {/* Checkbox Header */}
        {checkboxSelection && (
          <TableHead className="bg-muted sticky left-0 z-30 w-11 px-3 text-center">
            <Checkbox
              checked={isAllPageSelected ? true : isSomePageSelected ? "indeterminate" : false}
              onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
              aria-label={t("aria_select_all_page")}
            />
          </TableHead>
        )}

        {/* Expand Column Header */}
        {hasExpandColumn && (
          <TableHead
            style={{
              left: checkboxSelection ? "44px" : pinnedLeftFields.length > 0 ? "0px" : undefined,
            }}
            className={cn(
              "w-9 px-1 text-center select-none",
              (checkboxSelection || pinnedLeftFields.length > 0) &&
                "sticky z-25 border-r border-border/70 bg-muted shadow-pin-left",
            )}
            aria-label={t("aria_expand_row")}
          />
        )}

        {/* Dynamic Column Headers */}
        {visibleColumns.map((col, idx) => {
          const {
            field,
            headerName,
            sortable = true,
            resizable = true,
            align = "left",
            headerAlign = align,
            width,
            minWidth = 50,
            maxWidth,
            renderHeader,
            headerClassName,
          } = col;

          const currentWidth = columnWidths?.[field] ?? width;
          const isLeftPinned = pinnedLeftSet.has(field);
          const isRightPinned = pinnedRightSet.has(field);
          const sortDirection = sortDirectionByField.get(field);
          const varKey = toColumnCssVarKey(field);

          return (
            <TableHead
              key={col.id ?? `${field}_${idx}`}
              aria-sort={
                sortDirection === "asc"
                  ? "ascending"
                  : sortDirection === "desc"
                    ? "descending"
                    : sortable
                      ? "none"
                      : undefined
              }
              style={{
                width: `var(--col-w-${varKey}, ${currentWidth ? `${currentWidth}px` : "auto"})`,
                minWidth: `${minWidth}px`,
                maxWidth: maxWidth ? `${maxWidth}px` : undefined,
                left: isLeftPinned ? `var(--col-left-${varKey}, ${leftOffsets?.[field] ?? 0}px)` : undefined,
                right: isRightPinned ? `var(--col-right-${varKey}, ${rightOffsets?.[field] ?? 0}px)` : undefined,
              }}
              className={cn(
                "group/header relative text-xs font-semibold whitespace-nowrap text-foreground transition-colors select-none",
                isLeftPinned && "sticky z-25 border-r border-border/70 bg-muted shadow-pin-left",
                isRightPinned && "sticky z-25 border-l border-border/70 bg-muted shadow-pin-right",
                headerClassName,
              )}
            >
              <div
                role={sortable ? "button" : undefined}
                tabIndex={sortable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (sortable && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onSortClick(field);
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden",
                  JUSTIFY_ALIGN_CLASSES[headerAlign],
                  sortable && "cursor-pointer",
                )}
                onClick={() => sortable && onSortClick(field)}
              >
                {renderHeader ? renderHeader({ colDef: col, headerName }) : <span>{headerName}</span>}

                {/* Sort Indicator */}
                {sortable && (
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground group-hover/header:text-foreground transition-colors"
                  >
                    {sortDirection === "asc" ? (
                      <ArrowUp className="text-primary size-3" />
                    ) : sortDirection === "desc" ? (
                      <ArrowDown className="text-primary size-3" />
                    ) : (
                      <ArrowUpDown className="size-3 opacity-0 transition-opacity group-hover/header:opacity-60" />
                    )}
                  </span>
                )}
              </div>

              {/* Column Resizer Handle */}
              {resizable && (
                <div
                  role="separator"
                  // 键盘可达：聚焦后左右方向键步进 16px，Shift 加速到 64px
                  tabIndex={0}
                  aria-orientation="vertical"
                  aria-label={t("aria_resize_column", { name: headerName || field })}
                  aria-valuenow={currentWidth ?? 120}
                  aria-valuemin={minWidth}
                  aria-valuemax={maxWidth}
                  onKeyDown={(e) => {
                    const step = e.shiftKey ? 64 : 16;
                    if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      e.stopPropagation();
                      onResizeStep(field, -step);
                    } else if (e.key === "ArrowRight") {
                      e.preventDefault();
                      e.stopPropagation();
                      onResizeStep(field, step);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onResizeStart(field, currentWidth ?? 120, e);
                  }}
                  className="hover:bg-primary/50 focus-visible:bg-primary/50 absolute top-0 right-0 z-30 h-full w-2 cursor-col-resize opacity-0 transition-opacity group-hover/header:opacity-100 focus-visible:opacity-100 focus-visible:outline-hidden"
                >
                  <div className="bg-border group-hover/header:bg-primary mx-auto h-full w-0.5" />
                </div>
              )}
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}

export const DataTableHeader = memo(DataTableHeaderInner) as <TData = unknown>(
  props: DataTableHeaderProps<TData>,
) => ReactElement | null;
