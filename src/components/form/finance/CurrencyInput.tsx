"use client";

import { useMemoizedFn } from "ahooks";
import { type ChangeEvent, useState } from "react";

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "cn";

import { type BaseInputProps, connectField } from "../core";

export interface CurrencyInputProps extends BaseInputProps {
	value?: number | null;
	defaultValue?: number | null;
	onChange?: (value: number | null) => void;
	onBlur?: () => void;
	currency?: string;
	currencies?: string[];
	onCurrencyChange?: (currency: string) => void;
	currencySymbol?: string;
	decimals?: number;
	min?: number;
	max?: number;
	allowNegative?: boolean;
	inputClassName?: string;
}

interface CurrencyInputInnerProps {
	id: string;
	value?: number | null;
	onChange: (value: number | null) => void;
	onBlur?: () => void;
	currency?: string;
	currencies?: string[];
	onCurrencyChange?: (currency: string) => void;
	currencySymbol?: string;
	decimals?: number;
	min?: number;
	max?: number;
	allowNegative?: boolean;
	placeholder?: string;
	disabled?: boolean;
	readOnly?: boolean;
	inputClassName?: string;
	hasError?: boolean;
	describedBy?: string;
}

function formatAmount(val: number | null | undefined, decimals = 2): string {
	if (val == null || !Number.isFinite(val)) return "";
	return val.toLocaleString("en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: decimals,
	});
}

function parseAmount(raw: string): number | null {
	const sanitized = raw.replaceAll(",", "").trim();
	if (sanitized === "" || sanitized === "-") return null;
	const num = Number(sanitized);
	return Number.isFinite(num) ? num : null;
}

function CurrencyInputInner({
	id,
	value: rawValue,
	onChange,
	onBlur,
	currency = "USD",
	currencies,
	onCurrencyChange,
	currencySymbol = "$",
	decimals = 2,
	min,
	max,
	allowNegative = false,
	placeholder = "0.00",
	disabled,
	readOnly,
	inputClassName,
	hasError,
	describedBy,
}: CurrencyInputInnerProps) {
	const value = typeof rawValue === "number" ? rawValue : null;
	const [isFocused, setIsFocused] = useState(false);
	const [editingValue, setEditingValue] = useState<string | null>(null);

	const displayValue = isFocused
		? (editingValue ?? (value == null ? "" : String(value)))
		: formatAmount(value, decimals);

	const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
		let raw = e.target.value;
		if (!allowNegative) {
			raw = raw.replaceAll("-", "");
		}
		const clean = raw.replaceAll(/[^0-9.-]/g, "");
		setEditingValue(clean);

		const parsed = parseAmount(clean);
		onChange(parsed);
	});

	const handleFocus = useMemoizedFn(() => {
		setIsFocused(true);
		setEditingValue(value == null ? "" : String(value));
	});

	const handleBlur = useMemoizedFn(() => {
		const parsedFromDraft = editingValue != null ? parseAmount(editingValue) : value;
		setIsFocused(false);
		setEditingValue(null);

		if (parsedFromDraft != null) {
			if (min != null && parsedFromDraft < min) {
				onChange(min);
			} else if (max != null && parsedFromDraft > max) {
				onChange(max);
			}
		}
		onBlur?.();
	});

	const hasMultiCurrency = Boolean(currencies && currencies.length > 1);

	return (
		<InputGroup
			className={cn(
				"w-full rounded-md",
				hasError && "border-destructive ring-destructive/20",
				disabled && "pointer-events-none opacity-50",
			)}
		>
			{hasMultiCurrency ? (
				<InputGroupAddon align="inline-start" className="p-0">
					<Select value={currency} onValueChange={onCurrencyChange} disabled={disabled || readOnly}>
						<SelectTrigger
							aria-label={currency}
							className="h-full rounded-r-none border-0 bg-transparent px-2.5 font-mono text-xs font-semibold shadow-none focus:ring-0"
						>
							<SelectValue>{currency}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{currencies!.map((curr) => (
								<SelectItem key={curr} value={curr} className="font-mono text-xs font-medium">
									{curr}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</InputGroupAddon>
			) : (
				<InputGroupAddon align="inline-start">
					<InputGroupText className="font-mono text-xs font-semibold select-none">
						{currencySymbol || currency}
					</InputGroupText>
				</InputGroupAddon>
			)}

			<InputGroupInput
				id={id}
				type="text"
				inputMode="decimal"
				value={displayValue}
				onChange={handleInputChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				placeholder={placeholder}
				disabled={disabled}
				readOnly={readOnly}
				aria-invalid={hasError}
				aria-describedby={describedBy}
				className={cn("font-mono text-xs", inputClassName)}
			/>

			{!hasMultiCurrency && currency && (
				<InputGroupAddon align="inline-end">
					<InputGroupText className="text-muted-foreground font-mono text-[11px] font-medium select-none">
						{currency}
					</InputGroupText>
				</InputGroupAddon>
			)}
		</InputGroup>
	);
}

type CurrencyExtraProps = Pick<
	CurrencyInputProps,
	| "placeholder"
	| "currency"
	| "currencies"
	| "onCurrencyChange"
	| "currencySymbol"
	| "decimals"
	| "min"
	| "max"
	| "allowNegative"
	| "inputClassName"
>;

export const CurrencyInput = connectField<number | null, CurrencyExtraProps>(CurrencyInputInner, {
	defaultValue: null,
});
