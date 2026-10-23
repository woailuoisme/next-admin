import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { memo, type MouseEvent, type ReactElement, type ReactNode } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { DataTableColDef, DataTableRenderExpandedRowParams, DataTableSortModel } from "../core/types";

import { JUSTIFY_ALIGN_CLASSES } from "../cells/base";
import { EMPTY_ARRAY, EMPTY_RECORD, NOOP } from "../core/constants";
import { useOptionalDataTableContext } from "../core/DataTableContext";

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
  const columnWidths = props.columnWidths ?? ctx?.columnWidths ?? EMPTY_RECORD;
  const pinnedLeftFields = props.pinnedLeftFields ?? ctx?.pinnedLeftFields ?? EMPTY_ARRAY;
  const pinnedRightFields = props.pinnedRightFields ?? ctx?.pinnedRightFields ?? EMPTY_ARRAY;
  const leftOffsets = props.leftOffsets ?? ctx?.leftOffsets ?? EMPTY_RECORD;
  const rightOffsets = props.rightOffsets ?? ctx?.rightOffsets ?? EMPTY_RECORD;
  const sortModel = props.sortModel ?? EMPTY_ARRAY;
  const onSortClick = props.onSortClick ?? ctx?.handleSortClick ?? NOOP;
  const onResizeStart = props.onResizeStart ?? ctx?.handleResizeStart ?? NOOP;

  return (
    <TableHeader className="bg-muted/60 sticky top-0 z-20 backdrop-blur-xs">
      <TableRow className="border-border/60 border-b hover:bg-transparent">
        {/* Checkbox Header */}
        {checkboxSelection && (
          <TableHead className="bg-muted/90 sticky left-0 z-30 w-11 px-3 text-center">
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
                "sticky z-25 border-r border-border/70 bg-muted/95 shadow-pin-left",
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

          const currentWidth = columnWidths[field] ?? width;
          const isLeftPinned = pinnedLeftFields.includes(field);
          const isRightPinned = pinnedRightFields.includes(field);
          const sortItem = sortModel.find((s: { field: string }) => s.field === field);

          return (
            <TableHead
              key={col.id ?? `${field}_${idx}`}
              aria-sort={
                sortItem?.sort === "asc"
                  ? "ascending"
                  : sortItem?.sort === "desc"
                    ? "descending"
                    : sortable
                      ? "none"
                      : undefined
              }
              style={{
                width: currentWidth ? `${currentWidth}px` : undefined,
                minWidth: `${minWidth}px`,
                maxWidth: maxWidth ? `${maxWidth}px` : undefined,
                left: isLeftPinned ? `${leftOffsets[field]}px` : undefined,
                right: isRightPinned ? `${rightOffsets[field]}px` : undefined,
              }}
              className={cn(
                "group/header relative text-xs font-semibold whitespace-nowrap text-foreground transition-colors select-none",
                isLeftPinned && "sticky z-25 border-r border-border/70 bg-muted/95 shadow-pin-left",
                isRightPinned && "sticky z-25 border-l border-border/70 bg-muted/95 shadow-pin-right",
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
                  <span className="text-muted-foreground group-hover/header:text-foreground transition-colors">
                    {sortItem?.sort === "asc" ? (
                      <ArrowUp className="text-primary size-3" />
                    ) : sortItem?.sort === "desc" ? (
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
                  aria-orientation="vertical"
                  aria-label={t("aria_resize_column", { name: headerName ?? field })}
                  onMouseDown={(e) => onResizeStart(field, currentWidth ?? 120, e)}
                  className="hover:bg-primary/50 absolute top-0 right-0 z-30 h-full w-2 cursor-col-resize opacity-0 transition-opacity group-hover/header:opacity-100"
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
