"use client";

import { isNil } from "es-toolkit";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import type { TextInputCellProps } from "./types";

import { InlineEditDisplay } from "./InlineEditDisplay";
import { InlineEditInput } from "./InlineEditInput";

function TextInputCellInner<TData = unknown>({
	value,
	row,
	fieldLabel,
	onCellChange,
	type = "text",
	inputMode,
	placeholder,
	prefix,
	suffix,
	schema,
	rules,
	showErrorToast = true,
	errorToastMessage,
	disabled = false,
	align = "left",
	className,
}: TextInputCellProps<TData>) {
	const t = useTranslations("table");
	const resolvedPlaceholder = placeholder ?? t("cell_edit_placeholder");
	const externalVal = !isNil(value) ? String(value) : "";
	const [isEditing, setIsEditing] = useState(false);
	const [currentVal, setCurrentVal] = useState(externalVal);
	const [savedOverride, setSavedOverride] = useState<{ baseValue: unknown; text: string } | null>(null);
	const [loading, setLoading] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | undefined>();

	const savedVal = savedOverride && Object.is(savedOverride.baseValue, value) ? savedOverride.text : externalVal;

	const validateValue = (val: string): string | undefined => {
		if (schema) {
			const parsedInput = type === "number" ? (val.trim() === "" ? null : Number(val)) : val;
			const res = schema.safeParse(parsedInput);
			if (!res.success) {
				const firstIssue = res.error.issues[0];
				return firstIssue?.message || t("cell_edit_invalid");
			}
		}
		if (rules) {
			const ruleResult = rules(val, row);
			if (typeof ruleResult === "string" && ruleResult.length > 0) {
				return ruleResult;
			}
		}
		return undefined;
	};

	const handleChange = (nextVal: string) => {
		setCurrentVal(nextVal);
		if (errorMsg) {
			const err = validateValue(nextVal);
			setErrorMsg(err);
		}
	};

	const commitChange = async () => {
		if (disabled || loading) return;
		const normalizedVal = type === "number" ? currentVal.trim() : currentVal;
		if (normalizedVal === savedVal) {
			setErrorMsg(undefined);
			setIsEditing(false);
			return;
		}

		const validationErr = validateValue(normalizedVal);
		if (validationErr) {
			setErrorMsg(validationErr);
			return;
		}

		setErrorMsg(undefined);
		setIsEditing(false);
		const previous = savedVal;
		setSavedOverride({ baseValue: value, text: normalizedVal });

		if (onCellChange) {
			try {
				setLoading(true);
				const result = onCellChange(row, normalizedVal);
				if (result instanceof Promise) {
					await result;
				}
			} catch (err) {
				// Rollback on error
				setSavedOverride({ baseValue: value, text: previous });
				setCurrentVal(previous);
				if (showErrorToast) {
					const msg =
						typeof errorToastMessage === "function"
							? errorToastMessage(err)
							: errorToastMessage || t("cell_edit_save_error");
					toast.error(msg);
				}
			} finally {
				setLoading(false);
			}
		}
	};

	const cancelChange = () => {
		setErrorMsg(undefined);
		setCurrentVal(savedVal);
		setIsEditing(false);
	};

	const handleStartEdit = () => {
		setCurrentVal(savedVal);
		setErrorMsg(undefined);
		setIsEditing(true);
	};

	if (isEditing && !disabled) {
		return (
			<InlineEditInput
				value={currentVal}
				type={type}
				inputMode={inputMode}
				ariaLabel={fieldLabel ? t("cell_edit_field_aria", { name: fieldLabel }) : t("cell_edit_input_aria")}
				placeholder={resolvedPlaceholder}
				prefix={prefix}
				suffix={suffix}
				error={errorMsg}
				onChange={handleChange}
				onCommit={commitChange}
				onCancel={cancelChange}
				className={className}
			/>
		);
	}

	return (
		<InlineEditDisplay
			value={savedVal}
			placeholder={resolvedPlaceholder}
			disabled={disabled}
			loading={loading}
			align={align}
			className={className}
			onStartEdit={handleStartEdit}
		/>
	);
}

export const TextInputCell = TextInputCellInner as typeof TextInputCellInner;
