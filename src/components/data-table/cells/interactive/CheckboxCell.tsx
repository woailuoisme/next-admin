"use client";

import { useTranslations } from "next-intl";

import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "cn";

import type { CheckboxCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";
import { useOptimisticCellMutation } from "./useOptimisticCellMutation";

function CheckboxCellInner<TData = unknown>({
	checked = false,
	row,
	onCellChange,
	showErrorToast = true,
	errorToastMessage,
	disabled = false,
	align = "center",
	className,
}: CheckboxCellProps<TData>) {
	const t = useTranslations("table");
	const {
		optimisticValue: optimisticChecked,
		isPending,
		triggerMutation,
	} = useOptimisticCellMutation({
		value: checked,
		row,
		onMutate: onCellChange,
		showErrorToast,
		errorToastMessage,
		defaultErrorMessage: t("cell_checkbox_save_error"),
		disabled,
	});

	const handleCheckedChange = (val: boolean | "indeterminate") => {
		triggerMutation(val === true);
	};

	return (
		<div
			className={cn("flex items-center gap-1.5", JUSTIFY_ALIGN_CLASSES[align], className)}
			onClick={(e) => e.stopPropagation()}
		>
			<Checkbox
				checked={optimisticChecked}
				onCheckedChange={handleCheckedChange}
				disabled={disabled || isPending}
				aria-label={t("aria_select_row_generic")}
			/>
			{isPending ? <Spinner className="text-muted-foreground size-3 shrink-0" /> : null}
		</div>
	);
}

export const CheckboxCell = CheckboxCellInner as typeof CheckboxCellInner;
