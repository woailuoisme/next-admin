import type { Virtualizer } from "@tanstack/react-virtual";
import { memo, type ReactElement } from "react";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";

import { useDataTableContext } from "../core/DataTableContext";
import type { DataTableRowId } from "../core/types";
import { DataTableEmptyOverlay, DataTableLoadingOverlay, DataTableSkeletonRows } from "../overlays/DataTableOverlays";
import { DataTableRow } from "./DataTableRow";

export interface DataTableBodyProps<TData extends Record<string, any> = Record<string, any>> {
	loading?: boolean;
	virtualize?: boolean;
	pagedRows: TData[];
	selectionSet: Set<DataTableRowId>;
	expandedSet?: Set<DataTableRowId>;
	rowVirtualizer?: Virtualizer<HTMLDivElement, Element>;
	isFiltered?: boolean;
	onResetFilters?: () => void;
	skeletonRowCount?: number;
}

function DataTableBodyInner<TData extends Record<string, any> = Record<string, any>>({
	loading,
	virtualize,
	pagedRows,
	selectionSet,
	expandedSet,
	rowVirtualizer,
	isFiltered = false,
	onResetFilters,
	skeletonRowCount,
}: DataTableBodyProps<TData>) {
	const {
		visibleColumns,
		checkboxSelection,
		getRowId,
		slots,
		emptyState,
		emptyMessage,
		noResultsMessage,
		resetFiltersText,
		loadingText,
		renderExpandedRow,
	} = useDataTableContext<TData>();

	const totalColSpan = visibleColumns.length + (checkboxSelection ? 1 : 0) + (renderExpandedRow ? 1 : 0);

	return (
		<TableBody>
			{loading && pagedRows.length === 0 ? (
				slots?.loadingOverlay ? (
					<DataTableLoadingOverlay colSpan={totalColSpan} slots={slots} loadingText={loadingText} />
				) : (
					<DataTableSkeletonRows count={skeletonRowCount ?? 5} />
				)
			) : pagedRows.length === 0 ? (
				<DataTableEmptyOverlay
					colSpan={totalColSpan}
					emptyMessage={emptyMessage}
					noResultsMessage={noResultsMessage}
					resetFiltersText={resetFiltersText}
					isFiltered={isFiltered}
					onResetFilters={onResetFilters}
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
							<TableRow
								aria-hidden="true"
								className="border-0 hover:bg-transparent"
								style={{ height: `${startSpacerHeight}px` }}
							>
								<TableCell colSpan={totalColSpan} className="border-0 p-0" />
							</TableRow>
							{virtualItems.map((virtualRow) => {
								const row = pagedRows[virtualRow.index];
								if (!row) return null;
								const rowId = getRowId(row);

								return (
									<DataTableRow
										key={String(rowId)}
										data-index={virtualRow.index}
										ref={rowVirtualizer.measureElement}
										row={row}
										index={virtualRow.index}
										rowId={rowId}
										isSelected={selectionSet.has(rowId)}
										isExpanded={expandedSet ? expandedSet.has(rowId) : undefined}
									/>
								);
							})}
							<TableRow
								aria-hidden="true"
								className="border-0 hover:bg-transparent"
								style={{ height: `${endSpacerHeight}px` }}
							>
								<TableCell colSpan={totalColSpan} className="border-0 p-0" />
							</TableRow>
						</>
					);
				})()
			) : (
				pagedRows.map((row, index) => {
					const rowId = getRowId(row);
					return (
						<DataTableRow
							key={String(rowId)}
							row={row}
							index={index}
							rowId={rowId}
							isSelected={selectionSet.has(rowId)}
							isExpanded={expandedSet ? expandedSet.has(rowId) : undefined}
						/>
					);
				})
			)}
		</TableBody>
	);
}

function arraysShallowEqual<T>(a: T[], b: T[]): boolean {
	if (a === b) return true;
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (!Object.is(a[i], b[i])) return false;
	}
	return true;
}

function setsEqual<T>(a?: Set<T>, b?: Set<T>): boolean {
	if (a === b) return true;
	if (!a || !b || a.size !== b.size) return false;
	for (const item of a) {
		if (!b.has(item)) return false;
	}
	return true;
}

function areDataTableBodyPropsEqual<TData extends Record<string, any>>(
	prev: DataTableBodyProps<TData>,
	next: DataTableBodyProps<TData>,
): boolean {
	if (next.virtualize) return false;
	return (
		prev.loading === next.loading &&
		prev.virtualize === next.virtualize &&
		prev.isFiltered === next.isFiltered &&
		prev.onResetFilters === next.onResetFilters &&
		prev.skeletonRowCount === next.skeletonRowCount &&
		arraysShallowEqual(prev.pagedRows, next.pagedRows) &&
		setsEqual(prev.selectionSet, next.selectionSet) &&
		setsEqual(prev.expandedSet, next.expandedSet)
	);
}

// Whitelist AGENTS.md §5.2: 与 DataTableRow 配合隔离表体渲染边界，避免外层工具栏/分页交互触发无效全表 Diff
export const DataTableBody = memo(DataTableBodyInner, areDataTableBodyPropsEqual) as <
	TData extends Record<string, any> = Record<string, any>,
>(
	props: DataTableBodyProps<TData>,
) => ReactElement | null;
