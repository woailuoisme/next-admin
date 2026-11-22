"use client";

import { useTranslations } from "next-intl";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "cn";

import { type BaseInputProps, connectField, type FormFieldRenderProps, type SelectOption } from "../core";

export interface SelectInputProps<TValue extends string | number = string> extends BaseInputProps {
	options: SelectOption<TValue>[] | readonly SelectOption<TValue>[];
	value?: TValue;
	defaultValue?: TValue;
	onChange?: (value: TValue) => void;
	onBlur?: () => void;
	triggerClassName?: string;
}

interface SelectExtraProps<TValue extends string | number = string> {
	options: SelectOption<TValue>[] | readonly SelectOption<TValue>[];
	placeholder?: string;
	triggerClassName?: string;
}

const EMPTY_OPTIONS: readonly SelectOption<any>[] = [];

function SelectControl<TValue extends string | number = string>({
	id,
	value,
	onChange,
	disabled,
	readOnly,
	hasError,
	describedBy,
	placeholder,
	options = EMPTY_OPTIONS as readonly SelectOption<TValue>[],
	triggerClassName,
}: FormFieldRenderProps<TValue> & SelectExtraProps<TValue>) {
	const t = useTranslations("form");
	const resolvedPlaceholder = placeholder ?? t("select_placeholder");
	const stringValue = value != null ? String(value) : "";

	return (
		<Select
			value={stringValue}
			onValueChange={(val) => {
				if (readOnly) return;
				const matched = options.find((o) => String(o.value) === val);
				onChange(matched ? matched.value : (val as unknown as TValue));
			}}
			disabled={disabled || readOnly}
		>
			<SelectTrigger
				id={id}
				aria-invalid={hasError}
				aria-describedby={describedBy}
				className={cn(
					"w-full rounded-md",
					hasError && "border-destructive focus-visible:ring-destructive/20",
					triggerClassName,
				)}
			>
				<SelectValue placeholder={resolvedPlaceholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem
						key={String(option.value)}
						value={String(option.value)}
						disabled={option.disabled}
						className="text-xs"
					>
						{"icon" in option && option.icon && (
							<span className="mr-1.5 inline-flex size-3.5 items-center justify-center">{option.icon}</span>
						)}
						<span>{option.label}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export const SelectInput = connectField<string | number, SelectExtraProps<string | number>>(SelectControl) as <
	TValue extends string | number = string,
>(
	props: SelectInputProps<TValue>,
) => React.ReactElement;
