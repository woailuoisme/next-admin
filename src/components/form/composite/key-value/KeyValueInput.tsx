"use client";

import { connectField, type KeyValuePair } from "@/components/form/core";

import { KeyValueControl } from "./KeyValueControl";
import type { KeyValueInputProps } from "./types";

const EMPTY_RECORD: Record<string, string> = {};

type KeyValueExtraProps = Omit<
	KeyValueInputProps,
	"value" | "defaultValue" | "onChange" | "onBlur" | keyof import("@/components/form/core").BaseInputProps
>;

export const KeyValueInput = connectField<Record<string, string> | KeyValuePair[], KeyValueExtraProps>(
	({
		defaultRawFormat = "json",
		valueType = "auto",
		canEditKeys = true,
		canAdd = true,
		canDelete = true,
		reorderable = true,
		minItems = 0,
		...props
	}) => (
		<KeyValueControl
			{...props}
			valueType={valueType}
			canEditKeys={canEditKeys}
			canAdd={canAdd}
			canDelete={canDelete}
			reorderable={reorderable}
			minItems={minItems}
			defaultRawFormat={defaultRawFormat}
		/>
	),
	{ defaultValue: EMPTY_RECORD },
);
