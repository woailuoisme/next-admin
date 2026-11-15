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

import { defaultGetRowId, EMPTY_ARRAY } from "../core/constants";
import { useOptionalDataTableContext } from "../core/DataTableContext";
import { DataTableEmptyOverlay, DataTableLoadingOverlay, DataTableSkeletonRows } from "../overlays/DataTableOverlays";
import { DataTableRow } from "./DataTableRow";

export interface DataTableBodyProps<TData extends Record<string, any> = Record<string, any>> {
  loading?: boolean;
  virtualize?: boolean;
  pagedRows: TData[];
  visibleColumns?: DataTableColDef<TData>[];
  getRowId?: (row: TData) => DataTableRowId;
  selection?: DataTableRowSelectionModel;
  selectionSet?: Set<DataTableRowId>;
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
  expandedSet?: Set<DataTableRowId>;
  isRowExpandable?: (row: TData) => boolean;
  expandOnRowClick?: boolean;
  onToggleExpand?: (id: DataTableRowId) => void;
  toggleRowExpanded?: (id: DataTableRowId) => void;
}

function DataTableBodyInner<TData extends Record<string, any> = Record<string, any>>(props: DataTableBodyProps<TData>) {
  const ctx = useOptionalDataTableContext<TData>();

  const {
    loading,
    virtualize,
    pagedRows,
    selection,
    selectionSet: propSelectionSet,
    expandedRowIds,
    expandedSet: propExpandedSet,
    rowVirtualizer,
    isFiltered = false,
    onResetFilters,
    skeletonRowCount,
  } = props;

  const visibleColumns = props.visibleColumns ?? ctx?.visibleColumns ?? EMPTY_ARRAY;
  const checkboxSelection = props.checkboxSelection ?? ctx?.checkboxSelection ?? false;
  const getRowId = props.getRowId ?? ctx?.getRowId ?? defaultGetRowId<TData>;
  const slots = props.slots ?? ctx?.slots;
  const emptyState = props.emptyState ?? ctx?.emptyState;
  const emptyMessage = props.emptyMessage ?? ctx?.emptyMessage;
  const noResultsMessage = props.noResultsMessage ?? ctx?.noResultsMessage;
  const resetFiltersText = props.resetFiltersText ?? ctx?.resetFiltersText;
  const loadingText = props.loadingText ?? ctx?.loadingText;
  const renderExpandedRow = props.renderExpandedRow ?? ctx?.renderExpandedRow;

  const totalColSpan = visibleColumns.length + (checkboxSelection ? 1 : 0) + (renderExpandedRow ? 1 : 0);

  // O(1) set lookup for row selection & expansion memoization
  const fallbackSelectionSet = useMemo(() => new Set(selection ?? EMPTY_ARRAY), [selection]);
  const fallbackExpandedSet = useMemo(() => new Set(expandedRowIds ?? EMPTY_ARRAY), [expandedRowIds]);
  const selectionSet = propSelectionSet ?? fallbackSelectionSet;
  const expandedSet = propExpandedSet ?? (expandedRowIds ? fallbackExpandedSet : undefined);

  // Only forward explicit standalone overrides when rendered outside DataTableProvider;
  // inside DataTable, rows read static config from DataTableConfigContext directly so React.memo stays clean.
  const overrideRowProps = useMemo(() => {
    const overrides: Record<string, unknown> = {};
    if (props.visibleColumns !== undefined) overrides.visibleColumns = props.visibleColumns;
    if (props.checkboxSelection !== undefined) overrides.checkboxSelection = props.checkboxSelection;
    if (props.isRowSelectable !== undefined) overrides.isRowSelectable = props.isRowSelectable;
    if (props.pinnedLeftFields !== undefined) overrides.pinnedLeftFields = props.pinnedLeftFields;
    if (props.pinnedRightFields !== undefined) overrides.pinnedRightFields = props.pinnedRightFields;
    if (props.leftOffsets !== undefined) overrides.leftOffsets = props.leftOffsets;
    if (props.rightOffsets !== undefined) overrides.rightOffsets = props.rightOffsets;
    if (props.columnWidths !== undefined) overrides.columnWidths = props.columnWidths;
    if (props.densityRowClass !== undefined) overrides.densityRowClass = props.densityRowClass;
    if (props.onSelectRow !== undefined) overrides.onSelectRow = props.onSelectRow;
    if (props.onRowClick !== undefined) overrides.onRowClick = props.onRowClick;
    if (props.renderExpandedRow !== undefined) overrides.renderExpandedRow = props.renderExpandedRow;
    if (props.isRowExpandable !== undefined) overrides.isRowExpandable = props.isRowExpandable;
    if (props.expandOnRowClick !== undefined) overrides.expandOnRowClick = props.expandOnRowClick;
    const toggle = props.toggleRowExpanded ?? props.onToggleExpand;
    if (toggle !== undefined) overrides.onToggleExpand = toggle;
    return overrides;
  }, [
    props.visibleColumns,
    props.checkboxSelection,
    props.isRowSelectable,
    props.pinnedLeftFields,
    props.pinnedRightFields,
    props.leftOffsets,
    props.rightOffsets,
    props.columnWidths,
    props.densityRowClass,
    props.onSelectRow,
    props.onRowClick,
    props.renderExpandedRow,
    props.isRowExpandable,
    props.expandOnRowClick,
    props.toggleRowExpanded,
    props.onToggleExpand,
  ]);

  return (
    <TableBody>
      {loading && pagedRows.length === 0 ? (
        slots?.loadingOverlay ? (
          <DataTableLoadingOverlay colSpan={totalColSpan} slots={slots} loadingText={loadingText} />
        ) : (
          <DataTableSkeletonRows
            count={skeletonRowCount ?? 5}
            visibleColumns={props.visibleColumns}
            checkboxSelection={props.checkboxSelection}
            hasExpandColumn={props.renderExpandedRow !== undefined ? Boolean(props.renderExpandedRow) : undefined}
            pinnedLeftFields={props.pinnedLeftFields}
            pinnedRightFields={props.pinnedRightFields}
            leftOffsets={props.leftOffsets}
            rightOffsets={props.rightOffsets}
            columnWidths={props.columnWidths}
            densityRowClass={props.densityRowClass}
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
                    isExpanded={expandedSet ? expandedSet.has(rowId) : undefined}
                    {...overrideRowProps}
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
              isExpanded={expandedSet ? expandedSet.has(rowId) : undefined}
              {...overrideRowProps}
            />
          );
        })
      )}
    </TableBody>
  );
}

export const DataTableBody = memo(DataTableBodyInner) as <TData extends Record<string, any> = Record<string, any>>(
  props: DataTableBodyProps<TData>,
) => ReactElement | null;
