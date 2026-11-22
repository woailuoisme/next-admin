"use client";

import { useMemoizedFn } from "ahooks";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "cn";

import { type BaseInputProps, connectField, type FormFieldRenderProps, type ToggleButtonOption } from "../core";

const EMPTY_OPTIONS: ToggleButtonOption[] = [];

export interface ToggleButtonsProps extends BaseInputProps {
	options: ToggleButtonOption[];
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	onBlur?: () => void;
	variant?: "default" | "outline";
	size?: "default" | "sm" | "lg";
	fullWidth?: boolean;
}

type ToggleButtonsExtraProps = Pick<ToggleButtonsProps, "options" | "variant" | "size" | "fullWidth">;

function ToggleButtonsControl({
	id,
	value = "",
	onChange,
	onBlur,
	disabled: isDisabled,
	readOnly: isReadOnly,
	hasError,
	describedBy,
	options = EMPTY_OPTIONS,
	variant = "outline",
	size = "sm",
	fullWidth = false,
}: FormFieldRenderProps<string> & ToggleButtonsExtraProps) {
	const locked = Boolean(isDisabled || isReadOnly);
	const handleValueChange = useMemoizedFn((val: string) => {
		if (val && !isReadOnly) onChange(val);
	});

	return (
		<ToggleGroup
			id={id}
			type="single"
			value={value}
			onValueChange={handleValueChange}
			onBlur={onBlur}
			disabled={locked}
			variant={variant}
			size={size}
			aria-invalid={hasError}
			aria-describedby={describedBy}
			className={cn("pt-1", fullWidth && "flex w-full *:flex-1")}
		>
			{options.map((opt) => {
				const Icon = opt.icon;
				return (
					<ToggleGroupItem
						key={opt.value}
						value={opt.value}
						disabled={locked || opt.disabled}
						className="cursor-pointer gap-1.5 text-xs"
					>
						{Icon && <Icon className="size-3.5 shrink-0" />}
						<span>{opt.label}</span>
					</ToggleGroupItem>
				);
			})}
		</ToggleGroup>
	);
}

export const ToggleButtons = connectField<string, ToggleButtonsExtraProps>(ToggleButtonsControl, {
	defaultValue: "",
});
