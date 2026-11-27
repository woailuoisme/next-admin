"use client";

import { type ReactNode } from "react";

import { type BaseInputProps, connectField, type FormFieldRenderProps } from "@/components/form/core";

import { RepeaterInner } from "./RepeaterInner";
import type { RepeaterProps } from "./types";

const DEFAULT_EMPTY_ARRAY: unknown[] = [];

type RepeaterExtraProps<T = unknown> = Omit<
	RepeaterProps<T>,
	"value" | "defaultValue" | "onChange" | "onBlur" | keyof BaseInputProps
>;

function RepeaterControl<T = unknown>({
	id,
	value = DEFAULT_EMPTY_ARRAY as T[],
	onChange,
	onBlur,
	disabled,
	readOnly,
	hasError,
	describedBy,
	...rest
}: FormFieldRenderProps<T[]> & RepeaterExtraProps<T>) {
	return (
		<RepeaterInner<T>
			id={id}
			items={Array.isArray(value) ? value : (DEFAULT_EMPTY_ARRAY as T[])}
			onChange={onChange}
			onBlur={onBlur}
			hasError={hasError}
			describedBy={describedBy}
			disabled={disabled}
			readOnly={readOnly}
			{...rest}
		/>
	);
}

export const Repeater = connectField<unknown[], RepeaterExtraProps<unknown>>(RepeaterControl, {
	defaultValue: DEFAULT_EMPTY_ARRAY,
}) as <T = unknown>(props: RepeaterProps<T>) => ReactNode;
