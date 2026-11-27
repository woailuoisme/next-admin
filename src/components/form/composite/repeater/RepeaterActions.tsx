"use client";

import { Copy, GripVertical, MoveDown, MoveUp, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

export function RepeaterDragHandle({
	ariaLabel,
	dragAttributes,
	dragListeners,
}: {
	ariaLabel: string;
	dragAttributes: Record<string, any>;
	dragListeners?: Record<string, any>;
}) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-xs"
			{...dragAttributes}
			{...dragListeners}
			aria-label={ariaLabel}
			className="text-muted-foreground/60 hover:bg-muted/80 hover:text-foreground size-6 cursor-grab active:cursor-grabbing"
		>
			<GripVertical aria-hidden="true" className="size-3.5" />
		</Button>
	);
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

	const handleConfirm = () => {
		setPopoverOpen(false);
		onConfirmDelete();
	};

	const buttonClass = cn(
		"hover:bg-destructive/10 hover:text-destructive size-6 cursor-pointer transition-colors",
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
				<Trash2 aria-hidden="true" className="size-3" />
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
					<Trash2 aria-hidden="true" className="size-3" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" side="bottom" className="w-56 p-3 text-xs shadow-lg">
				<div className="text-foreground font-medium">{resolvedConfirmTitle}</div>
				<p className="text-muted-foreground text-xs">{resolvedConfirmDescription}</p>
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

export function RepeaterRowActions({
	rowLabel,
	disabled,
	canDuplicate,
	reorderable,
	canDelete,
	confirmDelete,
	isFirst,
	isLast,
	destructiveHighlight,
	confirmTitle,
	confirmDescription,
	onDuplicate,
	onMoveUp,
	onMoveDown,
	onDelete,
}: {
	rowLabel: string;
	disabled?: boolean;
	canDuplicate?: boolean;
	reorderable?: boolean;
	canDelete?: boolean;
	confirmDelete?: boolean;
	isFirst: boolean;
	isLast: boolean;
	destructiveHighlight?: boolean;
	confirmTitle: string;
	confirmDescription: string;
	onDuplicate: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onDelete: () => void;
}) {
	const t = useTranslations("form");

	return (
		<>
			{canDuplicate && !disabled ? (
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					onClick={onDuplicate}
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
						onClick={onMoveUp}
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
						onClick={onMoveDown}
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
					onConfirmDelete={onDelete}
					ariaLabel={`${t("repeater_delete_row")} ${rowLabel}`}
					title={t("repeater_delete_row")}
					confirmTitle={confirmTitle}
					confirmDescription={confirmDescription}
					cancelLabel={t("repeater_cancel")}
					confirmLabel={t("repeater_confirm_delete_action")}
					destructiveHighlight={destructiveHighlight}
				/>
			) : null}
		</>
	);
}
