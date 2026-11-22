"use client";

import { useMemoizedFn } from "ahooks";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Fragment } from "react";

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
	if (separator === false) {
		return [Array.from({ length }, (_, i) => i)];
	}
	const result: number[][] = [];
	const effectiveGroupSize = groupSize > 0 && groupSize < length ? groupSize : length;
	for (let i = 0; i < length; i += effectiveGroupSize) {
		const group: number[] = [];
		for (let j = i; j < Math.min(i + effectiveGroupSize, length); j++) {
			group.push(j);
		}
		result.push(group);
	}
	return result;
}

const OtpControl = function OtpControl({
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
	onComplete,
	containerClassName,
	slotClassName,
	hasError,
	describedBy,
}: FormFieldRenderProps<string> & OtpExtraProps) {
	const safeValue = typeof value === "string" ? value : "";
	const handleValueChange = useMemoizedFn((nextValue: string) => {
		onChange(nextValue);
		if (nextValue.length === length) {
			onComplete?.(nextValue);
		}
	});

	const groups = buildOtpGroups(length, groupSize, separator);

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
				maxLength={length}
				value={safeValue}
				onChange={handleValueChange}
				onBlur={onBlur}
				pattern={pattern}
				autoFocus={autoFocus}
				disabled={disabled || readOnly}
				aria-invalid={hasError}
				aria-describedby={describedBy}
				containerClassName={cn(align === "center" && "justify-center", align === "right" && "justify-end")}
			>
				{groups.map((group, groupIdx) => (
					<Fragment key={groupIdx}>
						{groupIdx > 0 && separator && <InputOTPSeparator />}
						<InputOTPGroup>
							{group.map((slotIdx) => (
								<InputOTPSlot
									key={slotIdx}
									index={slotIdx}
									className={cn(
										hasError && "border-destructive text-destructive",
										mask && "tracking-widest",
										slotClassName,
									)}
								/>
							))}
						</InputOTPGroup>
					</Fragment>
				))}
			</InputOTP>
		</div>
	);
};

export const OtpInput = connectField<string, OtpExtraProps>(OtpControl, { defaultValue: "" });
