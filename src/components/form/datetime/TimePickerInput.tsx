"use client";

import { Clock, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ChangeEvent, type FocusEvent, useRef } from "react";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

import { type BaseInputProps, connectField, type FormFieldRenderProps } from "../core";

export interface TimePickerInputProps extends BaseInputProps {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	onBlur?: () => void;
	step?: number;
	clearable?: boolean;
}

type TimePickerExtraProps = Pick<TimePickerInputProps, "step" | "clearable" | "placeholder">;

function TimePickerControl({
	id,
	step = 60,
	value = "",
	onChange,
	onBlur,
	disabled,
	readOnly,
	required,
	clearable = true,
	hasError,
	describedBy,
}: FormFieldRenderProps<string> & TimePickerExtraProps) {
	const t = useTranslations("form");
	const inputRef = useRef<HTMLInputElement>(null);
	const strValue = typeof value === "string" ? value : "";

	const handleGroupBlur = (e: FocusEvent<HTMLDivElement>) => {
		if (onBlur && !e.currentTarget.contains(e.relatedTarget)) {
			onBlur();
		}
	};

	const handleClear = () => {
		onChange("");
		inputRef.current?.focus();
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
	};

	return (
		<InputGroup onBlur={handleGroupBlur} className="w-full">
			<InputGroupAddon align="inline-start">
				<Clock className="size-3.5" aria-hidden="true" />
			</InputGroupAddon>
			<InputGroupInput
				ref={inputRef}
				id={id}
				type="time"
				step={step}
				value={strValue}
				onChange={handleInputChange}
				disabled={disabled}
				readOnly={readOnly}

				aria-invalid={hasError}
				aria-required={required}
				aria-describedby={describedBy}
				className="font-mono text-xs [&::-webkit-calendar-picker-indicator]:opacity-70"
			/>
			{clearable && strValue && !disabled && !readOnly ? (
				<InputGroupAddon align="inline-end">
					<InputGroupButton
						type="button"
						size="icon-xs"
						variant="ghost"
						onClick={handleClear}
						aria-label={t("time_clear")}
					>
						<X className="size-3" aria-hidden="true" />
					</InputGroupButton>
				</InputGroupAddon>
			) : null}
		</InputGroup>
	);
}

export const TimePickerInput = connectField<string, TimePickerExtraProps>(TimePickerControl, { defaultValue: "" });
