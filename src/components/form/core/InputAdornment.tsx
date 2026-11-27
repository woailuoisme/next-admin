"use client";

import { useTranslations } from "next-intl";
import { Eye, EyeOff, X } from "lucide-react";
import { type ChangeEvent, type FocusEvent, type KeyboardEvent, type ReactNode, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import { cn } from "cn";

export interface FieldClearButtonProps {
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
	ariaLabel?: string;
	className?: string;
}

export function FieldClearButton({ onClick, ariaLabel, className }: FieldClearButtonProps) {
	const t = useTranslations("form");
	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-xs"
			onClick={onClick}
			aria-label={ariaLabel ?? t("clear_value")}
			className={cn(
				"text-muted-foreground hover:text-foreground relative cursor-pointer rounded-full after:absolute after:-inset-1 after:content-['']",
				className,
			)}
		>
			<X className="size-3" aria-hidden="true" />
		</Button>
	);
}

export interface AdornedInputProps {
	id: string;
	type?: string;
	value?: string | number;
	onChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onClear?: () => void;
	onBlur?: (e?: FocusEvent<HTMLElement>) => void;
	onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
	onKeyUp?: (e: KeyboardEvent<HTMLInputElement>) => void;
	placeholder?: string;
	disabled?: boolean;
	readOnly?: boolean;
	required?: boolean;
	clearable?: boolean;
	isPassword?: boolean;
	prefix?: ReactNode;
	suffix?: ReactNode;
	extraEndAddon?: ReactNode;
	min?: number;
	max?: number;
	step?: number;
	autoComplete?: string;
	inputMode?: "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
	hasError?: boolean;
	describedBy?: string;
	inputClassName?: string;
	clearAriaLabel?: string;
	showPasswordLabel?: string;
	hidePasswordLabel?: string;
}

function isRenderableAddon(node: ReactNode): boolean {
	return node !== undefined && node !== null && node !== false;
}

export function AdornedInput({
	id,
	type = "text",
	value,
	onChange,
	onClear,
	onBlur,
	onKeyDown,
	onKeyUp,
	placeholder,
	disabled,
	readOnly,
	required,
	clearable,
	isPassword,
	prefix,
	suffix,
	extraEndAddon,
	min,
	max,
	step,
	autoComplete,
	inputMode,
	hasError,
	describedBy,
	inputClassName,
	clearAriaLabel,
	showPasswordLabel,
	hidePasswordLabel,
}: AdornedInputProps) {
	const t = useTranslations("form");
	const inputRef = useRef<HTMLInputElement>(null);
	const resolvedClearLabel = clearAriaLabel ?? t("clear_value");
	const resolvedShowPasswordLabel = showPasswordLabel ?? t("password_show");
	const resolvedHidePasswordLabel = hidePasswordLabel ?? t("password_hide");
	const [showPassword, setShowPassword] = useState(false);

	const currentType = isPassword ? (showPassword ? "text" : "password") : type;
	const hasValue = value != null && value !== "";
	const canClear = Boolean(clearable && onClear && hasValue && !disabled && !readOnly);
	const hasPrefix = isRenderableAddon(prefix);
	const hasSuffix = isRenderableAddon(suffix);
	const hasExtraEnd = isRenderableAddon(extraEndAddon);
	const hasAdornments = hasPrefix || hasSuffix || canClear || Boolean(isPassword) || hasExtraEnd;

	const handleGroupBlur = (e: FocusEvent<HTMLDivElement>) => {
		if (onBlur && !e.currentTarget.contains(e.relatedTarget)) {
			onBlur(e);
		}
	};

	const handleClearClick = () => {
		onClear?.();
		inputRef.current?.focus();
	};

	if (!hasAdornments) {
		return (
			<Input
				ref={inputRef}
				id={id}
				type={currentType}
				value={value ?? ""}
				onChange={onChange}
				onBlur={onBlur}
				onKeyDown={onKeyDown}
				onKeyUp={onKeyUp}
				placeholder={placeholder}
				disabled={disabled}
				readOnly={readOnly}

				min={min}
				max={max}
				step={step}
				autoComplete={autoComplete}
				inputMode={inputMode}
				aria-invalid={hasError}
				aria-required={required}
				aria-describedby={describedBy}
				className={inputClassName}
			/>
		);
	}

	return (
		<InputGroup onBlur={handleGroupBlur} className="w-full">
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
				ref={inputRef}
				id={id}
				type={currentType}
				value={value ?? ""}
				onChange={onChange}
				onKeyDown={onKeyDown}
				onKeyUp={onKeyUp}
				placeholder={placeholder}
				disabled={disabled}
				readOnly={readOnly}

				min={min}
				max={max}
				step={step}
				autoComplete={autoComplete}
				inputMode={inputMode}
				aria-invalid={hasError}
				aria-required={required}
				aria-describedby={describedBy}
				className={inputClassName}
			/>

			{hasExtraEnd ? extraEndAddon : null}

			{canClear ? (
				<InputGroupAddon align="inline-end">
					<InputGroupButton
						type="button"
						size="icon-xs"
						variant="ghost"
						onClick={handleClearClick}
						aria-label={resolvedClearLabel}
					>
						<X className="size-3" aria-hidden="true" />
					</InputGroupButton>
				</InputGroupAddon>
			) : null}

			{isPassword && !disabled ? (
				<InputGroupAddon align="inline-end">
					<InputGroupButton
						type="button"
						size="icon-xs"
						variant="ghost"
						onClick={() => setShowPassword((prev) => !prev)}
						aria-label={showPassword ? resolvedHidePasswordLabel : resolvedShowPasswordLabel}
						aria-pressed={showPassword}
					>
						{showPassword ? (
							<EyeOff className="size-3.5" aria-hidden="true" />
						) : (
							<Eye className="size-3.5" aria-hidden="true" />
						)}
					</InputGroupButton>
				</InputGroupAddon>
			) : null}

			{hasSuffix ? (
				<InputGroupAddon align="inline-end">
					{typeof suffix === "string" || typeof suffix === "number" ? (
						<InputGroupText>{suffix}</InputGroupText>
					) : (
						suffix
					)}
				</InputGroupAddon>
			) : null}
		</InputGroup>
	);
}
