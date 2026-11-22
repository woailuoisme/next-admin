"use client";

import { useMemoizedFn } from "ahooks";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import type { RepeaterItemHelpers } from "./types";

import { SortableItemContext, type SortableRenderBindings, STATIC_SORTABLE_BINDINGS } from "../sortableBinding";

export function SortableRowSlot({
	id,
	disabled,
	children,
}: {
	id: string;
	disabled?: boolean;
	children: (bindings: SortableRenderBindings) => ReactNode;
}) {
	const renderSlot = useContext(SortableItemContext);
	if (!renderSlot || disabled) return <>{children(STATIC_SORTABLE_BINDINGS)}</>;
	return <>{renderSlot({ id, disabled, children })}</>;
}

interface UseRepeaterItemShellOptions<T> {
	itemKey: string;
	index: number;
	totalItems: number;
	isCollapsed?: boolean;
	error?: string | string[];
	onToggleCollapse?: (key: string) => void;
	onMoveUp: (index: number) => void;
	onMoveDown: (index: number) => void;
	onDuplicate: (index: number) => void;
	onRemove: (index: number) => void;
	onUpdate: (nextVal: T, index: number) => void;
}

const NOOP = () => {};

/**
 * 统一封装 Repeater 卡片行与表格行的稳定 helpers 与删除确认交互，消除双行视图重复实现。
 */
export function useRepeaterItemShell<T>({
	itemKey,
	index,
	totalItems,
	isCollapsed = false,
	error,
	onToggleCollapse,
	onMoveUp,
	onMoveDown,
	onDuplicate,
	onRemove,
	onUpdate,
}: UseRepeaterItemShellOptions<T>) {
	const handleToggle = useMemoizedFn(() => {
		onToggleCollapse?.(itemKey);
	});

	const handleMoveUp = useMemoizedFn(() => {
		onMoveUp(index);
	});

	const handleMoveDown = useMemoizedFn(() => {
		onMoveDown(index);
	});

	const handleDuplicate = useMemoizedFn(() => {
		onDuplicate(index);
	});

	const handleDirectRemove = useMemoizedFn(() => {
		onRemove(index);
	});

	const handleUpdate = useMemoizedFn((nextVal: T) => {
		onUpdate(nextVal, index);
	});

	const hasError = Boolean(error && (Array.isArray(error) ? error.length > 0 : true));
	const isFirst = index === 0;
	const isLast = index === totalItems - 1;

	const helpers: RepeaterItemHelpers<T> = {
		index,
		totalItems,
		isFirst,
		isLast,
		isCollapsed,
		hasError,
		error,
		moveUp: handleMoveUp,
		moveDown: handleMoveDown,
		remove: handleDirectRemove,
		duplicate: handleDuplicate,
		toggleCollapse: onToggleCollapse ? handleToggle : NOOP,
		update: handleUpdate,
	};

	return {
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
	};
}

interface DeleteConfirmButtonProps {
	confirmDelete?: boolean;
	onConfirmDelete: () => void;
	ariaLabel: string;
	title?: string;
	confirmTitle?: string;
	confirmDescription?: string;
	cancelLabel?: string;
	confirmLabel?: string;
	destructiveHighlight?: boolean;
}

export function RepeaterDeleteButton({
	confirmDelete = false,
	onConfirmDelete,
	ariaLabel,
	title,
	confirmTitle,
	confirmDescription,
	cancelLabel,
	confirmLabel,
	destructiveHighlight = false,
}: DeleteConfirmButtonProps) {
	const t = useTranslations("form");
	const resolvedTitle = title ?? t("repeater_delete_item");
	const resolvedConfirmTitle = confirmTitle ?? t("repeater_confirm_delete_title");
	const resolvedConfirmDescription = confirmDescription ?? t("repeater_confirm_delete_item_desc");
	const resolvedCancelLabel = cancelLabel ?? t("repeater_cancel");
	const resolvedConfirmLabel = confirmLabel ?? t("repeater_confirm_delete_action");
	const [popoverOpen, setPopoverOpen] = useState(false);

	const handleConfirm = useMemoizedFn(() => {
		setPopoverOpen(false);
		onConfirmDelete();
	});

	const buttonClass = cn(
		"size-6 cursor-pointer transition-colors hover:bg-destructive/10 hover:text-destructive",
		destructiveHighlight ? "text-destructive/80" : "text-muted-foreground",
	);

	if (!confirmDelete) {
		return (
			<Button
				type="button"
				variant="ghost"
				size="icon-xs"
				onClick={onConfirmDelete}
				className={buttonClass}
				title={resolvedTitle}
				aria-label={ariaLabel}
			>
				<Trash2 className="size-3" />
			</Button>
		);
	}

	return (
		<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					className={buttonClass}
					title={resolvedTitle}
					aria-label={ariaLabel}
				>
					<Trash2 className="size-3" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" side="bottom" className="w-56 space-y-2.5 p-3 text-xs shadow-lg">
				<div className="text-foreground font-medium">{resolvedConfirmTitle}</div>
				<p className="text-muted-foreground text-[11px]">{resolvedConfirmDescription}</p>
				<div className="flex justify-end gap-1.5 pt-1">
					<Button type="button" variant="outline" size="xs" onClick={() => setPopoverOpen(false)}>
						{resolvedCancelLabel}
					</Button>
					<Button type="button" variant="destructive" size="xs" onClick={handleConfirm}>
						{resolvedConfirmLabel}
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
