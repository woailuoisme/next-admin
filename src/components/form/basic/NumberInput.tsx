"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ChangeEvent, type KeyboardEvent, type ReactNode, useState } from "react";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import { cn } from "cn";

import { type BaseInputProps, connectField, type FormFieldRenderProps } from "../core";

export interface NumberInputProps extends BaseInputProps {
	value?: number | null;
	defaultValue?: number | null;
	onChange?: (value: number | null) => void;
	onBlur?: () => void;
	min?: number;
	max?: number;
	step?: number;
	prefix?: ReactNode;
	suffix?: ReactNode;
	steppers?: boolean;
	inputClassName?: string;
}

type NumberExtraProps = Pick<
	NumberInputProps,
	"min" | "max" | "step" | "prefix" | "suffix" | "steppers" | "placeholder" | "inputClassName"
>;

interface NumberEditingState {
	base: number | null;
	text: string;
}

function getDecimalPrecision(num: number): number {
	const str = String(num);
	if (str.includes("e-")) {
		const [coeff, exp] = str.split("e-");
		const fracLen = coeff?.split(".")[1]?.length ?? 0;
		return fracLen + Number(exp || 0);
	}
	return str.split(".")[1]?.length ?? 0;
}

function roundWithStepPrecision(next: number, current: number, step: number): number {
	const precision = Math.min(10, Math.max(getDecimalPrecision(current), getDecimalPrecision(step)));
	return Number(next.toFixed(precision));
}

function sanitizeNumericText(raw: string): string {
	let cleaned = "";
	let hasDot = false;
	for (let i = 0; i < raw.length; i++) {
		const ch = raw[i];
		if (ch >= "0" && ch <= "9") {
			cleaned += ch;
		} else if (ch === "-" && i === 0 && !cleaned.includes("-")) {
			cleaned += ch;
		} else if (ch === "." && !hasDot) {
			hasDot = true;
			cleaned += ch;
		}
	}
	return cleaned;
}

function parseFiniteNumber(raw: string): number | null {
	if (raw === "" || raw === "-" || raw === "." || raw === "-.") return null;
	const parsed = Number(raw);
	return Number.isFinite(parsed) ? parsed : null;
}

function isRenderableAddon(node: ReactNode): boolean {
	return node !== undefined && node !== null && node !== false;
}

function NumberInputControl({
	id,
	value: rawValue,
	onChange,
	onBlur,
	min,
	max,
	step = 1,
	prefix,
	suffix,
	steppers = true,
	disabled,
	readOnly,
	required,
	placeholder = "0",
	hasError,
	describedBy,
	inputClassName,
}: FormFieldRenderProps<number | null> & NumberExtraProps) {
	const t = useTranslations("form");
	const isLocked = Boolean(disabled || readOnly);
	const finiteValue = typeof rawValue === "number" && Number.isFinite(rawValue) ? rawValue : null;
	const [isFocused, setIsFocused] = useState(false);
	const [editingState, setEditingState] = useState<NumberEditingState | null>(null);

	const activeDraft =
		isFocused && editingState !== null && Object.is(editingState.base, finiteValue) ? editingState.text : null;
	const displayValue = activeDraft ?? (finiteValue === null ? "" : String(finiteValue));

	const commitChange = (nextVal: number | null, draftText?: string) => {
		if (draftText !== undefined) {
			setEditingState({ base: nextVal, text: draftText });
		}
		if (!Object.is(nextVal, finiteValue)) {
			onChange(nextVal);
		}
	};

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (isLocked) return;
		const clean = sanitizeNumericText(e.target.value);
		if (clean === "") {
			commitChange(null, "");
			return;
		}
		const parsed = parseFiniteNumber(clean);
		if (parsed === null) {
			// Keep partial numeric draft such as "-" or "1." without clearing the value.
			setEditingState({ base: finiteValue, text: clean });
			return;
		}
		commitChange(parsed, clean);
	};

	const handleFocus = () => {
		setIsFocused(true);
		setEditingState({ base: finiteValue, text: finiteValue === null ? "" : String(finiteValue) });
	};

	const handleBlur = () => {
		const draftParsed = activeDraft !== null ? parseFiniteNumber(activeDraft) : finiteValue;
		setIsFocused(false);
		setEditingState(null);

		if (draftParsed !== null) {
			let clamped = draftParsed;
			if (min !== undefined && clamped < min) clamped = min;
			if (max !== undefined && clamped > max) clamped = max;
			if (!Object.is(clamped, finiteValue)) {
				onChange(clamped);
			}
		} else if (activeDraft !== null && activeDraft !== "" && finiteValue !== null) {
			// Revert dangling "-" / "." draft back to the persisted number on blur.
			setEditingState(null);
		}
		onBlur?.();
	};

	const stepUp = () => {
		if (isLocked) return;
		const current = finiteValue ?? 0;
		let next = roundWithStepPrecision(current + step, current, step);
		if (min !== undefined && next < min) next = min;
		if (max !== undefined && next > max) {
			if (finiteValue === null && max >= (min ?? -Infinity)) {
				next = max;
			} else {
				return;
			}
		}
		setEditingState(null);
		onChange(next);
	};

	const stepDown = () => {
		if (isLocked) return;
		const current = finiteValue ?? 0;
		let next = roundWithStepPrecision(current - step, current, step);
		if (max !== undefined && next > max) next = max;
		if (min !== undefined && next < min) {
			if (finiteValue === null && min <= (max ?? Infinity)) {
				next = min;
			} else {
				return;
			}
		}
		setEditingState(null);
		onChange(next);
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (isLocked) return;
		if (e.key === "ArrowUp") {
			e.preventDefault();
			stepUp();
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			stepDown();
		}
	};

	const hasPrefix = isRenderableAddon(prefix);
	const hasSuffix = isRenderableAddon(suffix);
	const showSteppers = steppers && !isLocked;
	const decreaseDisabled = finiteValue !== null && min !== undefined && finiteValue <= min;
	const increaseDisabled = finiteValue !== null && max !== undefined && finiteValue >= max;

	return (
		<InputGroup className="w-full">
			{hasPrefix ? (
				<InputGroupAddon align="inline-start">
					{typeof prefix === "string" || typeof prefix === "number" ? (
						<InputGroupText>{prefix}</InputGroupText>
					) : (
						prefix
					)}
				</InputGroupAddon>
			) : null}

			<InputGroupInput
				id={id}
				type="text"
				inputMode="decimal"
				role="spinbutton"
				aria-valuemin={min}
				aria-valuemax={max}
				aria-valuenow={finiteValue ?? undefined}
				aria-invalid={hasError}
				aria-required={required}
				aria-describedby={describedBy}
				value={displayValue}
				onChange={handleInputChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				disabled={disabled}
				readOnly={readOnly}

				placeholder={placeholder}
				className={cn("font-mono text-xs tabular-nums", inputClassName)}
			/>

			{hasSuffix ? (
				<InputGroupAddon align="inline-end">
					{typeof suffix === "string" || typeof suffix === "number" ? (
						<InputGroupText>{suffix}</InputGroupText>
					) : (
						suffix
					)}
				</InputGroupAddon>
			) : null}

			{showSteppers ? (
				<InputGroupAddon align="inline-end" className="gap-0.5 pr-1">
					<InputGroupButton
						type="button"
						variant="ghost"
						size="icon-xs"
						aria-label={t("number_decrease")}
						onClick={stepDown}
						disabled={decreaseDisabled}
					>
						<Minus aria-hidden="true" className="size-3" />
					</InputGroupButton>
					<InputGroupButton
						type="button"
						variant="ghost"
						size="icon-xs"
						aria-label={t("number_increase")}
						onClick={stepUp}
						disabled={increaseDisabled}
					>
						<Plus aria-hidden="true" className="size-3" />
					</InputGroupButton>
				</InputGroupAddon>
			) : null}
		</InputGroup>
	);
}

export const NumberInput = connectField<number | null, NumberExtraProps>(NumberInputControl, {
	defaultValue: null,
});
