"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { cn } from "cn";

import {
	type BaseInputProps,
	connectField,
	createContainerBlurHandler,
	FormFieldEngine,
	type FormFieldRenderProps,
	type SelectOption,
} from "../core";
import { ChoiceCardField, InlineChoiceRow } from "./ChoiceHelpers";

const EMPTY_OPTIONS: SelectOption[] = [];
const EMPTY_VALUES: (string | number)[] = [];

export interface CheckboxGroupProps extends BaseInputProps {
	options: SelectOption[];
	value?: (string | number)[];
	defaultValue?: (string | number)[];
	onChange?: (value: (string | number)[]) => void;
	onBlur?: () => void;
	direction?: "horizontal" | "vertical";
	card?: boolean;
}

type CheckboxGroupExtraProps = Pick<CheckboxGroupProps, "options" | "direction" | "card">;

function CheckboxGroupControl({
	id,
	value,
	onChange,
	onBlur,
	disabled: isDisabled,
	readOnly: isReadOnly,
	hasError,
	describedBy,
	options = EMPTY_OPTIONS,
	direction = "vertical",
	card = false,
}: FormFieldRenderProps<(string | number)[]> & CheckboxGroupExtraProps) {
	const currentValues = Array.isArray(value) ? value : EMPTY_VALUES;
	const groupLocked = Boolean(isDisabled || isReadOnly);

	const handleToggle = (optionValue: string | number, checked: boolean) => {
		if (groupLocked) return;
		if (checked) {
			if (!currentValues.some((v) => String(v) === String(optionValue))) {
				onChange([...currentValues, optionValue]);
			}
		} else {
			onChange(currentValues.filter((v) => String(v) !== String(optionValue)));
		}
	};

	return (
		<FieldSet disabled={isDisabled} onBlur={createContainerBlurHandler(onBlur)} className="w-full">
			<FieldGroup
				data-slot="checkbox-group"
				role="group"
				aria-describedby={describedBy}
				className={cn("pt-1", direction === "horizontal" ? "flex-row flex-wrap items-center gap-4" : "flex-col gap-2")}
			>
				{options.map((option) => {
					const optionId = `${id}-${String(option.value)}`;
					const isChecked = currentValues.some((v) => String(v) === String(option.value));
					const itemDisabled = Boolean(isDisabled || option.disabled);
					const itemLocked = itemDisabled || Boolean(isReadOnly);

					const control = (
						<Checkbox
							id={optionId}
							checked={isChecked}
							onCheckedChange={(checked) => handleToggle(option.value, Boolean(checked))}
							disabled={itemDisabled}
							aria-readonly={isReadOnly || undefined}
							aria-invalid={hasError || undefined}
							className={card ? "mt-0.5 rounded-sm" : "rounded-sm"}
						/>
					);

					if (card) {
						return (
							<ChoiceCardField
								key={String(option.value)}
								optionId={optionId}
								label={option.label}
								description={option.description}
								icon={option.icon}
								selected={isChecked}
								hasError={hasError}
								disabled={itemLocked}
								controlRole="checkbox"
								onToggleCard={() => handleToggle(option.value, !isChecked)}
								control={control}
							/>
						);
					}

					return (
						<Field
							key={String(option.value)}
							orientation="horizontal"
							data-invalid={hasError || undefined}
							data-disabled={itemDisabled || undefined}
							className="items-center gap-2"
						>
							{control}
							<FieldLabel htmlFor={optionId} className="text-foreground cursor-pointer text-xs font-medium select-none">
								{option.label}
							</FieldLabel>
						</Field>
					);
				})}
			</FieldGroup>
		</FieldSet>
	);
}

export const CheckboxGroup = connectField<(string | number)[], CheckboxGroupExtraProps>(CheckboxGroupControl, {
	defaultValue: EMPTY_VALUES,
});

export interface CheckboxInputProps extends BaseInputProps {
	value?: boolean;
	defaultValue?: boolean;
	onChange?: (checked: boolean) => void;
	onBlur?: () => void;
	description?: string;
}

// 使用 FormFieldEngine 直接接管复选框与右侧文本的水平并排布局
export function CheckboxInput({
	label,
	required,
	hint,
	helperText,
	tooltip,
	defaultValue = false,
	description,
	...fieldProps
}: CheckboxInputProps) {
	return (
		<FormFieldEngine<boolean> defaultValue={defaultValue} {...fieldProps}>
			{({ id, value, onChange, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy, onBlur }) => {
				const inlineDescText = description || helperText;
				const inlineDescId = inlineDescText ? `${id}-desc` : undefined;

				return (
					<InlineChoiceRow
						id={id}
						label={label}
						required={required}
						hint={hint}
						tooltip={tooltip}
						description={inlineDescText}
						descriptionId={inlineDescId}
						hasError={hasError}
						disabled={isDisabled}
						containerClassName="items-start gap-2.5 pt-1"
						control={
							<Checkbox
								id={id}
								checked={Boolean(value)}
								onCheckedChange={(checked) => {
									if (!isReadOnly) onChange(Boolean(checked));
								}}
								onBlur={onBlur}
								disabled={isDisabled}
								aria-readonly={isReadOnly || undefined}
								aria-invalid={hasError || undefined}
								aria-describedby={[describedBy, inlineDescId].filter(Boolean).join(" ") || undefined}
								className="mt-0.5 rounded-sm"
							/>
						}
					/>
				);
			}}
		</FormFieldEngine>
	);
}
