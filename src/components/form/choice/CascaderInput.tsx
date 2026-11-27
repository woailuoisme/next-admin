"use client";

import { type ConnectedFieldProps, connectField, type FormFieldRenderProps } from "../core";
import { Cascader, type CascaderFieldNames, type CascaderOption, type CascaderProps } from "./Cascader";

export type { CascaderFieldNames, CascaderOption };

export type CascaderExtraProps = Pick<
	CascaderProps,
	| "options"
	| "expandTrigger"
	| "changeOnSelect"
	| "loadData"
	| "showSearch"
	| "fieldNames"
	| "placeholder"
	| "searchPlaceholder"
	| "emptyText"
	| "allowClear"
	| "clearable"
	| "separator"
	| "displayRender"
	| "popupClassName"
	| "size"
> & {
	onSelectionChange?: (value: (string | number)[], selectedOptions: CascaderOption[]) => void;
	triggerClassName?: string;
};

export type CascaderInputProps = ConnectedFieldProps<(string | number)[]> & CascaderExtraProps;

const EMPTY_OPTIONS: CascaderOption[] = [];
const DEFAULT_VALUE: (string | number)[] = [];

function CascaderControl({
	id,
	value,
	onChange,
	onBlur,
	disabled: isDisabled,
	readOnly: isReadOnly,
	hasError,
	describedBy,
	allowClear = true,
	clearable = true,
	options = EMPTY_OPTIONS,
	onSelectionChange,
	expandTrigger = "click",
	changeOnSelect = false,
	loadData,
	showSearch = false,
	fieldNames,
	placeholder,
	searchPlaceholder,
	emptyText,
	separator = " / ",
	displayRender,
	triggerClassName,
	popupClassName,
	size = "default",
}: FormFieldRenderProps<(string | number)[]> & CascaderExtraProps) {
	return (
		<Cascader
			id={id}
			options={options}
			value={Array.isArray(value) ? value : DEFAULT_VALUE}
			onChange={(newVals, selectedOptions) => {
				onChange(newVals);
				onSelectionChange?.(newVals, selectedOptions);
			}}
			onBlur={onBlur}
			expandTrigger={expandTrigger}
			changeOnSelect={changeOnSelect}
			loadData={loadData}
			showSearch={showSearch}
			fieldNames={fieldNames}
			placeholder={placeholder}
			searchPlaceholder={searchPlaceholder}
			emptyText={emptyText}
			allowClear={allowClear}
			clearable={clearable}
			separator={separator}
			displayRender={displayRender}
			disabled={isDisabled}
			readOnly={isReadOnly}
			size={size}
			aria-invalid={hasError}
			aria-describedby={describedBy}
			className={triggerClassName}
			popupClassName={popupClassName}
		/>
	);
}

export const CascaderInput = connectField<(string | number)[], CascaderExtraProps>(CascaderControl, {
	defaultValue: DEFAULT_VALUE,
});
