"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

type SelectExtraProps<TValue extends string | number = string> = Pick<
	SelectInputProps<TValue>,
	"options" | "placeholder" | "triggerClassName"
>;

const EMPTY_OPTIONS: readonly SelectOption<any>[] = [];

function SelectControl<TValue extends string | number = string>({
	id,
	value,
	onChange,
	onBlur,
	disabled,
	readOnly,
	required,
	hasError,
	describedBy,
	placeholder,
	options = EMPTY_OPTIONS as readonly SelectOption<TValue>[],
	triggerClassName,
}: FormFieldRenderProps<TValue> & SelectExtraProps<TValue>) {
	const t = useTranslations("form");
	const [open, setOpen] = useState(false);
	const resolvedPlaceholder = placeholder ?? t("select_placeholder");
	const stringValue = value !== undefined && value !== null ? String(value) : undefined;

	const handleOpenChange = (nextOpen: boolean) => {
		if (readOnly && nextOpen) return;
		setOpen(nextOpen);
		if (!nextOpen) {
			onBlur?.();
		}
	};

	return (
		<Select
			open={open}
			onOpenChange={handleOpenChange}
			value={stringValue}
			onValueChange={(val) => {
				if (readOnly) return;
				const matched = options.find((o) => String(o.value) === val);
				onChange(matched ? matched.value : (val as unknown as TValue));
			}}
			disabled={disabled}
		>
			<SelectTrigger
				id={id}
				aria-readonly={readOnly || undefined}
				aria-invalid={hasError}
				aria-required={required}
				aria-describedby={describedBy}
				onBlur={() => {
					if (!open) onBlur?.();
				}}
				className={cn("w-full", triggerClassName)}
			>
				<SelectValue placeholder={resolvedPlaceholder} />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{options.map((option) => (
						<SelectItem
							key={String(option.value)}
							value={String(option.value)}
							disabled={option.disabled}
							className="text-xs"
						>
							{"icon" in option && option.icon ? (
								<span className="mr-1.5 inline-flex size-3.5 items-center justify-center">{option.icon}</span>
							) : null}
							<span>{option.label}</span>
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}

export const SelectInput = connectField<string | number, SelectExtraProps<string | number>>(SelectControl) as <
	TValue extends string | number = string,
>(
	props: SelectInputProps<TValue>,
) => React.ReactElement;
