import { useMemoizedFn } from "ahooks";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { memo, useMemo, type HTMLAttributes, type MouseEvent, type ReactNode, type Ref } from "react";
import { handleActivationKey, ROW_ACTIVATION_IGNORE_SELECTOR } from "@/components/shared/activationKey";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "cn";

import type {
  DataTableColDef,
  DataTableRenderExpandedRowParams,
  DataTableRowId,
  RowActivationEvent,
} from "../core/types";

import { TEXT_ALIGN_CLASSES } from "../cells/base";
import { EMPTY_ARRAY, NOOP } from "../core/constants";
import { useOptionalDataTableContext } from "../core/DataTableContext";
import { readCellValue, toColumnCssVarKey } from "../core/utils";

export interface DataTableRowProps<
  TData extends Record<string, any> = Record<string, any>,
> extends HTMLAttributes<HTMLTableRowElement> {
  ref?: Ref<HTMLTableRowElement>;
  row: TData;
  index: number;
  rowId: DataTableRowId;
  isSelected: boolean;
  isRowSelectable?: (row: TData) => boolean;
  checkboxSelection?: boolean;
  visibleColumns?: DataTableColDef<TData>[];
  pinnedLeftFields?: string[];
  pinnedRightFields?: string[];
  leftOffsets?: Record<string, number>;
  rightOffsets?: Record<string, number>;
  columnWidths?: Record<string, number>;
  densityRowClass?: string;
  onSelectRow?: (id: DataTableRowId, checked: boolean, row: TData) => void;
  onRowClick?: (row: TData, event: RowActivationEvent) => void;

  // Row Expansion
  renderExpandedRow?: (params: DataTableRenderExpandedRowParams<TData>) => ReactNode;
  isExpanded?: boolean;
  isRowExpandable?: (row: TData) => boolean;
  expandOnRowClick?: boolean;
  onToggleExpand?: (id: DataTableRowId) => void;
}

function DataTableRowComponent<TData extends Record<string, any> = Record<string, any>>({
  ref,
  row,
  index,
  rowId,
  isSelected,
  isRowSelectable: propIsRowSelectable,
  checkboxSelection: propCheckboxSelection,
  visibleColumns: propVisibleColumns,
  pinnedLeftFields: propPinnedLeftFields,
  pinnedRightFields: propPinnedRightFields,
  leftOffsets: propLeftOffsets,
  rightOffsets: propRightOffsets,
  columnWidths: propColumnWidths,
  densityRowClass: propDensityRowClass,
  onSelectRow: propOnSelectRow,
  onRowClick: propOnRowClick,
  renderExpandedRow: propRenderExpandedRow,
  isExpanded: propIsExpanded,
  isRowExpandable: propIsRowExpandable,
  expandOnRowClick: propExpandOnRowClick,
  onToggleExpand: propOnToggleExpand,
  style,
  className,
  ...rest
}: DataTableRowProps<TData>) {
  const ctx = useOptionalDataTableContext<TData>();
  const t = useTranslations("table");

  const visibleColumns = propVisibleColumns ?? ctx?.visibleColumns ?? EMPTY_ARRAY;
  const checkboxSelection = propCheckboxSelection ?? ctx?.checkboxSelection ?? false;
  const isRowSelectable = propIsRowSelectable ?? ctx?.isRowSelectable;
  const pinnedLeftFields = propPinnedLeftFields ?? ctx?.pinnedLeftFields ?? EMPTY_ARRAY;
  const pinnedRightFields = propPinnedRightFields ?? ctx?.pinnedRightFields ?? EMPTY_ARRAY;
  const pinnedLeftSet = useMemo(() => new Set(pinnedLeftFields), [pinnedLeftFields]);
  const pinnedRightSet = useMemo(() => new Set(pinnedRightFields), [pinnedRightFields]);
  const leftOffsets = propLeftOffsets;
  const rightOffsets = propRightOffsets;
  const columnWidths = propColumnWidths;
  const densityRowClass = propDensityRowClass ?? ctx?.densityRowClass ?? "h-11 py-2 px-3 text-xs";
  const onSelectRow = propOnSelectRow ?? ctx?.onSelectRow ?? NOOP;
  const onRowClick = propOnRowClick ?? ctx?.onRowClick;

  const renderExpandedRow = propRenderExpandedRow ?? ctx?.renderExpandedRow;
  const isExpanded = propIsExpanded ?? false;
  const isRowExpandable = propIsRowExpandable ?? ctx?.isRowExpandable;
  const expandOnRowClick = propExpandOnRowClick ?? ctx?.expandOnRowClick ?? false;
  const onToggleExpand = propOnToggleExpand ?? ctx?.toggleRowExpanded;

  const canExpand = Boolean(renderExpandedRow && (isRowExpandable ? isRowExpandable(row) : true));
  const totalColSpan = visibleColumns.length + (checkboxSelection ? 1 : 0) + (renderExpandedRow ? 1 : 0);

  const { onKeyDown: propOnKeyDown, tabIndex: propTabIndex, ...divRest } = rest;
  const isRowInteractive = Boolean(onRowClick || (expandOnRowClick && canExpand));

  const handleRowClick = (e: MouseEvent<HTMLTableRowElement>) => {
    // 与键盘路径共用忽略规则：单元格内按钮/链接自行处理，避免与行跳转叠加
    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest(ROW_ACTIVATION_IGNORE_SELECTOR)) {
      return;
    }
    if (expandOnRowClick && canExpand) {
      onToggleExpand?.(rowId);
    }
    onRowClick?.(row, e);
  };

  const handleRowKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    propOnKeyDown?.(e);
    if (e.defaultPrevented || !isRowInteractive) return;
    handleActivationKey(
      e,
      () => {
        if (expandOnRowClick && canExpand) {
          onToggleExpand?.(rowId);
        }
        onRowClick?.(row, e);
      },
      ROW_ACTIVATION_IGNORE_SELECTOR,
    );
  };

  const handleCollapse = useMemoizedFn(() => {
    onToggleExpand?.(rowId);
  });

  return (
    <>
      <TableRow
        ref={ref}
        data-state={isSelected ? "selected" : undefined}
        aria-selected={isSelected}
        tabIndex={propTabIndex ?? (isRowInteractive ? 0 : undefined)}
        onKeyDown={isRowInteractive || propOnKeyDown ? handleRowKeyDown : undefined}
        onClick={handleRowClick}
        style={style}
        className={cn(
          "transition-colors hover:bg-muted/30 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
          isSelected && "bg-primary/5 hover:bg-primary/10",
          isRowInteractive && "cursor-pointer",
          className,
        )}
        {...divRest}
      >
        {checkboxSelection && (
          <TableCell onClick={(e) => e.stopPropagation()} className="bg-card sticky left-0 z-15 w-11 px-3 text-center">
            <Checkbox
              checked={isSelected}
              disabled={isRowSelectable && !isRowSelectable(row)}
              onCheckedChange={(checked) => onSelectRow(rowId, Boolean(checked), row)}
              aria-label={t("aria_select_row", { id: String(rowId) })}
            />
          </TableCell>
        )}

        {renderExpandedRow && (
          <TableCell
            style={{
              left: checkboxSelection ? "44px" : pinnedLeftFields.length > 0 ? "0px" : undefined,
            }}
            className={cn(
              "w-9 px-1 text-center align-middle",
              (checkboxSelection || pinnedLeftFields.length > 0) &&
                "sticky z-15 border-r border-border/70 bg-card shadow-pin-left",
            )}
          >
            {canExpand ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand?.(rowId);
                }}
                className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 cursor-pointer rounded-xs transition-colors"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? t("aria_collapse_detail") : t("aria_expand_detail")}
              >
                <ChevronRight
                  aria-hidden="true"
                  className={cn("size-3.5 transition-transform duration-200", isExpanded && "rotate-90 text-primary")}
                />
              </Button>
            ) : (
              <span className="inline-block size-6" />
            )}
          </TableCell>
        )}

        {visibleColumns.map((col, idx) => {
          const { field, align = "left", width, minWidth, maxWidth, cellClassName, renderCell, valueFormatter } = col;

          const currentWidth = columnWidths?.[field] ?? width;
          const isLeftPinned = pinnedLeftSet.has(field);
          const isRightPinned = pinnedRightSet.has(field);
          const varKey = toColumnCssVarKey(field);

          const rawValue = readCellValue(row, col);
          const formattedValue = valueFormatter ? valueFormatter(rawValue, row) : rawValue;

          return (
            <TableCell
              key={col.id ?? `${field}_${idx}`}
              style={{
                width: `var(--col-w-${varKey}, ${currentWidth ? `${currentWidth}px` : "auto"})`,
                minWidth: minWidth ? `${minWidth}px` : undefined,
                maxWidth: maxWidth ? `${maxWidth}px` : undefined,
                left: isLeftPinned ? `var(--col-left-${varKey}, ${leftOffsets?.[field] ?? 0}px)` : undefined,
                right: isRightPinned ? `var(--col-right-${varKey}, ${rightOffsets?.[field] ?? 0}px)` : undefined,
              }}
              className={cn(
                densityRowClass,
                isLeftPinned && "sticky z-15 border-r border-border/70 bg-card shadow-pin-left",
                isRightPinned && "sticky z-15 border-l border-border/70 bg-card shadow-pin-right",
                TEXT_ALIGN_CLASSES[align ?? "left"],
                typeof cellClassName === "function"
                  ? cellClassName({
                      value: rawValue,
                      row,
                      field,
                      colDef: col,
                      index,
                    })
                  : cellClassName,
              )}
            >
              {renderCell ? (
                renderCell({
                  value: rawValue,
                  row,
                  field,
                  colDef: col,
                  index,
                })
              ) : (
                <span>{formattedValue !== null && formattedValue !== undefined ? String(formattedValue) : ""}</span>
              )}
            </TableCell>
          );
        })}
      </TableRow>

      {renderExpandedRow && isExpanded && (
        <TableRow
          data-slot="data-table-expanded-row"
          className="border-border/60 bg-muted/20 hover:bg-muted/20 border-b transition-colors"
        >
          <TableCell colSpan={totalColSpan} className="p-0">
            <div className="animate-in border-primary/80 fade-in-50 border-l-2 px-4 py-3 duration-200">
              {renderExpandedRow({
                row,
                index,
                collapse: handleCollapse,
              })}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export const DataTableRow = memo(DataTableRowComponent) as (<TData extends Record<string, any> = Record<string, any>>(
  props: DataTableRowProps<TData>,
) => ReactNode) & { displayName?: string };
DataTableRow.displayName = "DataTableRow";
