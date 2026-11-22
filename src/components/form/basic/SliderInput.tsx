"use client";

import { Slider } from "@/components/ui/slider";

import { type BaseInputProps, connectField, type FormFieldRenderProps } from "../core";

export interface SliderInputProps extends BaseInputProps {
	value?: number;
	defaultValue?: number;
	onChange?: (value: number) => void;
	onBlur?: () => void;
	min?: number;
	max?: number;
	step?: number;
	formatValue?: (val: number) => string;
	showValue?: boolean;
}

type SliderExtraProps = Pick<SliderInputProps, "min" | "max" | "step" | "formatValue" | "showValue">;

function SliderControl({
	id,
	value,
	onChange,
	onBlur,
	disabled,
	readOnly,
	hasError,
	describedBy,
	min = 0,
	max = 100,
	step = 1,
	formatValue,
	showValue = true,
}: FormFieldRenderProps<number> & SliderExtraProps) {
	const numValue = typeof value === "number" ? value : min;
	const displayStr = formatValue ? formatValue(numValue) : String(numValue);

	return (
		<div className="flex w-full items-center gap-3 pt-1.5">
			<Slider
				id={id}
				value={[numValue]}
				onValueChange={(vals) => {
					if (!readOnly) onChange(vals[0] ?? min);
				}}
				onBlur={onBlur}
				min={min}
				max={max}
				step={step}
				disabled={disabled || readOnly}
				aria-invalid={hasError}
				aria-describedby={describedBy}
				className="flex-1 cursor-pointer"
			/>
			{showValue ? (
				<span className="text-muted-foreground w-10 shrink-0 text-right font-mono text-xs tabular-nums">
					{displayStr}
				</span>
			) : null}
		</div>
	);
}

export const SliderInput = connectField<number, SliderExtraProps>(SliderControl, { defaultValue: 0 });
