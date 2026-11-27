"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, isValidElement, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "cn";

import { SortableRowSlot } from "../sortableBinding";
import { RepeaterDragHandle, RepeaterRowActions } from "./RepeaterActions";
import type { RepeaterItemHelpers } from "./types";
import { useRepeaterItemShell } from "./useRepeaterItemShell";

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
	const firstError = Array.isArray(error) ? error[0] : error;

	return (
		<SortableRowSlot id={itemKey} disabled={disabled || !reorderable}>
			{({ setNodeRef, style: dragStyle, isDragging, attributes: dragAttributes, listeners: dragListeners }) => (
				<TableRow
					ref={setNodeRef}
					style={dragStyle}
					aria-invalid={hasError || undefined}
					className={cn(
						"border-border/40 hover:bg-muted/20 border-b transition-colors",
						hasError && "bg-destructive/5 hover:bg-destructive/10",
						isDragging && "bg-muted z-30 opacity-75 shadow-md",
					)}
				>
					{reorderable && !disabled ? (
						<TableCell className="border-border/40 w-8 border-r px-2 py-2 text-center align-middle">
							<RepeaterDragHandle
								ariaLabel={`${t("repeater_drag_handle")} ${rowLabel}`}
								dragAttributes={dragAttributes}
								dragListeners={dragListeners}
							/>
						</TableCell>
					) : null}

					{isFragmentOrTd ? (
						rendered
					) : (
						<TableCell className="px-3 py-2 align-middle">
							<div className="flex flex-col gap-1">
								{rendered}
								{hasError && firstError ? (
									<Badge role="alert" variant="destructive" className="w-fit gap-1 px-1.5 text-xs font-normal">
										<AlertCircle aria-hidden="true" className="size-3" />
										<span>{firstError}</span>
									</Badge>
								) : null}
							</div>
						</TableCell>
					)}

					{hasActionCol ? (
						<TableCell className="border-border/40 w-24 shrink-0 border-l px-2 py-2 text-right align-middle">
							<div className="flex items-center justify-end gap-0.5">
								{isFragmentOrTd && hasError && firstError ? (
									<Badge
										role="alert"
										variant="destructive"
										title={firstError}
										className="mr-1 gap-1 px-1.5 text-xs font-normal"
									>
										<AlertCircle aria-hidden="true" className="size-3" />
										<span className="max-w-24 truncate">{firstError}</span>
									</Badge>
								) : null}
								<RepeaterRowActions
									rowLabel={rowLabel}
									disabled={disabled}
									canDuplicate={canDuplicate}
									reorderable={reorderable}
									canDelete={canDelete}
									confirmDelete={confirmDelete}
									isFirst={isFirst}
									isLast={isLast}
									destructiveHighlight
									confirmTitle={t("repeater_confirm_delete_row_title")}
									confirmDescription={t("repeater_confirm_delete_row_desc")}
									onDuplicate={handleDuplicate}
									onMoveUp={handleMoveUp}
									onMoveDown={handleMoveDown}
									onDelete={handleDirectRemove}
								/>
							</div>
						</TableCell>
					) : null}
				</TableRow>
			)}
		</SortableRowSlot>
	);
} as <T>(props: RepeaterTableRowProps<T>) => ReactNode;
