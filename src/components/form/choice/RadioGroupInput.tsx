"use client";

import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "cn";

import {
	type BaseInputProps,
	connectField,
	createContainerBlurHandler,
	type FormFieldRenderProps,
	type SelectOption,
} from "../core";
import { ChoiceCardField } from "./ChoiceHelpers";

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

type RadioGroupExtraProps<TValue extends string | number = string> = Pick<
	RadioGroupInputProps<TValue>,
	"options" | "direction" | "card"
>;

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
		<FieldSet disabled={isDisabled} onBlur={createContainerBlurHandler(onBlur)} className="w-full">
			<RadioGroup
				id={id}
				value={stringValue}
				onValueChange={handleValueChange}
				disabled={isDisabled}
				aria-readonly={isReadOnly || undefined}
				aria-invalid={hasError || undefined}
				aria-describedby={describedBy}
				className="w-full pt-1"
			>
				<FieldGroup
					data-slot="radio-group"
					className={cn(
						"w-full",
						direction === "horizontal" ? "flex-row flex-wrap items-center gap-4" : "flex-col gap-2",
					)}
				>
					{options.map((option) => {
						const optionId = `${id}-${String(option.value)}`;
						const isSelected = value !== undefined && value !== null && String(option.value) === stringValue;
						const itemDisabled = Boolean(isDisabled || option.disabled);
						const itemLocked = itemDisabled || Boolean(isReadOnly);

						const control = (
							<RadioGroupItem
								id={optionId}
								value={String(option.value)}
								disabled={itemDisabled}
								aria-invalid={hasError || undefined}
								className={card ? "mt-0.5" : undefined}
							/>
						);

						if (card) {
							return (
								<ChoiceCardField
									key={String(option.value)}
									optionId={optionId}
									label={option.label}
									description={option.description}
									icon={"icon" in option ? option.icon : undefined}
									selected={isSelected}
									hasError={hasError}
									disabled={itemLocked}
									controlRole="radio"
									onToggleCard={() => handleValueChange(String(option.value))}
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
								className={cn("items-center gap-2", direction === "horizontal" && "w-auto")}
							>
								{control}
								<FieldLabel
									htmlFor={optionId}
									className="text-foreground flex cursor-pointer items-center gap-1.5 text-xs font-medium select-none"
								>
									{"icon" in option ? option.icon : null}
									<span>{option.label}</span>
								</FieldLabel>
							</Field>
						);
					})}
				</FieldGroup>
			</RadioGroup>
		</FieldSet>
	);
}

export const RadioGroupInput = connectField<string | number, RadioGroupExtraProps<string | number>>(
	RadioGroupInputComponent,
) as <TValue extends string | number = string>(props: RadioGroupInputProps<TValue>) => React.ReactElement;
