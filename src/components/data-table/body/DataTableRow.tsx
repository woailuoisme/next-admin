import { ChevronRight } from "lucide-react";
import {
  Fragment,
  memo,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type {
  DataTableColDef,
  DataTableRenderExpandedRowParams,
  DataTableRowId,
} from "../core/types";

import { TEXT_ALIGN_CLASSES } from "../cells/base";
import { EMPTY_ARRAY, EMPTY_RECORD, NOOP } from "../core/constants";
import { useOptionalDataTableContext } from "../core/data-table-context";
import { readCellValue } from "../core/utils";

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
  onRowClick?: (row: TData, event: MouseEvent) => void;

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

  const visibleColumns = propVisibleColumns ?? ctx?.visibleColumns ?? EMPTY_ARRAY;
  const checkboxSelection = propCheckboxSelection ?? ctx?.checkboxSelection ?? false;
  const isRowSelectable = propIsRowSelectable ?? ctx?.isRowSelectable;
  const pinnedLeftFields = propPinnedLeftFields ?? ctx?.pinnedLeftFields ?? EMPTY_ARRAY;
  const pinnedRightFields = propPinnedRightFields ?? ctx?.pinnedRightFields ?? EMPTY_ARRAY;
  const leftOffsets = propLeftOffsets ?? ctx?.leftOffsets ?? EMPTY_RECORD;
  const rightOffsets = propRightOffsets ?? ctx?.rightOffsets ?? EMPTY_RECORD;
  const columnWidths = propColumnWidths ?? ctx?.columnWidths ?? EMPTY_RECORD;
  const densityRowClass = propDensityRowClass ?? ctx?.densityRowClass ?? "h-11 py-2 px-3 text-xs";
  const onSelectRow = propOnSelectRow ?? ctx?.onSelectRow ?? NOOP;
  const onRowClick = propOnRowClick ?? ctx?.onRowClick;

  const renderExpandedRow = propRenderExpandedRow ?? ctx?.renderExpandedRow;
  const isExpanded =
    propIsExpanded ?? (ctx?.expandedRowIds ? ctx.expandedRowIds.includes(rowId) : false);
  const isRowExpandable = propIsRowExpandable ?? ctx?.isRowExpandable;
  const expandOnRowClick = propExpandOnRowClick ?? ctx?.expandOnRowClick ?? false;
  const onToggleExpand = propOnToggleExpand ?? ctx?.toggleRowExpanded;

  const canExpand = Boolean(renderExpandedRow && (isRowExpandable ? isRowExpandable(row) : true));
  const totalColSpan =
    visibleColumns.length + (checkboxSelection ? 1 : 0) + (renderExpandedRow ? 1 : 0);

  const handleRowClick = (e: MouseEvent) => {
    if (expandOnRowClick && canExpand) {
      onToggleExpand?.(rowId);
    }
    onRowClick?.(row, e);
  };

  return (
    <Fragment>
      <TableRow
        ref={ref}
        data-state={isSelected ? "selected" : undefined}
        aria-selected={isSelected}
        onClick={handleRowClick}
        style={style}
        className={cn(
          "transition-colors hover:bg-muted/30",
          isSelected && "bg-primary/5 hover:bg-primary/10",
          (onRowClick || (expandOnRowClick && canExpand)) && "cursor-pointer",
          className,
        )}
        {...rest}
      >
        {checkboxSelection && (
          <TableCell className="bg-card/95 sticky left-0 z-15 w-11 px-3 text-center">
            <Checkbox
              checked={isSelected}
              disabled={isRowSelectable && !isRowSelectable(row)}
              onCheckedChange={(checked) => onSelectRow(rowId, Boolean(checked), row)}
              aria-label={`Select row ${rowId}`}
            />
          </TableCell>
        )}

        {renderExpandedRow && (
          <TableCell
            style={{
              left:
                checkboxSelection || pinnedLeftFields.length > 0
                  ? checkboxSelection
                    ? "44px"
                    : "0px"
                  : undefined,
            }}
            className={cn(
              "w-9 px-1 text-center align-middle",
              (checkboxSelection || pinnedLeftFields.length > 0) &&
                "sticky z-15 border-r border-border/70 bg-card/95 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]",
            )}
          >
            {canExpand ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand?.(rowId);
                }}
                className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring inline-flex size-6 cursor-pointer items-center justify-center rounded-xs transition-colors focus-visible:ring-1 focus-visible:outline-hidden"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "收起行明细" : "展开行明细"}
              >
                <ChevronRight
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    isExpanded && "rotate-90 text-primary",
                  )}
                />
              </button>
            ) : (
              <span className="inline-block size-6" />
            )}
          </TableCell>
        )}

        {visibleColumns.map((col, idx) => {
          const {
            field,
            align = "left",
            width,
            minWidth,
            maxWidth,
            cellClassName,
            renderCell,
            valueFormatter,
          } = col;

          const currentWidth = columnWidths[field] ?? width;
          const isLeftPinned = pinnedLeftFields.includes(field);
          const isRightPinned = pinnedRightFields.includes(field);

          const rawValue = readCellValue(row, col);
          const formattedValue = valueFormatter ? valueFormatter(rawValue, row) : rawValue;

          return (
            <TableCell
              key={col.id ?? `${field}_${idx}`}
              style={{
                width: currentWidth ? `${currentWidth}px` : undefined,
                minWidth: minWidth ? `${minWidth}px` : undefined,
                maxWidth: maxWidth ? `${maxWidth}px` : undefined,
                left: isLeftPinned ? `${leftOffsets[field]}px` : undefined,
                right: isRightPinned ? `${rightOffsets[field]}px` : undefined,
              }}
              className={cn(
                densityRowClass,
                isLeftPinned &&
                  "sticky z-15 border-r border-border/70 bg-card/95 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]",
                isRightPinned &&
                  "sticky z-15 border-l border-border/70 bg-card/95 shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)]",
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
                <span>
                  {formattedValue !== null && formattedValue !== undefined
                    ? String(formattedValue)
                    : ""}
                </span>
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
                collapse: () => onToggleExpand?.(rowId),
              })}
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}

export const DataTableRow = memo(DataTableRowComponent) as (<
  TData extends Record<string, any> = Record<string, any>,
>(
  props: DataTableRowProps<TData>,
) => ReactNode) & { displayName?: string };
DataTableRow.displayName = "DataTableRow";
