"use client";

import { noop } from "es-toolkit";
import type { ReactNode } from "react";

import { TextInput } from "@/components/form/basic";
import { ComboboxInput, SelectInput } from "@/components/form/choice";
import { useResourceOptions, useSlugSync } from "@/lib/resource/hooks";

import type { AppFormContract, SchemaFieldSpec, SchemaOptionsFromResourceSpec } from "./types";

const FALLBACK_SLUG_FORM = {
	setFieldValue: noop,
};

export interface SchemaFieldRenderArgs {
	spec: SchemaFieldSpec<any>;
	form?: AppFormContract;
	isEditing: boolean;
	disabled: boolean;
	label: ReactNode;
	placeholder?: string;
	hint?: ReactNode;
	tooltip?: ReactNode;
}

export function SchemaResourceChoiceField({
	args,
	source,
	variant,
}: {
	args: SchemaFieldRenderArgs;
	source: SchemaOptionsFromResourceSpec;
	variant: "select" | "combobox";
}) {
	const { spec, form, isEditing, disabled, label, placeholder, hint, tooltip } = args;
	const { options, isLoading } = useResourceOptions(source.resource, {
		mapOption: source.mapOption,
		form: source.autoSelectFirst ? form : undefined,
		autoSelectField: source.autoSelectFirst ? spec.name : undefined,
		isEditing,
	});

	const resolvedDisabled = disabled || (isLoading && options.length === 0);

	if (variant === "combobox") {
		return (
			<ComboboxInput
				name={spec.name}
				label={label}
				required={spec.required}
				colSpan={spec.colSpan}
				options={options}
				disabled={resolvedDisabled}
				readOnly={spec.readOnly}
				placeholder={placeholder}
				searchPlaceholder={spec.searchPlaceholder}
				emptyText={spec.emptyText}
				clearable={spec.clearable}
				hint={hint}
				tooltip={tooltip}
				helperText={spec.helperText}
			/>
		);
	}

	return (
		<SelectInput
			name={spec.name}
			label={label}
			required={spec.required}
			colSpan={spec.colSpan}
			options={options}
			disabled={resolvedDisabled}
			readOnly={spec.readOnly}
			placeholder={placeholder}
			hint={hint}
			tooltip={tooltip}
			helperText={spec.helperText}
		/>
	);
}

export function SchemaSlugTextField({
	spec,
	form,
	isEditing,
	disabled,
	label,
	placeholder,
	hint,
	tooltip,
}: SchemaFieldRenderArgs) {
	const handleSlugSync = useSlugSync(
		form ?? FALLBACK_SLUG_FORM,
		spec.slugTarget ?? "slug",
		Boolean(spec.slugTarget && form) && !isEditing,
	);

	return (
		<TextInput
			name={spec.name}
			label={label}
			required={spec.required}
			colSpan={spec.colSpan}
			placeholder={placeholder}
			clearable={spec.clearable}
			prefix={spec.prefix}
			suffix={spec.suffix}
			hint={hint}
			tooltip={tooltip}
			helperText={spec.helperText}
			disabled={disabled}
			readOnly={spec.readOnly}
			onChange={spec.slugTarget ? handleSlugSync : undefined}
		/>
	);
}
