"use client";

import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "cn";

import {
	type BaseInputProps,
	connectField,
	createContainerBlurHandler,
	type FormFieldRenderProps,
	type SegmentedOption,
} from "../core";

export interface SegmentedControlProps<T extends string | number = string> extends BaseInputProps {
	value?: T;
	defaultValue?: T;
	onChange?: (value: T) => void;
	onBlur?: () => void;
	options: SegmentedOption<T>[];
	size?: "sm" | "md" | "lg";
	fullWidth?: boolean;
}

type SegmentedExtraProps<T extends string | number = string> = Pick<
	SegmentedControlProps<T>,
	"options" | "size" | "fullWidth"
>;

const SIZE_STYLES = {
	sm: "h-7 text-xs px-2.5 gap-1.5",
	md: "h-8 text-xs px-3 gap-2",
	lg: "h-9 text-sm px-4 gap-2.5",
} as const;

function SegmentedControlGroup<T extends string | number = string>({
	id,
	value,
	onChange,
	onBlur,
	options,
	size = "md",
	fullWidth = false,
	disabled = false,
	readOnly = false,
	hasError,
	describedBy,
}: FormFieldRenderProps<T> & SegmentedExtraProps<T>) {
	const stringValue = value !== undefined && value !== null ? String(value) : "";

	const handleValueChange = (nextStr: string) => {
		if (!nextStr || disabled || readOnly) return;
		const matched = options.find((opt) => String(opt.value) === nextStr);
		if (matched && !matched.disabled) {
			onChange(matched.value);
		}
	};

	const sizeStyle = SIZE_STYLES[size];

	return (
		<ToggleGroup
			id={id}
			type="single"
			value={stringValue}
			onValueChange={handleValueChange}
			onBlur={createContainerBlurHandler(onBlur)}
			disabled={disabled}
			spacing={1}
			aria-invalid={hasError}
			aria-describedby={describedBy}
			aria-readonly={readOnly || undefined}
			className={cn(
				"bg-muted text-muted-foreground inline-flex items-center rounded-lg p-1 transition-colors select-none",
				fullWidth && "flex w-full",
				disabled && "pointer-events-none cursor-not-allowed opacity-50",
				hasError && "ring-destructive ring-1",
			)}
		>
			{options.map((opt) => {
				const optKey = String(opt.value);
				const isSelected = value !== undefined && value !== null && optKey === stringValue;
				const Icon = opt.icon;

				return (
					<ToggleGroupItem
						key={optKey}
						value={optKey}
						disabled={Boolean(disabled || opt.disabled)}
						className={cn(
							"h-auto cursor-pointer rounded-md font-medium shadow-none transition-all",
							"hover:bg-background/40 hover:text-foreground/80",
							"data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:font-semibold data-[state=on]:shadow-xs",
							sizeStyle,
							fullWidth && "flex-1",
						)}
					>
						{Icon ? <Icon className="size-3.5 shrink-0" aria-hidden="true" /> : null}
						<span>{opt.label}</span>
						{opt.badge != null ? (
							<span className="ml-1 shrink-0">
								{typeof opt.badge === "string" || typeof opt.badge === "number" ? (
									<Badge variant={isSelected ? "default" : "secondary"} className="h-4 rounded-full px-1 text-xs">
										{opt.badge}
									</Badge>
								) : (
									opt.badge
								)}
							</span>
						) : null}
					</ToggleGroupItem>
				);
			})}
		</ToggleGroup>
	);
}

export const SegmentedControl = connectField<string | number, SegmentedExtraProps<string | number>>(
	SegmentedControlGroup,
) as <T extends string | number = string>(props: SegmentedControlProps<T>) => React.ReactElement;
