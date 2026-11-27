"use client";

import type { MouseEvent, ReactNode } from "react";

import { LabelHelpTooltip } from "@/components/shared/LabelHelpTooltip";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { cn } from "cn";

export function ChoiceCardField({
	optionId,
	label,
	description,
	icon,
	selected,
	hasError,
	disabled,
	controlRole,
	onToggleCard,
	control,
}: {
	optionId: string;
	label: ReactNode;
	description?: ReactNode;
	icon?: ReactNode;
	selected: boolean;
	hasError?: boolean;
	disabled?: boolean;
	controlRole: "checkbox" | "radio";
	onToggleCard: () => void;
	control: ReactNode;
}) {
	const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
		if (disabled) return;
		const target = e.target as HTMLElement | null;
		if (target?.closest(`[role="${controlRole}"], button, label`)) return;
		onToggleCard();
	};

	return (
		<Field
			orientation="horizontal"
			data-invalid={hasError || undefined}
			data-disabled={disabled || undefined}
			onClick={handleCardClick}
			className={cn(
				"border-input bg-card/30 cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors select-none",
				selected && "border-primary/60 bg-primary/5 ring-primary/20 ring-1",
				hasError && "border-destructive/60",
				disabled && "pointer-events-none cursor-not-allowed opacity-50",
			)}
		>
			{control}
			<FieldContent className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					{icon ? <span className="shrink-0">{icon}</span> : null}
					<FieldLabel htmlFor={optionId} className="text-foreground cursor-pointer text-xs font-semibold">
						{label}
					</FieldLabel>
				</div>
				{description ? (
					<FieldDescription className="text-muted-foreground text-xs leading-relaxed">{description}</FieldDescription>
				) : null}
			</FieldContent>
		</Field>
	);
}

export function InlineChoiceRow({
	id,
	label,
	required,
	hint,
	tooltip,
	description,
	descriptionId,
	hasError,
	disabled,
	alignControl = "start",
	control,
	containerClassName,
}: {
	id: string;
	label?: ReactNode;
	required?: boolean;
	hint?: ReactNode;
	tooltip?: ReactNode;
	description?: ReactNode;
	descriptionId?: string;
	hasError?: boolean;
	disabled?: boolean;
	alignControl?: "start" | "end";
	control: ReactNode;
	containerClassName?: string;
}) {
	const labelContent = (
		<FieldContent className="min-w-0 flex-1">
			<div className="flex items-center gap-1.5">
				<FieldLabel
					htmlFor={id}
					className={cn(
						"cursor-pointer text-xs leading-none font-semibold tracking-tight select-none",
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
				{tooltip ? <LabelHelpTooltip content={tooltip} /> : null}
				{hint ? <span className="text-muted-foreground ml-1 text-xs font-normal">{hint}</span> : null}
			</div>
			{description ? (
				<FieldDescription id={descriptionId} className="text-muted-foreground text-xs leading-relaxed">
					{description}
				</FieldDescription>
			) : null}
		</FieldContent>
	);

	return (
		<Field
			orientation="horizontal"
			data-invalid={hasError || undefined}
			data-disabled={disabled || undefined}
			className={containerClassName}
		>
			{alignControl === "start" ? (
				<>
					{control}
					{labelContent}
				</>
			) : (
				<>
					{labelContent}
					{control}
				</>
			)}
		</Field>
	);
}
