"use client";

import { useMemoizedFn } from "ahooks";
import { ArrowUpSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ChangeEvent, type KeyboardEvent, useState } from "react";

import { InputGroupAddon } from "@/components/ui/input-group";
import { cn } from "cn";

import { AdornedInput, type BaseInputProps, connectField, type PasswordRequirement } from "../core";
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

interface PasswordInputInnerProps {
	id: string;
	value?: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	disabled?: boolean;
	readOnly?: boolean;
	clearable?: boolean;
	showStrength?: boolean;
	requirements?: PasswordRequirement[];
	inputClassName?: string;
	autoComplete?: string;
	hasError?: boolean;
	describedBy?: string;
}

function PasswordInputInner({
	id,
	value: rawValue,
	onChange,
	onBlur,
	placeholder,
	disabled,
	readOnly,
	clearable = false,
	showStrength = false,
	requirements,
	inputClassName,
	autoComplete = "current-password",
	hasError,
	describedBy,
}: PasswordInputInnerProps) {
	const value = typeof rawValue === "string" ? rawValue : "";
	const t = useTranslations("form");
	const resolvedPlaceholder = placeholder ?? t("password_placeholder");
	const [capsLockActive, setCapsLockActive] = useState(false);

	const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
	});

	const handleClear = useMemoizedFn(() => {
		onChange("");
	});

	const checkCapsLock = useMemoizedFn((e: KeyboardEvent<HTMLInputElement>) => {
		if (e.getModifierState) {
			setCapsLockActive(e.getModifierState("CapsLock"));
		}
	});

	const handleBlur = useMemoizedFn(() => {
		setCapsLockActive(false);
		onBlur?.();
	});

	const stringVal = value ?? "";
	const hasValue = stringVal.length > 0;

	return (
		<div className="w-full space-y-2">
			<AdornedInput
				id={id}
				isPassword
				value={stringVal}
				onChange={handleInputChange}
				onClear={handleClear}
				onKeyDown={checkCapsLock}
				onKeyUp={checkCapsLock}
				onBlur={handleBlur}
				placeholder={resolvedPlaceholder}
				disabled={disabled}
				readOnly={readOnly}
				clearable={clearable}
				autoComplete={autoComplete}
				hasError={hasError}
				describedBy={describedBy}
				inputClassName={cn("pr-2 text-xs", inputClassName)}
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

			{showStrength && hasValue && (
				<div className="pt-1">
					<PasswordStrengthMeter password={stringVal} requirements={requirements} />
				</div>
			)}
		</div>
	);
}

type PasswordExtraProps = Pick<
	PasswordInputProps,
	"placeholder" | "clearable" | "showStrength" | "requirements" | "inputClassName" | "autoComplete"
>;

export const PasswordInput = connectField<string, PasswordExtraProps>(PasswordInputInner, {
	defaultValue: "",
});
