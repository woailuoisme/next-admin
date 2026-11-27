"use client";

import type { DateRange } from "react-day-picker";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import {
	type BaseInputProps,
	connectField,
	type DateRangeValue,
	FieldClearButton,
	type FormFieldRenderProps,
} from "../core";
import { LocalizedLazyCalendar } from "./LazyCalendar";
import { parseDate } from "./dateUtils";

export interface DateRangePickerInputProps extends BaseInputProps {
	value?: DateRangeValue;
	defaultValue?: DateRangeValue;
	onChange?: (value: DateRangeValue | undefined) => void;
	onBlur?: () => void;
	dateFormat?: string;
	clearable?: boolean;
}

type DateRangeExtraProps = Pick<DateRangePickerInputProps, "dateFormat" | "clearable" | "placeholder">;

function DateRangePickerControl({
	id,
	placeholder,
	disabled,
	readOnly,
	required,
	dateFormat = "yyyy-MM-dd",
	clearable = true,
	value,
	onChange,
	onBlur,
	hasError,
	describedBy,
}: FormFieldRenderProps<DateRangeValue | undefined> & DateRangeExtraProps) {
	const t = useTranslations("form");
	const triggerRef = useRef<HTMLButtonElement>(null);
	const [open, setOpen] = useState(false);
	const locked = Boolean(disabled || readOnly);

	const fromDate = parseDate(value?.from);
	const toDate = parseDate(value?.to);
	const rangeSelected: DateRange | undefined = fromDate || toDate ? { from: fromDate, to: toDate } : undefined;

	const handleOpenChange = (nextOpen: boolean) => {
		if (locked && nextOpen) return;
		setOpen(nextOpen);
		if (!nextOpen) onBlur?.();
	};

	const handleSelect = (range: DateRange | undefined) => {
		if (locked) return;
		if (!range) {
			onChange(undefined);
		} else {
			onChange({
				from: range.from,
				to: range.to,
			});
		}
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (locked) return;
		onChange(undefined);
		triggerRef.current?.focus();
	};

	let displayLabel = placeholder ?? t("daterange_placeholder");
	if (fromDate && toDate) {
		displayLabel = `${format(fromDate, dateFormat)} ~ ${format(toDate, dateFormat)}`;
	} else if (fromDate) {
		displayLabel = `${format(fromDate, dateFormat)} ~ ...`;
	}

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
							!fromDate && "text-muted-foreground",
						)}
					>
						<span className="flex min-w-0 flex-1 items-center gap-2">
							<CalendarIcon aria-hidden="true" className="text-muted-foreground size-3.5 shrink-0" />
							<span className="truncate">{displayLabel}</span>
						</span>
					</Button>
				</PopoverTrigger>

				<PopoverContent className="w-auto rounded-xl p-0" align="start">
					{open ? (
						<LocalizedLazyCalendar mode="range" numberOfMonths={2} selected={rangeSelected} onSelect={handleSelect} />
					) : null}
				</PopoverContent>
			</Popover>

			{clearable && (fromDate || toDate) && !locked ? (
				<FieldClearButton
					onClick={handleClear}
					ariaLabel={t("daterange_clear")}
					className="hover:text-destructive absolute right-2"
				/>
			) : null}
		</div>
	);
}

export const DateRangePickerInput = connectField<DateRangeValue | undefined, DateRangeExtraProps>(
	DateRangePickerControl,
);
