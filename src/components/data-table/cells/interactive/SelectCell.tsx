"use client";

import { useTranslations } from "next-intl";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "cn";

import type { SelectCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";
import { useOptimisticCellMutation } from "./useOptimisticCellMutation";

function SelectCellInner<TData = unknown, TVal extends string = string>({
	value,
	options,
	row,
	onCellChange,
	showErrorToast = true,
	errorToastMessage,
	disabled = false,
	align = "left",
	className,
}: SelectCellProps<TData, TVal>) {
	const t = useTranslations("table");
	const { optimisticValue, isPending, triggerMutation } = useOptimisticCellMutation({
		value,
		row,
		onMutate: onCellChange,
		showErrorToast,
		errorToastMessage,
		defaultErrorMessage: t("cell_select_save_error"),
		disabled,
	});

	const handleValueChange = (nextValue: string) => {
		if (nextValue === optimisticValue) return;
		triggerMutation(nextValue as TVal);
	};

	return (
		<div
			className={cn("flex items-center gap-1.5", JUSTIFY_ALIGN_CLASSES[align], className)}
			onClick={(e) => e.stopPropagation()}
		>
			<Select
				value={optimisticValue !== undefined && optimisticValue !== null ? String(optimisticValue) : ""}
				onValueChange={handleValueChange}
				disabled={disabled || isPending}
			>
				<SelectTrigger
					size="sm"
					aria-label={t("aria_select_value")}
					className="bg-background/50 h-7 max-w-[150px] min-w-[90px] text-xs"
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent align="start">
					<SelectGroup>
						{options.map((opt) => (
							<SelectItem key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled} className="text-xs">
								{opt.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			{isPending ? <Spinner className="text-muted-foreground size-3 shrink-0" /> : null}
		</div>
	);
}

export const SelectCell = SelectCellInner as typeof SelectCellInner;
