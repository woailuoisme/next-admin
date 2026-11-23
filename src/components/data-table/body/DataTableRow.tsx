import { useMemoizedFn } from "ahooks";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { type HTMLAttributes, memo, type MouseEvent, type ReactNode, type Ref } from "react";

import { handleActivationKey, ROW_ACTIVATION_IGNORE_SELECTOR } from "@/components/shared/activationKey";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "cn";

import { TEXT_ALIGN_CLASSES } from "../cells/base";
import { useDataTableContext } from "../core/DataTableContext";
import type { DataTableRowId } from "../core/types";
import { buildColumnPinStyles, readCellValue, resolveExpandColumnLeft, toColumnCssVarKey } from "../core/utils";

export interface DataTableRowProps<
	TData extends Record<string, any> = Record<string, any>,
> extends HTMLAttributes<HTMLTableRowElement> {
	ref?: Ref<HTMLTableRowElement>;
	row: TData;
	index: number;
	rowId: DataTableRowId;
	isSelected: boolean;
	isExpanded?: boolean;
}

function DataTableRowComponent<TData extends Record<string, any> = Record<string, any>>({
	ref,
	row,
	index,
	rowId,
	isSelected,
	isExpanded = false,
	style,
	className,
	onKeyDown: propOnKeyDown,
	tabIndex: propTabIndex,
	...divRest
}: DataTableRowProps<TData>) {
	const ctx = useDataTableContext<TData>();
	const t = useTranslations("table");

	const {
		visibleColumns,
		checkboxSelection,
		isRowSelectable,
		pinnedLeftFields,
		pinnedRightFields,
		densityRowClass,
		onSelectRow,
		onRowClick,
		renderExpandedRow,
		isRowExpandable,
		expandOnRowClick = false,
		toggleRowExpanded,
	} = ctx;

	const pinnedLeftSet = new Set(pinnedLeftFields);
	const pinnedRightSet = new Set(pinnedRightFields);
	const canExpand = Boolean(renderExpandedRow && (isRowExpandable ? isRowExpandable(row) : true));
	const totalColSpan = visibleColumns.length + (checkboxSelection ? 1 : 0) + (renderExpandedRow ? 1 : 0);
	const isRowInteractive = Boolean(onRowClick || (expandOnRowClick && canExpand));

	const handleRowClick = (e: MouseEvent<HTMLTableRowElement>) => {
		if (e.target !== e.currentTarget && (e.target as HTMLElement).closest(ROW_ACTIVATION_IGNORE_SELECTOR)) return;
		if (expandOnRowClick && canExpand) toggleRowExpanded?.(rowId);
		onRowClick?.(row, e);
	};

	const handleRowKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
		propOnKeyDown?.(e);
		if (e.defaultPrevented || !isRowInteractive) return;
		handleActivationKey(
			e,
			() => {
				if (expandOnRowClick && canExpand) toggleRowExpanded?.(rowId);
				onRowClick?.(row, e);
			},
			ROW_ACTIVATION_IGNORE_SELECTOR,
		);
	};

	const handleCollapse = useMemoizedFn(() => {
		toggleRowExpanded?.(rowId);
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
					<TableCell onClick={(e) => e.stopPropagation()} className="bg-card sticky start-0 z-15 w-11 px-3 text-center">
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
						style={{ insetInlineStart: resolveExpandColumnLeft(checkboxSelection, pinnedLeftFields.length > 0) }}
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
									toggleRowExpanded?.(rowId);
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
					const isLeftPinned = pinnedLeftSet.has(field);
					const isRightPinned = pinnedRightSet.has(field);
					const varKey = toColumnCssVarKey(field);
					const rawValue = readCellValue(row, col);
					const formattedValue = valueFormatter ? valueFormatter(rawValue, row) : rawValue;

					return (
						<TableCell
							key={col.id ?? `${field}_${idx}`}
							style={buildColumnPinStyles({
								varKey,
								width,
								minWidth,
								maxWidth,
								isLeftPinned,
								isRightPinned,
							})}
							className={cn(
								densityRowClass,
								isLeftPinned && "sticky z-15 border-r border-border/70 bg-card shadow-pin-left",
								isRightPinned && "sticky z-15 border-l border-border/70 bg-card shadow-pin-right",
								TEXT_ALIGN_CLASSES[align ?? "left"],
								typeof cellClassName === "function"
									? cellClassName({ value: rawValue, row, field, colDef: col, index })
									: cellClassName,
							)}
						>
							{renderCell ? (
								renderCell({ value: rawValue, row, field, colDef: col, index })
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
							{renderExpandedRow({ row, index, collapse: handleCollapse })}
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
