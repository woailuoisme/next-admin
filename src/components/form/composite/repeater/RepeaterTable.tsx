"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "cn";

import { RepeaterTableRow } from "./RepeaterTableRow";
import type { RepeaterHeaderColumn, RepeaterItemHelpers } from "./types";

interface RepeaterTableProps<T> {
	items: T[];
	keys: string[];
	headers?: RepeaterHeaderColumn[];
	disabled?: boolean;
	reorderable?: boolean;
	checkCanDuplicate: (item: T, index: number) => boolean;
	checkCanDelete: (item: T, index: number) => boolean;
	confirmDelete?: boolean;
	itemErrors?: Record<number, string | string[]>;
	renderSummary?: (items: T[]) => ReactNode;
	onMoveUp: (index: number) => void;
	onMoveDown: (index: number) => void;
	onDuplicate: (index: number) => void;
	onRemove: (index: number) => void;
	onUpdate: (nextVal: T, index: number) => void;
	renderItem: (item: T, index: number, updateItem: (val: T) => void, helpers: RepeaterItemHelpers<T>) => ReactNode;
	isAddAllowed?: boolean;
	onAdd?: () => void;
	addButtonText?: string;
}

export const RepeaterTable = function RepeaterTable<T>({
	items,
	keys,
	headers,
	disabled,
	reorderable = true,
	checkCanDuplicate,
	checkCanDelete,
	confirmDelete = false,
	itemErrors,
	renderSummary,
	onMoveUp,
	onMoveDown,
	onDuplicate,
	onRemove,
	onUpdate,
	renderItem,
	isAddAllowed,
	onAdd,
	addButtonText,
}: RepeaterTableProps<T>) {
	const t = useTranslations("form");
	const resolvedAddText = addButtonText ?? t("repeater_add");
	const hasReorderCol = Boolean(reorderable && !disabled);
	const hasActionCol = Boolean(
		!disabled &&
		(reorderable || items.some((item, index) => checkCanDuplicate(item, index) || checkCanDelete(item, index))),
	);
	const totalCols = (headers?.length || 1) + (hasReorderCol ? 1 : 0) + (hasActionCol ? 1 : 0);

	return (
		<div className="border-border/80 bg-card overflow-hidden rounded-lg border shadow-2xs">
			<Table className="text-xs">
				<TableHeader className="border-border/60 bg-muted/40 text-muted-foreground border-b font-medium select-none">
					<TableRow className="hover:bg-transparent">
						{hasReorderCol ? (
							<TableHead className="border-border/60 w-8 border-r px-2 py-2 text-center">
								<span className="sr-only">{t("repeater_drag_col")}</span>
							</TableHead>
						) : null}
						{headers && headers.length > 0 ? (
							headers.map((col, idx) => {
								const colKey = col.id ?? (typeof col.label === "string" ? col.label : `col-${idx}`);
								return (
									<TableHead
										key={colKey}
										className={cn(
											"border-border/40 text-muted-foreground border-r px-3 py-2 text-left font-medium last:border-r-0",
											col.width,
											col.className,
										)}
									>
										<span className="flex items-center gap-1">
											<span>{col.label}</span>
											{col.required ? (
												<span aria-hidden="true" className="text-destructive">
													*
												</span>
											) : null}
										</span>
									</TableHead>
								);
							})
						) : (
							<TableHead className="text-muted-foreground px-3 py-2 text-left font-medium">
								{t("repeater_table_default_col")}
							</TableHead>
						)}
						{hasActionCol ? (
							<TableHead className="border-border/60 text-muted-foreground w-24 border-l px-2 py-2 text-right font-medium">
								{t("repeater_table_actions_col")}
							</TableHead>
						) : null}
					</TableRow>
				</TableHeader>

				<TableBody className="divide-border/40 divide-y">
					{items.map((item, index) => {
						const key = keys[index]!;
						return (
							<RepeaterTableRow
								key={key}
								itemKey={key}
								item={item}
								index={index}
								totalItems={items.length}
								disabled={disabled}
								reorderable={reorderable}
								canDuplicate={checkCanDuplicate(item, index)}
								canDelete={checkCanDelete(item, index)}
								hasActionCol={hasActionCol}
								confirmDelete={confirmDelete}
								error={itemErrors?.[index]}
								onMoveUp={onMoveUp}
								onMoveDown={onMoveDown}
								onDuplicate={onDuplicate}
								onRemove={onRemove}
								onUpdate={onUpdate}
								renderItem={renderItem}
							/>
						);
					})}
				</TableBody>

				{renderSummary ? (
					<TableFooter className="border-border/60 bg-muted/30 border-t font-medium">
						<TableRow className="hover:bg-transparent">
							<TableCell colSpan={totalCols} className="px-3 py-2">
								{renderSummary(items)}
							</TableCell>
						</TableRow>
					</TableFooter>
				) : null}
			</Table>

			{isAddAllowed && onAdd ? (
				<Button
					type="button"
					variant="ghost"
					onClick={onAdd}
					className="border-border/60 bg-card text-foreground hover:bg-muted/40 active:bg-muted/60 h-9 w-full rounded-none border-t px-3 text-xs font-medium"
				>
					<Plus aria-hidden="true" className="text-muted-foreground size-3.5" data-icon="inline-start" />
					<span>{resolvedAddText}</span>
				</Button>
			) : null}
		</div>
	);
} as <T>(props: RepeaterTableProps<T>) => ReactNode;
