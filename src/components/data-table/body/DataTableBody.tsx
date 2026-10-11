import type { Virtualizer } from "@tanstack/react-virtual";

import { memo, useMemo, type MouseEvent, type ReactElement, type ReactNode } from "react";

import { TableBody } from "@/components/ui/table";

import type {
  DataTableColDef,
  DataTableRenderExpandedRowParams,
  DataTableRowId,
  DataTableRowSelectionModel,
  DataTableSlots,
  TableEmptyStateConfig,
  TableEmptyStateContext,
} from "../core/types";

import { defaultGetRowId, EMPTY_ARRAY, EMPTY_RECORD, NOOP } from "../core/constants";
import { useOptionalDataTableContext } from "../core/data-table-context";
import {
  DataTableEmptyOverlay,
  DataTableLoadingOverlay,
  DataTableSkeletonRows,
} from "../overlays/DataTableOverlays";
import { DataTableRow } from "./DataTableRow";

export interface DataTableBodyProps<TData extends Record<string, any> = Record<string, any>> {
  loading?: boolean;
  virtualize?: boolean;
  pagedRows: TData[];
  visibleColumns?: DataTableColDef<TData>[];
  getRowId?: (row: TData) => DataTableRowId;
  selection: DataTableRowSelectionModel;
  checkboxSelection?: boolean;
  isRowSelectable?: (row: TData) => boolean;
  pinnedLeftFields?: string[];
  pinnedRightFields?: string[];
  leftOffsets?: Record<string, number>;
  rightOffsets?: Record<string, number>;
  columnWidths?: Record<string, number>;
  densityRowClass?: string;
  rowVirtualizer?: Virtualizer<HTMLDivElement, Element>;
  emptyMessage?: string;
  noResultsMessage?: string;
  resetFiltersText?: string;
  loadingText?: string;
  isFiltered?: boolean;
  onResetFilters?: () => void;
  skeletonRowCount?: number;
  slots?: DataTableSlots;
  emptyState?: ReactNode | TableEmptyStateConfig | ((context: TableEmptyStateContext) => ReactNode);
  onSelectRow?: (id: DataTableRowId, checked: boolean, row: TData) => void;
  onRowClick?: (row: TData, event: MouseEvent) => void;

  // Row Expansion
  renderExpandedRow?: (params: DataTableRenderExpandedRowParams<TData>) => ReactNode;
  expandedRowIds?: DataTableRowId[];
  isRowExpandable?: (row: TData) => boolean;
  expandOnRowClick?: boolean;
  onToggleExpand?: (id: DataTableRowId) => void;
  toggleRowExpanded?: (id: DataTableRowId) => void;
}

function DataTableBodyInner<TData extends Record<string, any> = Record<string, any>>(
  props: DataTableBodyProps<TData>,
) {
  const ctx = useOptionalDataTableContext<TData>();

  const {
    loading,
    virtualize,
    pagedRows,
    selection,
    rowVirtualizer,
    isFiltered = false,
    onResetFilters,
    skeletonRowCount,
  } = props;

  const visibleColumns = props.visibleColumns ?? ctx?.visibleColumns ?? EMPTY_ARRAY;
  const checkboxSelection = props.checkboxSelection ?? ctx?.checkboxSelection ?? false;
  const getRowId = props.getRowId ?? ctx?.getRowId ?? defaultGetRowId<TData>;
  const pinnedLeftFields = props.pinnedLeftFields ?? ctx?.pinnedLeftFields ?? EMPTY_ARRAY;
  const pinnedRightFields = props.pinnedRightFields ?? ctx?.pinnedRightFields ?? EMPTY_ARRAY;
  const leftOffsets = props.leftOffsets ?? ctx?.leftOffsets ?? EMPTY_RECORD;
  const rightOffsets = props.rightOffsets ?? ctx?.rightOffsets ?? EMPTY_RECORD;
  const columnWidths = props.columnWidths ?? ctx?.columnWidths ?? EMPTY_RECORD;
  const densityRowClass = props.densityRowClass ?? ctx?.densityRowClass ?? "h-11 py-2 px-3 text-xs";
  const slots = props.slots ?? ctx?.slots;
  const emptyState = props.emptyState ?? ctx?.emptyState;
  const emptyMessage = props.emptyMessage ?? ctx?.emptyMessage;
  const noResultsMessage = props.noResultsMessage ?? ctx?.noResultsMessage;
  const resetFiltersText = props.resetFiltersText ?? ctx?.resetFiltersText;
  const loadingText = props.loadingText ?? ctx?.loadingText;
  const onSelectRow = props.onSelectRow ?? ctx?.onSelectRow ?? NOOP;
  const onRowClick = props.onRowClick ?? ctx?.onRowClick;
  const isRowSelectable = props.isRowSelectable ?? ctx?.isRowSelectable;

  const renderExpandedRow = props.renderExpandedRow ?? ctx?.renderExpandedRow;
  const expandedRowIds = props.expandedRowIds ?? ctx?.expandedRowIds;
  const isRowExpandable = props.isRowExpandable ?? ctx?.isRowExpandable;
  const expandOnRowClick = props.expandOnRowClick ?? ctx?.expandOnRowClick;
  const onToggleExpand = props.toggleRowExpanded ?? props.onToggleExpand ?? ctx?.toggleRowExpanded;

  const totalColSpan = visibleColumns.length + (checkboxSelection ? 1 : 0) + (renderExpandedRow ? 1 : 0);

  // O(1) set lookup for row selection & expansion memoization
  const selectionSet = useMemo(() => new Set(selection), [selection]);
  const expandedSet = useMemo(() => new Set(expandedRowIds ?? EMPTY_ARRAY), [expandedRowIds]);

  // 虚拟化与非虚拟化两条渲染路径共享的行属性，避免维护两份 prop 列表
  const sharedRowProps = {
    isRowSelectable,
    checkboxSelection,
    visibleColumns,
    pinnedLeftFields,
    pinnedRightFields,
    leftOffsets,
    rightOffsets,
    columnWidths,
    densityRowClass,
    onSelectRow,
    onRowClick,
    renderExpandedRow,
    isRowExpandable,
    expandOnRowClick,
    onToggleExpand,
  };

  return (
    <TableBody>
      {loading && pagedRows.length === 0 ? (
        slots?.loadingOverlay ? (
          <DataTableLoadingOverlay colSpan={totalColSpan} slots={slots} loadingText={loadingText} />
        ) : (
          <DataTableSkeletonRows
            count={skeletonRowCount ?? 5}
            visibleColumns={visibleColumns}
            checkboxSelection={checkboxSelection}
            hasExpandColumn={Boolean(renderExpandedRow)}
            pinnedLeftFields={pinnedLeftFields}
            pinnedRightFields={pinnedRightFields}
            leftOffsets={leftOffsets}
            rightOffsets={rightOffsets}
            columnWidths={columnWidths}
            densityRowClass={densityRowClass}
          />
        )
      ) : pagedRows.length === 0 ? (
        <DataTableEmptyOverlay
          colSpan={totalColSpan}
          emptyMessage={emptyMessage}
          noResultsMessage={noResultsMessage}
          resetFiltersText={resetFiltersText}
          isFiltered={isFiltered}
          onResetFilters={onResetFilters}
          slots={slots}
          emptyState={emptyState}
        />
      ) : virtualize && rowVirtualizer ? (
        (() => {
          const virtualItems = rowVirtualizer.getVirtualItems();
          const totalSize = rowVirtualizer.getTotalSize();
          const startSpacerHeight = virtualItems[0]?.start ?? 0;
          const endSpacerHeight =
            virtualItems.length > 0 ? totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0) : 0;

          return (
            <>
              <tr
                aria-hidden="true"
                style={{
                  height: `${startSpacerHeight}px`,
                }}
              >
                <td colSpan={totalColSpan} className="border-0 p-0" />
              </tr>
              {virtualItems.map((virtualRow) => {
                const row = pagedRows[virtualRow.index];
                if (!row) return null;
                const rowId = getRowId(row);
                const isSelected = selectionSet.has(rowId);

                return (
                  <DataTableRow
                    key={String(rowId)}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    row={row}
                    index={virtualRow.index}
                    rowId={rowId}
                    isSelected={isSelected}
                    isExpanded={expandedRowIds ? expandedSet.has(rowId) : undefined}
                    {...sharedRowProps}
                  />
                );
              })}
              <tr
                aria-hidden="true"
                style={{
                  height: `${endSpacerHeight}px`,
                }}
              >
                <td colSpan={totalColSpan} className="border-0 p-0" />
              </tr>
            </>
          );
        })()
      ) : (
        pagedRows.map((row, index) => {
          const rowId = getRowId(row);
          const isSelected = selectionSet.has(rowId);

          return (
            <DataTableRow
              key={String(rowId)}
              row={row}
              index={index}
              rowId={rowId}
              isSelected={isSelected}
              isExpanded={expandedRowIds ? expandedSet.has(rowId) : undefined}
              {...sharedRowProps}
            />
          );
        })
      )}
    </TableBody>
  );
}

export const DataTableBody = memo(DataTableBodyInner) as <
  TData extends Record<string, any> = Record<string, any>,
>(
  props: DataTableBodyProps<TData>,
) => ReactElement | null;
