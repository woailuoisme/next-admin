"use client";

import { type ChangeEvent, type KeyboardEvent, type ReactNode } from "react";

import {
	AdornedInput,
	type BaseInputProps,
	connectField,
	type FormFieldRenderProps,
	useDebouncedFieldValue,
} from "../core";

export interface TextInputProps<T extends string | number = string> extends BaseInputProps {
	value?: T;
	defaultValue?: T;
	onChange?: (value: T) => void;
	onBlur?: () => void;
	type?: string;
	prefix?: ReactNode;
	suffix?: ReactNode;
	clearable?: boolean;
	password?: boolean;
	numeric?: boolean;
	debounceMs?: number;
	min?: number;
	max?: number;
	step?: number;
	autoComplete?: string;
	inputClassName?: string;
}

type TextExtraProps = Pick<
	TextInputProps,
	| "type"
	| "prefix"
	| "suffix"
	| "clearable"
	| "password"
	| "numeric"
	| "debounceMs"
	| "min"
	| "max"
	| "step"
	| "autoComplete"
	| "placeholder"
	| "inputClassName"
>;

function TextInputControl({
	id,
	type = "text",
	password = false,
	numeric = false,
	min,
	max,
	step,
	autoComplete,
	placeholder,
	disabled,
	readOnly,
	required,
	clearable = false,
	prefix,
	suffix,
	inputClassName,
	value,
	onChange,
	onBlur,
	hasError,
	describedBy,
	debounceMs = 0,
}: FormFieldRenderProps<string | number> & TextExtraProps) {
	const isPassword = password || type === "password";
	const effectiveType = numeric ? "number" : type;
	const { displayValue, handleChange, handleClear, handleBlur, flush } = useDebouncedFieldValue<
		string | number | undefined
	>({
		value,
		debounceMs,
		onChange: (nextVal) => onChange(nextVal ?? ""),
		onBlur,
	});

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		if (!numeric) {
			handleChange(raw);
			return;
		}
		if (raw === "") {
			handleChange("");
			return;
		}
		const parsed = Number(raw);
		if (Number.isFinite(parsed)) {
			handleChange(parsed);
		}
	};

	const handleClearClick = () => {
		handleClear("");
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.nativeEvent.isComposing) {
			flush();
		}
	};

	return (
		<AdornedInput
			id={id}
			type={effectiveType}
			isPassword={isPassword}
			value={displayValue}
			onChange={handleInputChange}
			onClear={handleClearClick}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			placeholder={placeholder}
			disabled={disabled}
			readOnly={readOnly}
			required={required}
			clearable={clearable}
			prefix={prefix}
			suffix={suffix}
			min={min}
			max={max}
			step={step}
			autoComplete={autoComplete}
			hasError={hasError}
			describedBy={describedBy}
			inputClassName={inputClassName}
		/>
	);
}

export const TextInput = connectField<string | number, TextExtraProps>(TextInputControl) as <
	T extends string | number = string,
>(
	props: TextInputProps<T>,
) => React.ReactElement;
