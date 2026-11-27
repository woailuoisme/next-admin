"use client";

import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "cn";

import { SortableRowSlot } from "../sortableBinding";
import { RepeaterDragHandle, RepeaterRowActions } from "./RepeaterActions";
import type { RepeaterItemHelpers, RepeaterLayout } from "./types";
import { useRepeaterItemShell } from "./useRepeaterItemShell";

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
						isDragging && "ring-primary/40 z-30 rounded-lg opacity-75 shadow-lg ring-2",
					)}
				>
					<Card
						className={cn(
							"border-border bg-card overflow-hidden rounded-lg border shadow-2xs transition-colors",
							hasError && "border-destructive/60 bg-destructive/5",
							isSimple && "border-dashed bg-transparent shadow-none",
						)}
					>
						<CardHeader
							className={cn(
								"border-border/60 bg-muted/40 flex flex-row items-center justify-between border-b px-3.5 py-2 select-none",
								hasError && "border-destructive/30 bg-destructive/10",
								isSimple && "border-b-dashed bg-transparent",
							)}
						>
							<div className="flex min-w-0 items-center gap-1.5">
								{reorderable && !disabled ? (
									<RepeaterDragHandle
										ariaLabel={`${t("repeater_drag_handle")} ${titleStr}`}
										dragAttributes={dragAttributes}
										dragListeners={dragListeners}
									/>
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
										{isCollapsed ? (
											<ChevronDown aria-hidden="true" className="size-3.5" />
										) : (
											<ChevronUp aria-hidden="true" className="size-3.5" />
										)}
									</Button>
								) : null}

								<span className="text-foreground truncate text-xs font-semibold">{titleNode}</span>

								{hasError ? (
									<Badge variant="destructive" className="h-4.5 gap-1 px-1.5 text-xs font-normal">
										<AlertCircle aria-hidden="true" className="size-3" />
										<span>{Array.isArray(error) ? error[0] : error}</span>
									</Badge>
								) : null}
							</div>

							<div className="flex shrink-0 items-center gap-0.5">
								<RepeaterRowActions
									rowLabel={titleStr}
									disabled={disabled}
									canDuplicate={canDuplicate}
									reorderable={reorderable}
									canDelete={canDelete}
									confirmDelete={confirmDelete}
									isFirst={isFirst}
									isLast={isLast}
									destructiveHighlight={!confirmDelete}
									confirmTitle={t("repeater_confirm_delete_title")}
									confirmDescription={t("repeater_confirm_delete_item_desc")}
									onDuplicate={handleDuplicate}
									onMoveUp={handleMoveUp}
									onMoveDown={handleMoveDown}
									onDelete={handleDirectRemove}
								/>
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
