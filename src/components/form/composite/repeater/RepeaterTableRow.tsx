"use client";

import { Copy, GripVertical, MoveDown, MoveUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, isValidElement, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "cn";

import type { RepeaterItemHelpers } from "./types";
import { RepeaterDeleteButton, SortableRowSlot, useRepeaterItemShell } from "./useRepeaterItemShell";

export interface RepeaterTableRowProps<T> {
	itemKey: string;
	item: T;
	index: number;
	totalItems: number;
	disabled?: boolean;
	reorderable?: boolean;
	canDuplicate?: boolean;
	canDelete?: boolean;
	confirmDelete?: boolean;
	hasActionCol?: boolean;
	error?: string | string[];
	onMoveUp: (index: number) => void;
	onMoveDown: (index: number) => void;
	onDuplicate: (index: number) => void;
	onRemove: (index: number) => void;
	onUpdate: (nextVal: T, index: number) => void;
	renderItem: (item: T, index: number, updateItem: (val: T) => void, helpers: RepeaterItemHelpers<T>) => ReactNode;
}

export const RepeaterTableRow = function RepeaterTableRow<T>({
	itemKey,
	item,
	index,
	totalItems,
	disabled,
	reorderable = true,
	canDuplicate = true,
	canDelete = true,
	confirmDelete = false,
	hasActionCol = true,
	error,
	onMoveUp,
	onMoveDown,
	onDuplicate,
	onRemove,
	onUpdate,
	renderItem,
}: RepeaterTableRowProps<T>) {
	const t = useTranslations("form");

	const {
		hasError,
		isFirst,
		isLast,
		helpers,
		handleMoveUp,
		handleMoveDown,
		handleDuplicate,
		handleDirectRemove,
		handleUpdate,
	} = useRepeaterItemShell<T>({
		itemKey,
		index,
		totalItems,
		error,
		onMoveUp,
		onMoveDown,
		onDuplicate,
		onRemove,
		onUpdate,
	});

	const rendered = renderItem(item, index, handleUpdate, helpers);
	const isFragmentOrTd =
		isValidElement(rendered) && (rendered.type === Fragment || rendered.type === "td" || rendered.type === TableCell);
	const rowLabel = `#${index + 1}`;

	return (
		<SortableRowSlot id={itemKey} disabled={disabled || !reorderable}>
			{({ setNodeRef, style: dragStyle, isDragging, attributes: dragAttributes, listeners: dragListeners }) => (
				<TableRow
					ref={setNodeRef}
					style={dragStyle}
					className={cn(
						"border-b border-border/40 transition-colors hover:bg-muted/20",
						hasError && "bg-destructive/5 hover:bg-destructive/10",
						isDragging && "z-30 bg-muted opacity-75 shadow-md",
					)}
				>
					{reorderable && !disabled ? (
						<TableCell className="border-border/40 w-8 border-r px-2 py-2 text-center align-middle">
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								{...dragAttributes}
								{...dragListeners}
								aria-label={`${t("repeater_drag_handle")} ${rowLabel}`}
								className="text-muted-foreground/60 hover:bg-muted/80 hover:text-foreground size-6 cursor-grab active:cursor-grabbing"
							>
								<GripVertical className="size-3.5" />
							</Button>
						</TableCell>
					) : null}

					{isFragmentOrTd ? rendered : <TableCell className="px-3 py-2 align-middle">{rendered}</TableCell>}

					{hasActionCol && (
						<TableCell className="border-border/40 w-24 shrink-0 border-l px-2 py-2 text-right align-middle">
							<div className="flex items-center justify-end gap-0.5">
								{canDuplicate && !disabled ? (
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										onClick={handleDuplicate}
										className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 cursor-pointer"
										title={t("repeater_duplicate")}
										aria-label={`${t("repeater_duplicate")} ${rowLabel}`}
									>
										<Copy aria-hidden="true" className="size-3" />
									</Button>
								) : null}

								{reorderable && !disabled ? (
									<>
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											onClick={handleMoveUp}
											disabled={isFirst}
											className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 cursor-pointer disabled:opacity-30"
											title={t("repeater_move_up")}
											aria-label={`${t("repeater_move_up")} ${rowLabel}`}
										>
											<MoveUp aria-hidden="true" className="size-3" />
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											onClick={handleMoveDown}
											disabled={isLast}
											className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 cursor-pointer disabled:opacity-30"
											title={t("repeater_move_down")}
											aria-label={`${t("repeater_move_down")} ${rowLabel}`}
										>
											<MoveDown aria-hidden="true" className="size-3" />
										</Button>
									</>
								) : null}

								{canDelete && !disabled ? (
									<RepeaterDeleteButton
										confirmDelete={confirmDelete}
										onConfirmDelete={handleDirectRemove}
										ariaLabel={`${t("repeater_delete_row")} ${rowLabel}`}
										title={t("repeater_delete_row")}
										confirmTitle={t("repeater_confirm_delete_row_title")}
										confirmDescription={t("repeater_confirm_delete_row_desc")}
										cancelLabel={t("repeater_cancel")}
										confirmLabel={t("repeater_confirm_delete_action")}
										destructiveHighlight
									/>
								) : null}
							</div>
						</TableCell>
					)}
				</TableRow>
			)}
		</SortableRowSlot>
	);
} as <T>(props: RepeaterTableRowProps<T>) => ReactNode;
