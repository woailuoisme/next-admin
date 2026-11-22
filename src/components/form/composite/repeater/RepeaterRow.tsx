"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, ChevronDown, ChevronUp, Copy, GripVertical, MoveDown, MoveUp } from "lucide-react";
import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "cn";

import type { RepeaterItemHelpers, RepeaterLayout } from "./types";
import { RepeaterDeleteButton, SortableRowSlot, useRepeaterItemShell } from "./useRepeaterItemShell";

interface RepeaterRowProps<T> {
	itemKey: string;
	item: T;
	index: number;
	totalItems: number;
	layout?: RepeaterLayout;
	isCollapsed: boolean;
	titleNode: ReactNode;
	titleStr: string;
	disabled?: boolean;
	collapsible?: boolean;
	reorderable?: boolean;
	canDuplicate?: boolean;
	canDelete?: boolean;
	confirmDelete?: boolean;
	error?: string | string[];

	onToggleCollapse: (key: string) => void;
	onMoveUp: (index: number) => void;
	onMoveDown: (index: number) => void;
	onDuplicate: (index: number) => void;
	onRemove: (index: number) => void;
	onUpdate: (nextVal: T, index: number) => void;
	renderItem: (item: T, index: number, updateItem: (val: T) => void, helpers: RepeaterItemHelpers<T>) => ReactNode;
}

export const RepeaterRow = function RepeaterRow<T>({
	itemKey,
	item,
	index,
	totalItems,
	layout = "card",
	isCollapsed,
	titleNode,
	titleStr,
	disabled,
	collapsible = true,
	reorderable = true,
	canDuplicate = true,
	canDelete = true,
	confirmDelete = false,
	error,
	onToggleCollapse,
	onMoveUp,
	onMoveDown,
	onDuplicate,
	onRemove,
	onUpdate,
	renderItem,
}: RepeaterRowProps<T>) {
	const t = useTranslations("form");

	const {
		hasError,
		isFirst,
		isLast,
		helpers,
		handleToggle,
		handleMoveUp,
		handleMoveDown,
		handleDuplicate,
		handleDirectRemove,
		handleUpdate,
	} = useRepeaterItemShell<T>({
		itemKey,
		index,
		totalItems,
		isCollapsed,
		error,
		onToggleCollapse,
		onMoveUp,
		onMoveDown,
		onDuplicate,
		onRemove,
		onUpdate,
	});

	const isSimple = layout === "simple";

	return (
		<SortableRowSlot id={itemKey} disabled={disabled || !reorderable}>
			{({ setNodeRef, style: dragStyle, isDragging, attributes: dragAttributes, listeners: dragListeners }) => (
				<div
					ref={setNodeRef}
					style={dragStyle}
					className={cn(
						"relative transition-shadow duration-150",
						isDragging && "z-30 rounded-lg opacity-75 shadow-lg ring-2 ring-primary/40",
					)}
				>
					<Card
						className={cn(
							"overflow-hidden rounded-lg border border-border bg-card shadow-2xs transition-colors",
							hasError && "border-destructive/60 bg-destructive/5",
							isSimple && "border-dashed bg-transparent shadow-none",
						)}
					>
						<CardHeader
							className={cn(
								"flex flex-row items-center justify-between border-b border-border/60 bg-muted/40 px-3.5 py-2 select-none",
								hasError && "border-destructive/30 bg-destructive/10",
								isSimple && "border-b-dashed bg-transparent",
							)}
						>
							<div className="flex min-w-0 items-center gap-1.5">
								{reorderable && !disabled ? (
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										{...dragAttributes}
										{...dragListeners}
										aria-label={`${t("repeater_drag_handle")} ${titleStr}`}
										className="text-muted-foreground/60 hover:bg-muted/80 hover:text-foreground size-6 cursor-grab active:cursor-grabbing"
									>
										<GripVertical className="size-3.5" />
									</Button>
								) : null}

								{collapsible ? (
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										onClick={handleToggle}
										aria-expanded={!isCollapsed}
										aria-label={
											isCollapsed ? `${t("repeater_expand")} ${titleStr}` : `${t("repeater_collapse")} ${titleStr}`
										}
										className="text-muted-foreground hover:bg-muted/80 hover:text-foreground size-6 cursor-pointer"
									>
										{isCollapsed ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
									</Button>
								) : null}

								<span className="text-foreground truncate text-xs font-semibold">{titleNode}</span>

								{hasError ? (
									<Badge variant="destructive" className="h-4.5 gap-1 px-1.5 text-[10px] font-normal">
										<AlertCircle className="size-2.5" />
										<span>{Array.isArray(error) ? error[0] : error}</span>
									</Badge>
								) : null}
							</div>

							<div className="flex shrink-0 items-center gap-0.5">
								{canDuplicate && !disabled ? (
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										onClick={handleDuplicate}
										className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 cursor-pointer"
										title={t("repeater_duplicate")}
										aria-label={`${t("repeater_duplicate")} ${titleStr}`}
									>
										<Copy className="size-3" />
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
											aria-label={`${t("repeater_move_up")} ${titleStr}`}
										>
											<MoveUp className="size-3" />
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											onClick={handleMoveDown}
											disabled={isLast}
											className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 cursor-pointer disabled:opacity-30"
											title={t("repeater_move_down")}
											aria-label={`${t("repeater_move_down")} ${titleStr}`}
										>
											<MoveDown className="size-3" />
										</Button>
									</>
								) : null}

								{canDelete && !disabled ? (
									<RepeaterDeleteButton
										confirmDelete={confirmDelete}
										onConfirmDelete={handleDirectRemove}
										ariaLabel={`${t("repeater_delete_row")} ${titleStr}`}
										title={t("repeater_delete_row")}
										confirmTitle={t("repeater_confirm_delete_title")}
										confirmDescription={t("repeater_confirm_delete_item_desc")}
										cancelLabel={t("repeater_cancel")}
										confirmLabel={t("repeater_confirm_delete_action")}
										destructiveHighlight={!confirmDelete}
									/>
								) : null}
							</div>
						</CardHeader>

						{!isCollapsed ? (
							<CardContent className={cn("p-3.5", isSimple && "pt-2")}>
								{renderItem(item, index, handleUpdate, helpers)}
							</CardContent>
						) : null}
					</Card>
				</div>
			)}
		</SortableRowSlot>
	);
} as <T>(props: RepeaterRowProps<T>) => ReactNode;
