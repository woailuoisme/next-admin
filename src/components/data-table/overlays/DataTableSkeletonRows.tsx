import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "cn";

import { EMPTY_ARRAY } from "../core/constants";
import { useOptionalDataTableContext } from "../core/DataTableContext";
import type { DataTableColDef } from "../core/types";
import { buildColumnPinStyles, getColumnPinClass, resolveExpandColumnLeft, toColumnCssVarKey } from "../core/utils";

export interface DataTableSkeletonRowsProps<TData extends Record<string, any> = Record<string, any>> {
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

export function DataTableSkeletonRows<TData extends Record<string, any> = Record<string, any>>({
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

	const pinnedLeftSet = propPinnedLeftFields ? new Set(pinnedLeftFields) : (ctx?.pinnedLeftSet ?? new Set<string>());
	const pinnedRightSet = propPinnedRightFields
		? new Set(pinnedRightFields)
		: (ctx?.pinnedRightSet ?? new Set<string>());
	const lastPinnedLeftField = pinnedLeftFields[pinnedLeftFields.length - 1];
	const firstPinnedRightField = pinnedRightFields[0];
	const rows = Array.from({ length: Math.max(1, count) });

	return (
		<>
			{rows.map((_, rowIndex) => (
				<TableRow
					key={`skeleton-row-${rowIndex}`}
					className={cn("hover:bg-transparent", densityRowClass)}
					aria-hidden="true"
				>
					{checkboxSelection && (
						<TableCell className="bg-card sticky start-0 z-15 w-11 px-3 py-2 text-center">
							<Skeleton className="mx-auto size-4 rounded-xs" />
						</TableCell>
					)}

					{hasExpandColumn && (
						<TableCell
							style={{ insetInlineStart: resolveExpandColumnLeft(checkboxSelection, pinnedLeftFields.length > 0) }}
							className={cn(
								"w-9 px-1 text-center",
								(checkboxSelection || pinnedLeftFields.length > 0) &&
									"sticky z-15 border-r border-border/70 bg-card shadow-pin-left",
							)}
						>
							<Skeleton className="mx-auto size-3.5 rounded-xs" />
						</TableCell>
					)}

					{visibleColumns.map((col, colIndex) => {
						const isPinnedLeft = pinnedLeftSet.has(col.field);
						const isPinnedRight = pinnedRightSet.has(col.field);
						const varKey = toColumnCssVarKey(col.field);
						const actualWidth = columnWidths?.[col.field] ?? col.width;
						const style = buildColumnPinStyles({
							varKey,
							width: actualWidth,
							minWidth: col.minWidth,
							maxWidth: col.maxWidth,
							isLeftPinned: isPinnedLeft,
							isRightPinned: isPinnedRight,
							leftFallback: `${leftOffsets?.[col.field] ?? 0}px`,
							rightFallback: `${rightOffsets?.[col.field] ?? 0}px`,
						});

						return (
							<TableCell
								key={`skeleton-cell-${rowIndex}-${col.field}`}
								style={style}
								className={cn(
									"px-4 py-2",
									getColumnPinClass(isPinnedLeft, isPinnedRight, "card", "z-15"),
									lastPinnedLeftField === col.field && "border-r border-border/70 shadow-pin-left",
									firstPinnedRightField === col.field && "border-l border-border/70 shadow-pin-right",
									col.align === "right" && "text-right",
									col.align === "center" && "text-center",
								)}
							>
								<Skeleton
									className={cn(
										"h-4 rounded-md",
										WIDTH_CLASSES[(rowIndex + colIndex) % WIDTH_CLASSES.length],
										col.align === "right" && "ml-auto",
										col.align === "center" && "mx-auto",
									)}
								/>
							</TableCell>
						);
					})}
				</TableRow>
			))}
		</>
	);
}
