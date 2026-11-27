"use client";

import { AlertCircle } from "lucide-react";

import { COL_SPAN_CLASSES } from "@/components/shared/grid";
import { LabelHelpTooltip } from "@/components/shared/LabelHelpTooltip";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "cn";

import type { FieldWrapperProps } from "./types";

function isRenderableNode(value: unknown): boolean {
	return value !== undefined && value !== null && value !== false;
}

/**
 * Normalizes TanStack Form / Zod / Standard Schema validation errors to displayable strings.
 */
export function extractErrorMessage(error: unknown): string | undefined {
	if (!error) return undefined;
	if (typeof error === "string") return error;
	if (typeof error === "number" || typeof error === "boolean") return String(error);
	if (Array.isArray(error)) {
		for (const item of error) {
			const extracted = extractErrorMessage(item);
			if (extracted) return extracted;
		}
		return undefined;
	}
	if (error instanceof Error) {
		return error.message || undefined;
	}
	if (typeof error === "object" && error !== null && "message" in error) {
		const message = (error as { message: unknown }).message;
		if (typeof message === "string") return message;
	}
	return undefined;
}

export function FieldWrapper({
	label,
	id,
	required,
	hint,
	helperText,
	tooltip,
	error,
	meta,
	colSpan,
	className,
	hidden,
	disabled,
	children,
	align,
}: FieldWrapperProps) {
	if (hidden) return null;

	const isTouched = Boolean(meta?.isTouched);
	const metaError = isTouched && meta?.errors?.length ? extractErrorMessage(meta.errors) : undefined;
	const resolvedError = error ?? metaError;
	const hasError = Boolean(resolvedError);

	const showLabel = isRenderableNode(label);
	const showTooltip = isRenderableNode(tooltip);
	const showHint = isRenderableNode(hint);
	const showHelperText = isRenderableNode(helperText);

	return (
		<Field
			data-invalid={hasError || undefined}
			data-disabled={disabled || undefined}
			orientation="vertical"
			className={cn(
				"w-full gap-1.5 text-left",
				align === "center" && "items-center text-center",
				align === "right" && "items-end text-right",
				colSpan ? COL_SPAN_CLASSES[colSpan] : "col-span-1",
				className,
			)}
		>
			{showLabel || showTooltip || showHint ? (
				<div
					className={cn(
						"flex items-center gap-2",
						align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-between",
					)}
				>
					<div className="flex items-center gap-1.5">
						{showLabel ? (
							<FieldLabel
								htmlFor={id}
								className={cn(
									"text-xs leading-none font-semibold tracking-tight select-none",
									hasError ? "text-destructive" : "text-foreground",
								)}
							>
								{label}
								{required ? (
									<span aria-hidden="true" className="text-destructive ml-0.5 font-bold">
										*
									</span>
								) : null}
							</FieldLabel>
						) : null}

						{showTooltip ? <LabelHelpTooltip content={tooltip} /> : null}
					</div>

					{showHint ? <div className="text-muted-foreground text-xs font-normal">{hint}</div> : null}
				</div>
			) : null}

			<div
				className={cn("w-full", align === "center" && "flex justify-center", align === "right" && "flex justify-end")}
			>
				{children}
			</div>

			{/* 底部错误提示或辅助文字 */}
			{hasError ? (
				<FieldError
					id={id ? `${id}-error` : undefined}
					className={cn(
						"animate-in text-destructive fade-in-50 flex items-center gap-1 text-xs font-medium duration-150",
						align === "center" && "justify-center",
						align === "right" && "justify-end",
					)}
				>
					<AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
					<span>{resolvedError}</span>
				</FieldError>
			) : showHelperText ? (
				<FieldDescription
					id={id ? `${id}-desc` : undefined}
					className={cn(
						"text-muted-foreground text-xs leading-relaxed",
						align === "center" && "text-center",
						align === "right" && "text-right",
					)}
				>
					{helperText}
				</FieldDescription>
			) : null}
		</Field>
	);
}
