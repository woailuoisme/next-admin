"use client";

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
	required,
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

	const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		handleChange(e.target.value);
	};

	const currentLength = (typeof displayValue === "string" ? displayValue : "").length;

	return (
		<div className="flex w-full flex-col gap-1">
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
				aria-required={required}
				aria-describedby={describedBy}
				className={cn("min-h-20 resize-y", textareaClassName)}
			/>

			{showCount ? (
				<div
					className={cn(
						"text-right text-xs tabular-nums",
						maxLength && currentLength > maxLength ? "font-semibold text-destructive" : "text-muted-foreground",
					)}
				>
					{currentLength}
					{maxLength ? ` / ${maxLength}` : ""}
				</div>
			) : null}
		</div>
	);
}

export const TextareaInput = connectField<string, TextareaExtraProps>(TextareaControl, {
	defaultValue: "",
});
