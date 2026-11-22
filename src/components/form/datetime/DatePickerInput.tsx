"use client";

import { useMemoizedFn } from "ahooks";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import { type BaseInputProps, connectField, FieldClearButton, type FormFieldRenderProps } from "../core";
import { parseDate } from "./dateUtils";

const LazyCalendar = dynamic(() => import("@/components/ui/calendar").then((mod) => mod.Calendar), {
	ssr: false,
	loading: () => <div className="text-muted-foreground flex h-64 w-64 items-center justify-center text-xs">...</div>,
});

export interface DatePickerInputProps extends BaseInputProps {
	value?: Date | string;
	defaultValue?: Date | string;
	onChange?: (value: any) => void;
	onBlur?: () => void;
	dateFormat?: string;
	clearable?: boolean;
	prefix?: React.ReactNode;
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
	dateFormat = "yyyy-MM-dd",
	clearable = true,
	outputFormat = "iso",
	value,
	onChange,
	onBlur,
	hasError,
	describedBy,
}: FormFieldRenderProps<Date | string | undefined> & DatePickerExtraProps) {
	const t = useTranslations("form");
	const resolvedPlaceholder = placeholder ?? t("date_placeholder");
	const clearAriaLabel = t("date_clear");
	const [open, setOpen] = useState(false);
	const closePopover = useMemoizedFn(() => setOpen(false));
	const selectedDate = parseDate(value);
	const locked = Boolean(disabled || readOnly);

	const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
		if (locked && nextOpen) return;
		setOpen(nextOpen);
		if (!nextOpen) onBlur?.();
	});

	const handleSelect = useMemoizedFn((date: Date | undefined) => {
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
		closePopover();
	});

	const handleClear = useMemoizedFn((e: React.MouseEvent) => {
		e.stopPropagation();
		if (!locked) onChange(undefined);
	});

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
							!selectedDate && "text-muted-foreground",
							hasError && "border-destructive focus-visible:ring-destructive/20",
						)}
					>
						<div className="flex items-center gap-2 truncate">
							<CalendarIcon className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
							<span className="truncate">{selectedDate ? format(selectedDate, dateFormat) : resolvedPlaceholder}</span>
						</div>
					</Button>
				</PopoverTrigger>

				<PopoverContent className="w-auto rounded-xl p-0" align="start">
					{open ? <LazyCalendar mode="single" selected={selectedDate} onSelect={handleSelect} /> : null}
				</PopoverContent>
			</Popover>

			{clearable && selectedDate && !locked && (
				<FieldClearButton
					onClick={handleClear}
					ariaLabel={clearAriaLabel}
					className="hover:text-destructive absolute right-2"
				/>
			)}
		</div>
	);
}

export const DatePickerInput = connectField<Date | string | undefined, DatePickerExtraProps>(DatePickerControl);
