import type { Virtualizer } from "@tanstack/react-virtual";
import { memo, type ReactElement } from "react";

import { TableBody } from "@/components/ui/table";

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
							<tr aria-hidden="true" style={{ height: `${startSpacerHeight}px` }}>
								<td colSpan={totalColSpan} className="border-0 p-0" />
							</tr>
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
							<tr aria-hidden="true" style={{ height: `${endSpacerHeight}px` }}>
								<td colSpan={totalColSpan} className="border-0 p-0" />
							</tr>
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

export const DataTableBody = memo(DataTableBodyInner) as <TData extends Record<string, any> = Record<string, any>>(
	props: DataTableBodyProps<TData>,
) => ReactElement | null;
