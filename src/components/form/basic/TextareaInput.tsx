"use client";

import { useMemoizedFn } from "ahooks";
import { type ChangeEvent } from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "cn";

import { type BaseInputProps, connectField, type FormFieldRenderProps, useDebouncedFieldValue } from "../core";

export interface TextareaInputProps extends BaseInputProps {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	onBlur?: () => void;
	rows?: number;
	maxLength?: number;
	showCount?: boolean;
	debounceMs?: number;
	textareaClassName?: string;
}

type TextareaExtraProps = Pick<
	TextareaInputProps,
	"rows" | "maxLength" | "showCount" | "placeholder" | "debounceMs" | "textareaClassName"
>;

function TextareaControl({
	id,
	value = "",
	onChange,
	onBlur,
	rows = 3,
	maxLength,
	showCount = false,
	placeholder,
	disabled,
	readOnly,
	hasError,
	describedBy,
	debounceMs = 0,
	textareaClassName,
}: FormFieldRenderProps<string> & TextareaExtraProps) {
	const stringValue = typeof value === "string" ? value : "";
	const { displayValue, handleChange, handleBlur } = useDebouncedFieldValue<string>({
		value: stringValue,
		debounceMs,
		onChange,
		onBlur,
	});

	const handleTextareaChange = useMemoizedFn((e: ChangeEvent<HTMLTextAreaElement>) => {
		handleChange(e.target.value);
	});

	const currentLength = stringValue.length;

	return (
		<div className="w-full space-y-1">
			<Textarea
				id={id}
				rows={rows}
				maxLength={maxLength}
				value={displayValue}
				onChange={handleTextareaChange}
				onBlur={handleBlur}
				placeholder={placeholder}
				disabled={disabled}
				readOnly={readOnly}
				aria-invalid={hasError}
				aria-describedby={describedBy}
				className={cn(
					"min-h-[80px] resize-y rounded-md",
					hasError && "border-destructive ring-destructive/20",
					disabled && "pointer-events-none opacity-50",
					textareaClassName,
				)}
			/>

			{showCount && (
				<div
					className={cn(
						"text-right text-[10px] tabular-nums",
						maxLength && currentLength > maxLength ? "font-semibold text-destructive" : "text-muted-foreground",
					)}
				>
					{currentLength}
					{maxLength ? ` / ${maxLength}` : ""}
				</div>
			)}
		</div>
	);
}

export const TextareaInput = connectField<string, TextareaExtraProps>(TextareaControl, {
	defaultValue: "",
});
