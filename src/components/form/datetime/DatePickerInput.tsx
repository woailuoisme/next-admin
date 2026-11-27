"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import { type BaseInputProps, connectField, FieldClearButton, type FormFieldRenderProps } from "../core";
import { LocalizedLazyCalendar } from "./LazyCalendar";
import { parseDate } from "./dateUtils";

export interface DatePickerInputProps extends BaseInputProps {
	value?: Date | string;
	defaultValue?: Date | string;
	onChange?: (value: Date | string | undefined) => void;
	onBlur?: () => void;
	dateFormat?: string;
	clearable?: boolean;
	prefix?: ReactNode;
	outputFormat?: "date" | "iso" | "string";
}

type DatePickerExtraProps = Pick<
	DatePickerInputProps,
	"placeholder" | "dateFormat" | "clearable" | "prefix" | "outputFormat"
>;

function DatePickerControl({
	id,
	placeholder,
	disabled,
	readOnly,
	required,
	dateFormat = "yyyy-MM-dd",
	clearable = true,
	prefix,
	outputFormat = "iso",
	value,
	onChange,
	onBlur,
	hasError,
	describedBy,
}: FormFieldRenderProps<Date | string | undefined> & DatePickerExtraProps) {
	const t = useTranslations("form");
	const triggerRef = useRef<HTMLButtonElement>(null);
	const resolvedPlaceholder = placeholder ?? t("date_placeholder");
	const clearAriaLabel = t("date_clear");
	const [open, setOpen] = useState(false);
	const selectedDate = parseDate(value);
	const locked = Boolean(disabled || readOnly);

	const handleOpenChange = (nextOpen: boolean) => {
		if (locked && nextOpen) return;
		setOpen(nextOpen);
		if (!nextOpen) onBlur?.();
	};

	const handleSelect = (date: Date | undefined) => {
		if (locked) return;
		if (!date) {
			onChange(undefined);
		} else if (outputFormat === "date") {
			onChange(date);
		} else if (outputFormat === "string") {
			onChange(format(date, dateFormat));
		} else {
			onChange(date.toISOString());
		}
		setOpen(false);
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (locked) return;
		onChange(undefined);
		triggerRef.current?.focus();
	};

	return (
		<div className="relative flex w-full items-center">
			<Popover open={open} onOpenChange={handleOpenChange}>
				<PopoverTrigger asChild>
					<Button
						ref={triggerRef}
						id={id}
						type="button"
						variant="outline"
						disabled={disabled}
						data-readonly={readOnly || undefined}
						aria-invalid={hasError}
						aria-required={required}
						aria-describedby={describedBy}
						className={cn(
							"h-8 w-full justify-start bg-transparent px-2.5 pr-8 text-left text-xs font-normal",
							!selectedDate && "text-muted-foreground",
						)}
					>
						<span className="flex min-w-0 flex-1 items-center gap-2">
							{prefix ? <span className="text-muted-foreground shrink-0">{prefix}</span> : null}
							<CalendarIcon className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
							<span className="truncate">{selectedDate ? format(selectedDate, dateFormat) : resolvedPlaceholder}</span>
						</span>
					</Button>
				</PopoverTrigger>

				<PopoverContent className="w-auto rounded-xl p-0" align="start">
					{open ? <LocalizedLazyCalendar mode="single" selected={selectedDate} onSelect={handleSelect} /> : null}
				</PopoverContent>
			</Popover>

			{clearable && selectedDate && !locked ? (
				<FieldClearButton
					onClick={handleClear}
					ariaLabel={clearAriaLabel}
					className="hover:text-destructive absolute right-2"
				/>
			) : null}
		</div>
	);
}

export const DatePickerInput = connectField<Date | string | undefined, DatePickerExtraProps>(DatePickerControl);
