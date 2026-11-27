"use client";

import { useLocale, useTranslations } from "next-intl";
import { type ChangeEvent, useState } from "react";

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "cn";

import { type BaseInputProps, connectField, type FormFieldRenderProps } from "../core";

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

interface CurrencyEditingState {
	base: number | null;
	text: string;
}

function roundToDecimals(num: number, decimals: number): number {
	const safeDecimals = Math.max(0, Math.min(10, Math.floor(decimals)));
	const rounded = Number(num.toFixed(safeDecimals));
	return Object.is(rounded, -0) ? 0 : rounded;
}

function formatAmount(val: number | null, locale: string, decimals = 2): string {
	if (val == null || !Number.isFinite(val)) return "";
	return val.toLocaleString(locale, {
		minimumFractionDigits: 0,
		maximumFractionDigits: Math.max(0, Math.min(10, Math.floor(decimals))),
	});
}

function sanitizeCurrencyText(raw: string, decimals: number, allowNegative: boolean): string {
	let cleaned = "";
	let hasDot = false;
	const allowDecimals = decimals > 0;
	for (let i = 0; i < raw.length; i++) {
		const ch = raw[i];
		if (ch >= "0" && ch <= "9") {
			cleaned += ch;
		} else if (allowNegative && ch === "-" && i === 0 && !cleaned.includes("-")) {
			cleaned += ch;
		} else if (allowDecimals && ch === "." && !hasDot) {
			hasDot = true;
			cleaned += ch;
		}
	}
	return cleaned;
}

function parseAmount(raw: string): number | null {
	const sanitized = raw.replaceAll(",", "").trim();
	if (sanitized === "" || sanitized === "-" || sanitized === "." || sanitized === "-.") return null;
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
	required,
	inputClassName,
	hasError,
	describedBy,
}: FormFieldRenderProps<number | null> & CurrencyExtraProps) {
	const t = useTranslations("form");
	const locale = useLocale();
	const formatLocale = locale.startsWith("zh") ? "zh-CN" : "en-US";
	const value = typeof rawValue === "number" && Number.isFinite(rawValue) ? rawValue : null;
	const [isFocused, setIsFocused] = useState(false);
	const [editingState, setEditingState] = useState<CurrencyEditingState | null>(null);

	const activeDraft =
		isFocused && editingState !== null && Object.is(editingState.base, value) ? editingState.text : null;
	const displayValue = isFocused
		? (activeDraft ?? (value === null ? "" : String(value)))
		: formatAmount(value, formatLocale, decimals);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (disabled || readOnly) return;
		const clean = sanitizeCurrencyText(e.target.value, decimals, allowNegative);
		if (clean === "") {
			setEditingState({ base: null, text: "" });
			if (!Object.is(value, null)) {
				onChange(null);
			}
			return;
		}

		const parsed = parseAmount(clean);
		if (parsed === null) {
			// Keep partial minus/decimal sign while typing without destroying existing form value.
			setEditingState({ base: value, text: clean });
			return;
		}

		const normalized = roundToDecimals(parsed, decimals);
		setEditingState({ base: normalized, text: clean });
		if (!Object.is(normalized, value)) {
			onChange(normalized);
		}
	};

	const handleFocus = () => {
		setIsFocused(true);
		setEditingState({ base: value, text: value === null ? "" : String(value) });
	};

	const handleBlur = () => {
		const parsedFromDraft = activeDraft !== null ? parseAmount(activeDraft) : value;
		setIsFocused(false);
		setEditingState(null);

		if (parsedFromDraft !== null) {
			let normalized = roundToDecimals(parsedFromDraft, decimals);
			if (min !== undefined && normalized < min) normalized = min;
			if (max !== undefined && normalized > max) normalized = max;
			if (!Object.is(normalized, value)) {
				onChange(normalized);
			}
		}
		onBlur?.();
	};

	const hasMultiCurrency = Boolean(currencies && currencies.length > 1);

	return (
		<InputGroup className="w-full">
			{hasMultiCurrency ? (
				<InputGroupAddon align="inline-start" className="p-0">
					<Select value={currency} onValueChange={onCurrencyChange} disabled={disabled || readOnly}>
						<SelectTrigger
							aria-label={t("currency_selector")}
							className="h-full rounded-r-none border-0 bg-transparent px-2.5 font-mono text-xs font-semibold shadow-none"
						>
							<SelectValue>{currency}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{currencies!.map((curr) => (
									<SelectItem key={curr} value={curr} className="font-mono text-xs font-medium">
										{curr}
									</SelectItem>
								))}
							</SelectGroup>
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
				aria-required={required}
				aria-describedby={describedBy}
				className={cn("font-mono text-xs", inputClassName)}
			/>

			{!hasMultiCurrency && currency ? (
				<InputGroupAddon align="inline-end">
					<InputGroupText className="text-muted-foreground font-mono text-xs font-medium select-none">
						{currency}
					</InputGroupText>
				</InputGroupAddon>
			) : null}
		</InputGroup>
	);
}

export const CurrencyInput = connectField<number | null, CurrencyExtraProps>(CurrencyInputInner, {
	defaultValue: null,
});
