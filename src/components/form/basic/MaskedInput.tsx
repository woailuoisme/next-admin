"use client";

import type { ChangeEvent, ReactNode } from "react";

import { cn } from "cn";

import { AdornedInput, type BaseInputProps, connectField, type FormFieldRenderProps } from "../core";

export interface MaskedInputProps extends BaseInputProps {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	onBlur?: () => void;
	mask: string;
	unmask?: boolean;
	prefix?: ReactNode;
	suffix?: ReactNode;
	clearable?: boolean;
	inputClassName?: string;
}

type MaskedExtraProps = Pick<
	MaskedInputProps,
	"mask" | "unmask" | "prefix" | "suffix" | "clearable" | "placeholder" | "inputClassName"
>;

function isWildcardMaskChar(ch: string): boolean {
	return ch === "#" || ch === "A" || ch === "*";
}

function getLeadingLiteral(mask: string): string {
	let prefix = "";
	for (const ch of mask) {
		if (isWildcardMaskChar(ch)) break;
		prefix += ch;
	}
	return prefix;
}

export function formatWithMask(rawInput: string, mask: string): { masked: string; unmasked: string } {
	const leadingLiteral = getLeadingLiteral(mask);
	let effectiveInput = rawInput;
	if (leadingLiteral) {
		if (rawInput.startsWith(leadingLiteral)) {
			effectiveInput = rawInput.slice(leadingLiteral.length);
		} else if (rawInput.length < leadingLiteral.length && leadingLiteral.startsWith(rawInput)) {
			// User backspaced part of the leading literal when no user characters remain.
			return { masked: "", unmasked: "" };
		}
	}

	let rawChars = "";
	for (const ch of effectiveInput) {
		if (/[0-9a-zA-Z]/.test(ch)) {
			rawChars += ch;
		}
	}

	if (rawChars.length === 0) {
		return { masked: "", unmasked: "" };
	}

	let masked = "";
	let unmasked = "";
	let rawIdx = 0;

	for (let i = 0; i < mask.length && rawIdx < rawChars.length; i++) {
		const maskChar = mask[i];
		const nextChar = rawChars[rawIdx];

		if (maskChar === "#") {
			if (/[0-9]/.test(nextChar)) {
				masked += nextChar;
				unmasked += nextChar;
				rawIdx++;
			} else {
				rawIdx++;
				i--;
			}
		} else if (maskChar === "A") {
			if (/[a-zA-Z]/.test(nextChar)) {
				masked += nextChar;
				unmasked += nextChar;
				rawIdx++;
			} else {
				rawIdx++;
				i--;
			}
		} else if (maskChar === "*") {
			masked += nextChar;
			unmasked += nextChar;
			rawIdx++;
		} else {
			masked += maskChar;
		}
	}

	if (unmasked.length === 0) {
		return { masked: "", unmasked: "" };
	}

	return { masked, unmasked };
}

function MaskedControl({
	id,
	value = "",
	onChange,
	onBlur,
	mask,
	unmask = false,
	placeholder,
	disabled,
	readOnly,
	required,
	clearable = false,
	prefix,
	suffix,
	inputClassName,
	hasError,
	describedBy,
}: FormFieldRenderProps<string> & MaskedExtraProps) {
	const displayValue = formatWithMask(value ?? "", mask).masked;

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		const { masked, unmasked: cleanUnmasked } = formatWithMask(raw, mask);
		onChange(unmask ? cleanUnmasked : masked);
	};

	const handleClear = () => {
		onChange("");
	};

	return (
		<AdornedInput
			id={id}
			type="text"
			value={displayValue}
			onChange={handleInputChange}
			onClear={handleClear}
			onBlur={onBlur}
			placeholder={placeholder ?? mask}
			disabled={disabled}
			readOnly={readOnly}
			required={required}
			clearable={clearable}
			prefix={prefix}
			suffix={suffix}
			hasError={hasError}
			describedBy={describedBy}
			inputClassName={cn("font-mono tracking-wide", inputClassName)}
		/>
	);
}

export const MaskedInput = connectField<string, MaskedExtraProps>(MaskedControl, { defaultValue: "" });
