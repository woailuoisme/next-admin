"use client";

import { ArrowUpSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ChangeEvent, type KeyboardEvent, useState } from "react";

import { InputGroupAddon } from "@/components/ui/input-group";

import {
	AdornedInput,
	type BaseInputProps,
	connectField,
	type FormFieldRenderProps,
	type PasswordRequirement,
} from "../core";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

export interface PasswordInputProps extends BaseInputProps {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	onBlur?: () => void;
	clearable?: boolean;
	showStrength?: boolean;
	requirements?: PasswordRequirement[];
	inputClassName?: string;
	autoComplete?: string;
}

type PasswordExtraProps = Pick<
	PasswordInputProps,
	"placeholder" | "clearable" | "showStrength" | "requirements" | "inputClassName" | "autoComplete"
>;

function PasswordInputInner({
	id,
	value: rawValue,
	onChange,
	onBlur,
	placeholder,
	disabled,
	readOnly,
	required,
	clearable = false,
	showStrength = false,
	requirements,
	inputClassName,
	autoComplete = "current-password",
	hasError,
	describedBy,
}: FormFieldRenderProps<string> & PasswordExtraProps) {
	const value = typeof rawValue === "string" ? rawValue : "";
	const t = useTranslations("form");
	const resolvedPlaceholder = placeholder ?? t("password_placeholder");
	const [capsLockActive, setCapsLockActive] = useState(false);

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
	};

	const handleClear = () => {
		onChange("");
	};

	const checkCapsLock = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.getModifierState) {
			setCapsLockActive(e.getModifierState("CapsLock"));
		}
	};

	const handleBlur = () => {
		setCapsLockActive(false);
		onBlur?.();
	};

	const hasValue = value.length > 0;

	return (
		<div className="flex w-full flex-col gap-2">
			<AdornedInput
				id={id}
				isPassword
				value={value}
				onChange={handleInputChange}
				onClear={handleClear}
				onKeyDown={checkCapsLock}
				onKeyUp={checkCapsLock}
				onBlur={handleBlur}
				placeholder={resolvedPlaceholder}
				disabled={disabled}
				readOnly={readOnly}
				required={required}
				clearable={clearable}
				autoComplete={autoComplete}
				hasError={hasError}
				describedBy={describedBy}
				inputClassName={inputClassName}
				clearAriaLabel={t("password_clear")}
				showPasswordLabel={t("password_show")}
				hidePasswordLabel={t("password_hide")}
				extraEndAddon={
					capsLockActive && !disabled ? (
						<InputGroupAddon align="inline-end" role="status" title={t("password_caps_lock")} className="text-chart-4">
							<ArrowUpSquare className="size-3.5 animate-pulse" aria-hidden="true" />
							<span className="sr-only">{t("password_caps_lock")}</span>
						</InputGroupAddon>
					) : null
				}
			/>

			{showStrength && hasValue ? <PasswordStrengthMeter password={value} requirements={requirements} /> : null}
		</div>
	);
}

export const PasswordInput = connectField<string, PasswordExtraProps>(PasswordInputInner, {
	defaultValue: "",
});
