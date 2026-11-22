"use client";

import { type MouseEvent } from "react";

import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "cn";

import {
	type BaseInputProps,
	connectField,
	createContainerBlurHandler,
	type FormFieldRenderProps,
	type SelectOption,
} from "../core";

const EMPTY_OPTIONS: SelectOption<any>[] = [];

export interface RadioGroupInputProps<TValue extends string | number = string> extends BaseInputProps {
	options: SelectOption<TValue>[];
	value?: TValue;
	defaultValue?: TValue;
	onChange?: (value: TValue) => void;
	onBlur?: () => void;
	direction?: "horizontal" | "vertical";
	card?: boolean;
}

interface RadioGroupExtraProps<TValue extends string | number = string> {
	options: SelectOption<TValue>[];
	direction?: "horizontal" | "vertical";
	card?: boolean;
}

function RadioGroupInputComponent<TValue extends string | number = string>({
	id,
	value,
	onChange,
	disabled: isDisabled,
	readOnly: isReadOnly,
	hasError,
	describedBy,
	onBlur,
	options = EMPTY_OPTIONS as SelectOption<TValue>[],
	direction = "vertical",
	card = false,
}: FormFieldRenderProps<TValue> & RadioGroupExtraProps<TValue>) {
	const stringValue = value !== undefined && value !== null ? String(value) : "";
	const groupLocked = Boolean(isDisabled || isReadOnly);

	const handleValueChange = (val: string) => {
		if (groupLocked) return;
		const matched = options.find((o) => String(o.value) === val);
		onChange(matched ? matched.value : (val as unknown as TValue));
	};

	return (
		<RadioGroup
			id={id}
			value={stringValue}
			onValueChange={handleValueChange}
			onBlur={createContainerBlurHandler(onBlur)}
			disabled={groupLocked}
			aria-invalid={hasError}
			aria-describedby={describedBy}
			className={cn("pt-1", direction === "horizontal" ? "flex-row flex-wrap items-center gap-4" : "space-y-2")}
		>
			<FieldGroup data-slot="radio-group" className="w-full gap-2">
				{options.map((option) => {
					const optionId = `${id}-${String(option.value)}`;
					const isSelected = String(option.value) === stringValue;
					const itemDisabled = groupLocked || Boolean(option.disabled);

					if (card) {
						const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
							if (itemDisabled) return;
							const target = e.target as HTMLElement | null;
							if (target?.closest('[role="radio"], button, label')) return;
							handleValueChange(String(option.value));
						};

						return (
							<Field
								key={String(option.value)}
								orientation="horizontal"
								onClick={handleCardClick}
								className={cn(
									"cursor-pointer items-start gap-3 rounded-lg border border-input bg-card/30 p-3 transition-colors select-none",
									isSelected && "border-primary/60 bg-primary/5 ring-1 ring-primary/20",
									hasError && "border-destructive/60",
									itemDisabled && "pointer-events-none cursor-not-allowed opacity-50",
								)}
							>
								<RadioGroupItem id={optionId} value={String(option.value)} disabled={itemDisabled} className="mt-0.5" />
								<FieldContent className="min-w-0 flex-1 space-y-0.5">
									<div className="flex items-center gap-1.5">
										{"icon" in option && option.icon}
										<FieldLabel htmlFor={optionId} className="text-foreground cursor-pointer text-xs font-semibold">
											{option.label}
										</FieldLabel>
									</div>
									{option.description && (
										<FieldDescription className="text-muted-foreground text-[11px] leading-relaxed">
											{option.description}
										</FieldDescription>
									)}
								</FieldContent>
							</Field>
						);
					}

					return (
						<Field key={String(option.value)} orientation="horizontal" className="items-center gap-2">
							<RadioGroupItem id={optionId} value={String(option.value)} disabled={itemDisabled} />
							<FieldLabel
								htmlFor={optionId}
								className="text-foreground flex cursor-pointer items-center gap-1.5 text-xs font-medium select-none"
							>
								{"icon" in option && option.icon}
								<span>{option.label}</span>
							</FieldLabel>
						</Field>
					);
				})}
			</FieldGroup>
		</RadioGroup>
	);
}

export const RadioGroupInput = connectField<string | number, RadioGroupExtraProps<string | number>>(
	RadioGroupInputComponent,
) as <TValue extends string | number = string>(props: RadioGroupInputProps<TValue>) => React.ReactElement;
