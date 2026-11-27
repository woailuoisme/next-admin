"use client";

import { useTranslations } from "next-intl";

import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { cn } from "cn";

import type { ToggleCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";
import { useOptimisticCellMutation } from "./useOptimisticCellMutation";

function ToggleCellInner<TData = unknown>({
	checked = false,
	row,
	onCellChange,
	onToggle,
	showErrorToast = true,
	errorToastMessage,
	disabled = false,
	readOnly = false,
	align = "center",
	className,
}: ToggleCellProps<TData>) {
	const t = useTranslations("table");
	const handler = onCellChange || onToggle;
	const {
		optimisticValue: optimisticChecked,
		isPending,
		triggerMutation,
	} = useOptimisticCellMutation({
		value: checked,
		row,
		onMutate: handler,
		showErrorToast,
		errorToastMessage,
		defaultErrorMessage: t("cell_toggle_save_error"),
		disabled: disabled || readOnly,
	});

	const handleCheckedChange = (nextChecked: boolean) => {
		triggerMutation(nextChecked);
	};

	return (
		<div
			className={cn("flex items-center gap-1.5", JUSTIFY_ALIGN_CLASSES[align], className)}
			onClick={(e) => e.stopPropagation()} // Prevent row selection on switch click
		>
			<Switch
				size="sm"
				aria-label={t("aria_toggle_status")}
				checked={optimisticChecked}
				onCheckedChange={handleCheckedChange}
				disabled={disabled || readOnly || isPending}
				className={cn(readOnly && "pointer-events-none cursor-default opacity-80")}
			/>
			{isPending ? <Spinner className="text-muted-foreground size-3 shrink-0" /> : null}
		</div>
	);
}

export const ToggleCell = ToggleCellInner as typeof ToggleCellInner;
