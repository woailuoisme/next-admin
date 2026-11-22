"use client";

import type { DateRange } from "react-day-picker";

import { useMemoizedFn } from "ahooks";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import { type BaseInputProps, connectField, type DateRangeValue, FieldClearButton } from "../core";
import { parseDate } from "./dateUtils";

const LazyCalendar = dynamic(() => import("@/components/ui/calendar").then((mod) => mod.Calendar), {
	ssr: false,
	loading: () => <div className="text-muted-foreground flex h-64 w-80 items-center justify-center text-xs">...</div>,
});

export interface DateRangePickerInputProps extends BaseInputProps {
	value?: DateRangeValue;
	defaultValue?: DateRangeValue;
	onChange?: (value: DateRangeValue | undefined) => void;
	onBlur?: () => void;
	dateFormat?: string;
	clearable?: boolean;
}

interface DateRangePickerControlProps {
	id: string;
	placeholder?: string;
	disabled?: boolean;
	readOnly?: boolean;
	dateFormat?: string;
	clearable?: boolean;
	value?: DateRangeValue;
	onChange: (value: DateRangeValue | undefined) => void;
	onBlur?: () => void;
	hasError?: boolean;
	describedBy?: string;
}

function DateRangePickerControl({
	id,
	placeholder,
	disabled,
	readOnly,
	dateFormat = "yyyy-MM-dd",
	clearable = true,
	value,
	onChange,
	onBlur,
	hasError,
	describedBy,
}: DateRangePickerControlProps) {
	const t = useTranslations("form");
	const [open, setOpen] = useState(false);
	const locked = Boolean(disabled || readOnly);

	const fromDate = parseDate(value?.from);
	const toDate = parseDate(value?.to);
	const rangeSelected: DateRange | undefined = fromDate || toDate ? { from: fromDate, to: toDate } : undefined;

	const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
		if (locked && nextOpen) return;
		setOpen(nextOpen);
		if (!nextOpen) onBlur?.();
	});

	const handleSelect = useMemoizedFn((range: DateRange | undefined) => {
		if (locked) return;
		if (!range) {
			onChange(undefined);
		} else {
			onChange({
				from: range.from,
				to: range.to,
			});
		}
	});

	const handleClear = useMemoizedFn((e: React.MouseEvent) => {
		e.stopPropagation();
		if (!locked) onChange(undefined);
	});

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
						id={id}
						type="button"
						variant="outline"
						disabled={disabled}
						aria-readonly={readOnly}
						aria-invalid={hasError}
						aria-describedby={describedBy}
						className={cn(
							"h-8 w-full justify-start rounded-md bg-transparent px-2.5 pr-8 text-left text-xs font-normal",
							!fromDate && "text-muted-foreground",
							hasError && "border-destructive focus-visible:ring-destructive/20",
						)}
					>
						<div className="flex items-center gap-2 truncate">
							<CalendarIcon aria-hidden="true" className="text-muted-foreground size-3.5 shrink-0" />
							<span className="truncate">{displayLabel}</span>
						</div>
					</Button>
				</PopoverTrigger>

				<PopoverContent className="w-auto rounded-xl p-0" align="start">
					{open ? (
						<LazyCalendar mode="range" numberOfMonths={2} selected={rangeSelected} onSelect={handleSelect} />
					) : null}
				</PopoverContent>
			</Popover>

			{clearable && (fromDate || toDate) && !locked && (
				<FieldClearButton
					onClick={handleClear}
					ariaLabel={t("daterange_clear")}
					className="hover:text-destructive absolute right-2"
				/>
			)}
		</div>
	);
}

type DateRangeExtraProps = Pick<DateRangePickerInputProps, "dateFormat" | "clearable">;

export const DateRangePickerInput = connectField<DateRangeValue | undefined, DateRangeExtraProps>(
	DateRangePickerControl,
);
