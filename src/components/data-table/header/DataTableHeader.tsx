import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "cn";

import { JUSTIFY_ALIGN_CLASSES } from "../cells/base";
import { useDataTableContext } from "../core/DataTableContext";
import type { DataTableSortModel } from "../core/types";
import { toColumnCssVarKey } from "../core/utils";

export interface DataTableHeaderProps {
	isAllPageSelected: boolean;
	isSomePageSelected: boolean;
	onSelectAll: (checked: boolean) => void;
	sortModel: DataTableSortModel;
}

function DataTableHeaderInner<TData = unknown>({
	isAllPageSelected,
	isSomePageSelected,
	onSelectAll,
	sortModel,
}: DataTableHeaderProps) {
	const ctx = useDataTableContext<TData>();
	const t = useTranslations("table");

	const {
		table,
		columnByField,
		checkboxSelection,
		renderExpandedRow,
		pinnedLeftFields,
		pinnedRightFields,
		getColumnWidth,
		handleSortClick,
		handleResizeStart,
		handleResizeStep,
	} = ctx;

	const hasExpandColumn = Boolean(renderExpandedRow);
	const pinnedLeftSet = new Set(pinnedLeftFields);
	const pinnedRightSet = new Set(pinnedRightFields);
	const sortDirectionByField = new Map(sortModel.map((s) => [s.field, s.sort]));

	return (
		<TableHeader className="bg-muted/60 sticky top-0 z-20 backdrop-blur-xs">
			{table.getHeaderGroups().map((headerGroup) => (
				<TableRow key={headerGroup.id} className="border-border/60 border-b hover:bg-transparent">
					{checkboxSelection && (
						<TableHead className="bg-muted sticky left-0 z-30 w-11 px-3 text-center">
							<Checkbox
								checked={isAllPageSelected ? true : isSomePageSelected ? "indeterminate" : false}
								onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
								aria-label={t("aria_select_all_page")}
							/>
						</TableHead>
					)}

					{hasExpandColumn && (
						<TableHead
							style={{ left: checkboxSelection ? "44px" : pinnedLeftFields.length > 0 ? "0px" : undefined }}
							className={cn(
								"w-9 px-1 text-center select-none",
								(checkboxSelection || pinnedLeftFields.length > 0) &&
									"sticky z-25 border-r border-border/70 bg-muted shadow-pin-left",
							)}
							aria-label={t("aria_expand_row")}
						/>
					)}

					{headerGroup.headers.map((header) => {
						const col = columnByField.get(header.column.id);
						if (!col) return null;

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

						const currentWidth = getColumnWidth(field, width ?? 120);
						const isLeftPinned = pinnedLeftSet.has(field);
						const isRightPinned = pinnedRightSet.has(field);
						const sortDirection = sortDirectionByField.get(field);
						const varKey = toColumnCssVarKey(field);

						return (
							<TableHead
								key={header.id}
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
									width: `var(--col-w-${varKey}, ${width ? `${width}px` : "auto"})`,
									minWidth: `${minWidth}px`,
									maxWidth: maxWidth ? `${maxWidth}px` : undefined,
									left: isLeftPinned ? `var(--col-left-${varKey}, 0px)` : undefined,
									right: isRightPinned ? `var(--col-right-${varKey}, 0px)` : undefined,
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
											handleSortClick(field);
										}
									}}
									className={cn(
										"flex items-center gap-1.5 rounded-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden",
										JUSTIFY_ALIGN_CLASSES[headerAlign],
										sortable && "cursor-pointer",
									)}
									onClick={() => sortable && handleSortClick(field)}
								>
									{renderHeader ? renderHeader({ colDef: col, headerName }) : <span>{headerName}</span>}

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

								{resizable && (
									<div
										role="separator"
										tabIndex={0}
										aria-orientation="vertical"
										aria-label={t("aria_resize_column", { name: headerName || field })}
										aria-valuenow={currentWidth}
										aria-valuemin={minWidth}
										aria-valuemax={maxWidth}
										onKeyDown={(e) => {
											const step = e.shiftKey ? 64 : 16;
											if (e.key === "ArrowLeft") {
												e.preventDefault();
												e.stopPropagation();
												handleResizeStep(field, -step);
											} else if (e.key === "ArrowRight") {
												e.preventDefault();
												e.stopPropagation();
												handleResizeStep(field, step);
											}
										}}
										onClick={(e) => e.stopPropagation()}
										onMouseDown={(e) => {
											e.stopPropagation();
											handleResizeStart(field, currentWidth, e);
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
			))}
		</TableHeader>
	);
}

export const DataTableHeader = DataTableHeaderInner as (props: DataTableHeaderProps) => ReactElement | null;
