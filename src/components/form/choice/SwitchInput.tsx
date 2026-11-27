"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine } from "../core";
import { InlineChoiceRow } from "./ChoiceHelpers";

export interface SwitchInputProps extends BaseInputProps {
	value?: boolean;
	defaultValue?: boolean;
	onChange?: (checked: boolean) => void;
	onBlur?: () => void;
	/** 是否以内联卡片形式排版 (Switch 居右，Label 和辅助文本居左) */
	inline?: boolean;
	/** 开关右侧伴随文本 */
	onLabel?: string;
	offLabel?: string;
}

// 使用 FormFieldEngine 直接接管水平卡片内联标签排版（inline=true 时由 Switch 自身渲染 Label 与 helperText）
export function SwitchInput({
	label,
	required,
	hint,
	helperText,
	tooltip,
	defaultValue = false,
	inline = true,
	onLabel,
	offLabel,
	...fieldProps
}: SwitchInputProps) {
	return (
		<FormFieldEngine<boolean>
			defaultValue={defaultValue}
			label={inline ? undefined : label}
			required={inline ? undefined : required}
			hint={inline ? undefined : hint}
			helperText={inline ? undefined : helperText}
			tooltip={inline ? undefined : tooltip}
			{...fieldProps}
		>
			{({ id, value = false, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => {
				const isChecked = Boolean(value);
				const stateLabel = isChecked ? onLabel : offLabel;

				if (inline) {
					const inlineDescId = helperText ? `${id}-desc` : undefined;
					const inlineDescribedBy = [describedBy, inlineDescId].filter(Boolean).join(" ") || undefined;

					return (
						<InlineChoiceRow
							id={id}
							label={label}
							required={required}
							hint={hint}
							tooltip={tooltip}
							description={helperText}
							descriptionId={inlineDescId}
							hasError={hasError}
							disabled={isDisabled}
							alignControl="end"
							containerClassName={cn(
								"border-input bg-card/20 flex items-center justify-between gap-4 rounded-lg border p-3 select-none",
								hasError && "border-destructive/60",
							)}
							control={
								<div className="flex shrink-0 items-center gap-2">
									{stateLabel ? <span className="text-muted-foreground text-xs">{stateLabel}</span> : null}
									<Switch
										id={id}
										checked={isChecked}
										onCheckedChange={(checked) => {
											if (!isReadOnly) onChange(checked);
										}}
										onBlur={onBlur}
										disabled={isDisabled}
										aria-readonly={isReadOnly || undefined}
										aria-invalid={hasError || undefined}
										aria-describedby={inlineDescribedBy}
									/>
								</div>
							}
						/>
					);
				}

				return (
					<div className="flex items-center gap-2 pt-1">
						<Switch
							id={id}
							checked={isChecked}
							onCheckedChange={(checked) => {
								if (!isReadOnly) onChange(checked);
							}}
							onBlur={onBlur}
							disabled={isDisabled}
							aria-readonly={isReadOnly || undefined}
							aria-invalid={hasError || undefined}
							aria-describedby={describedBy}
						/>
						{stateLabel ? <span className="text-muted-foreground text-xs">{stateLabel}</span> : null}
					</div>
				);
			}}
		</FormFieldEngine>
	);
}
SwitchInput.displayName = "SwitchInput";
