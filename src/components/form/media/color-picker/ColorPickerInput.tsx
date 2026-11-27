"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import {
	connectField,
	createContainerBlurHandler,
	FieldClearButton,
	type FormFieldRenderProps,
} from "@/components/form/core";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";

import { type ColorPickerInputProps, DEFAULT_COLOR_PRESETS } from "./types";

const DynamicColorPickerContent = dynamic(() => import("./ColorPickerContent").then((mod) => mod.ColorPickerContent), {
	ssr: false,
	loading: () => <Skeleton className="h-48 w-56 rounded-lg" />,
});

type ColorPickerExtraProps = Pick<ColorPickerInputProps, "placeholder" | "presets" | "clearable" | "showEyeDropper">;

function ColorPickerControl({
	id,
	value = "",
	onChange,
	onBlur,
	disabled,
	readOnly,
	required,
	placeholder = "#000000",
	presets = DEFAULT_COLOR_PRESETS,
	clearable = true,
	showEyeDropper = true,
	hasError,
	describedBy,
}: FormFieldRenderProps<string> & ColorPickerExtraProps) {
	const t = useTranslations("form");
	const triggerRef = useRef<HTMLButtonElement>(null);
	const [open, setOpen] = useState(false);

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (disabled || readOnly) return;
		onChange("");
		triggerRef.current?.focus();
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if ((readOnly || disabled) && nextOpen) return;
		setOpen(nextOpen);
		if (!nextOpen) onBlur?.();
	};

	const handleContainerBlur = createContainerBlurHandler<HTMLDivElement>(() => {
		if (!open) onBlur?.();
	});

	const hasValue = Boolean(value);
	const displayText = (hasValue ? value : placeholder).toUpperCase();

	return (
		<div className="relative flex w-full items-center" onBlur={handleContainerBlur}>
			<Popover open={open} onOpenChange={handleOpenChange}>
				<PopoverTrigger asChild>
					<Button
						ref={triggerRef}
						id={id}
						type="button"
						variant="outline"
						disabled={disabled}
						aria-readonly={readOnly || undefined}
						aria-expanded={open}
						aria-invalid={hasError || undefined}
						aria-required={required}
						aria-describedby={describedBy}
						className={cn(
							"h-8 w-full justify-start bg-transparent px-2.5 pr-8 text-left text-xs font-normal shadow-2xs",
							!hasValue && "text-muted-foreground",
							readOnly && "cursor-default",
						)}
					>
						<span className="flex min-w-0 flex-1 items-center gap-2">
							<span
								className="border-border/80 size-4 shrink-0 rounded-sm border shadow-2xs transition-transform"
								style={{ backgroundColor: hasValue ? value : "transparent" }}
								aria-hidden="true"
							/>
							<span className="truncate font-mono tracking-wider uppercase">{displayText}</span>
						</span>
					</Button>
				</PopoverTrigger>

				<PopoverContent className="w-auto p-0" align="start">
					{open && !readOnly ? (
						<DynamicColorPickerContent
							value={value}
							onChange={onChange}
							onBlur={onBlur}
							presets={presets}
							disabled={disabled}
							showEyeDropper={showEyeDropper}
						/>
					) : null}
				</PopoverContent>
			</Popover>

			{clearable && hasValue && !disabled && !readOnly ? (
				<FieldClearButton
					onClick={handleClear}
					ariaLabel={t("color_clear")}
					className="hover:text-destructive absolute right-1.5"
				/>
			) : null}
		</div>
	);
}

export const ColorPickerInput = connectField<string, ColorPickerExtraProps>(ColorPickerControl, {
	defaultValue: "",
});
