"use client";

import { OTPInputContext, REGEXP_ONLY_DIGITS } from "input-otp";
import { Fragment, useContext } from "react";

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "cn";

import { type ConnectedFieldProps, connectField, type FormFieldRenderProps } from "../core";

export interface OtpExtraProps {
	length?: number;
	groupSize?: number;
	separator?: boolean;
	mask?: boolean;
	numericOnly?: boolean;
	autoFocus?: boolean;
	onComplete?: (code: string) => void;
	containerClassName?: string;
	slotClassName?: string;
}

export type OtpInputProps = ConnectedFieldProps<string> & OtpExtraProps;

function buildOtpGroups(length: number, groupSize: number, separator: boolean): number[][] {
	const safeLength = Math.max(1, Math.floor(length));
	if (separator === false) {
		return [Array.from({ length: safeLength }, (_, i) => i)];
	}
	const result: number[][] = [];
	const safeGroupSize = Math.floor(groupSize);
	const effectiveGroupSize = safeGroupSize > 0 && safeGroupSize < safeLength ? safeGroupSize : safeLength;
	for (let i = 0; i < safeLength; i += effectiveGroupSize) {
		const group: number[] = [];
		for (let j = i; j < Math.min(i + effectiveGroupSize, safeLength); j++) {
			group.push(j);
		}
		result.push(group);
	}
	return result;
}

function MaskedOtpSlot({ index, hasError, className }: { index: number; hasError?: boolean; className?: string }) {
	const inputOTPContext = useContext(OTPInputContext);
	const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

	return (
		<div
			data-slot="input-otp-slot"
			data-active={isActive}
			aria-invalid={hasError || undefined}
			className={cn(
				"border-input relative flex size-8 items-center justify-center border-y border-r text-sm tracking-widest transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20",
				hasError && "border-destructive text-destructive data-[active=true]:border-destructive",
				className,
			)}
		>
			{char ? "•" : null}
			{hasFakeCaret ? (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="bg-foreground animate-caret-blink h-4 w-px duration-1000" />
				</div>
			) : null}
		</div>
	);
}

function OtpControl({
	id,
	value = "",
	onChange,
	onBlur,
	length = 6,
	groupSize = 3,
	separator = true,
	align = "left",
	mask = false,
	numericOnly = true,
	autoFocus = false,
	disabled = false,
	readOnly = false,
	required,
	onComplete,
	containerClassName,
	slotClassName,
	hasError,
	describedBy,
}: FormFieldRenderProps<string> & OtpExtraProps) {
	const safeLength = Math.max(1, Math.floor(length));
	const safeValue = typeof value === "string" ? value : "";

	const handleValueChange = (nextValue: string) => {
		if (disabled || readOnly) return;
		onChange(nextValue);
		if (nextValue.length === safeLength) {
			onComplete?.(nextValue);
		}
	};

	const groups = buildOtpGroups(safeLength, groupSize, separator);
	const pattern = numericOnly ? REGEXP_ONLY_DIGITS : undefined;

	return (
		<div
			className={cn(
				"flex flex-col py-0.5",
				align === "center" ? "items-center" : align === "right" ? "items-end" : "items-start",
				containerClassName,
			)}
		>
			<InputOTP
				id={id}
				maxLength={safeLength}
				value={safeValue}
				onChange={handleValueChange}
				onBlur={onBlur}
				pattern={pattern}
				autoFocus={autoFocus}
				disabled={disabled}
				readOnly={readOnly}

				aria-invalid={hasError}
				aria-required={required}
				aria-describedby={describedBy}
				containerClassName={cn(
					align === "center" && "justify-center",
					align === "right" && "justify-end",
					readOnly && "pointer-events-none select-none",
				)}
			>
				{groups.map((group, groupIdx) => (
					<Fragment key={groupIdx}>
						{groupIdx > 0 && separator ? <InputOTPSeparator /> : null}
						<InputOTPGroup>
							{group.map((slotIdx) =>
								mask ? (
									<MaskedOtpSlot key={slotIdx} index={slotIdx} hasError={hasError} className={slotClassName} />
								) : (
									<InputOTPSlot
										key={slotIdx}
										index={slotIdx}
										aria-invalid={hasError || undefined}
										className={cn(
											hasError && "border-destructive text-destructive data-[active=true]:border-destructive",
											slotClassName,
										)}
									/>
								),
							)}
						</InputOTPGroup>
					</Fragment>
				))}
			</InputOTP>
		</div>
	);
}

export const OtpInput = connectField<string, OtpExtraProps>(OtpControl, { defaultValue: "" });
