"use client";

import { useMemoizedFn } from "ahooks";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { cn } from "cn";

import { type BaseInputProps, connectField, FieldClearButton } from "../core";

export interface TimePickerInputProps extends BaseInputProps {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	onBlur?: () => void;
	step?: number;
	clearable?: boolean;
}

interface TimePickerControlProps {
	id: string;
	step?: number;
	value?: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	disabled?: boolean;
	readOnly?: boolean;
	placeholder?: string;
	clearable?: boolean;
	hasError?: boolean;
	describedBy?: string;
}

function TimePickerControl({
	id,
	step = 60,
	value = "",
	onChange,
	onBlur,
	disabled,
	readOnly,
	placeholder = "--:--",
	clearable = true,
	hasError,
	describedBy,
}: TimePickerControlProps) {
	const t = useTranslations("form");
	const strValue = typeof value === "string" ? value : "";

	const handleClear = useMemoizedFn((e: React.MouseEvent) => {
		e.stopPropagation();
		onChange("");
	});

	const handleInputChange = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
	});

	return (
		<div className="relative flex w-full items-center">
			<div className="text-muted-foreground pointer-events-none absolute left-2.5">
				<Clock className="size-3.5" aria-hidden="true" />
			</div>
			<Input
				id={id}
				type="time"
				step={step}
				value={strValue}
				onChange={handleInputChange}
				onBlur={onBlur}
				disabled={disabled}
				readOnly={readOnly}
				placeholder={placeholder}
				aria-invalid={hasError}
				aria-describedby={describedBy}
				className={cn(
					"h-8 bg-transparent pr-7 pl-8 font-mono text-xs",
					hasError && "border-destructive focus-visible:ring-destructive/20",
				)}
			/>
			{clearable && strValue && !disabled && !readOnly && (
				<FieldClearButton onClick={handleClear} ariaLabel={t("time_clear")} className="absolute right-1.5" />
			)}
		</div>
	);
}

type TimePickerExtraProps = Pick<TimePickerInputProps, "step" | "clearable">;

export const TimePickerInput = connectField<string, TimePickerExtraProps>(TimePickerControl, { defaultValue: "" });
