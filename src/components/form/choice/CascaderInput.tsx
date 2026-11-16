"use client";

import { memo } from "react";

import { FormFieldEngine, type BaseInputProps } from "../core";
import { Cascader, type CascaderFieldNames, type CascaderOption } from "./Cascader";

export type { CascaderFieldNames, CascaderOption };

export interface CascaderInputProps extends BaseInputProps {
  options?: CascaderOption[];
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  onChange?: (value: (string | number)[], selectedOptions: CascaderOption[]) => void;
  onBlur?: () => void;
  expandTrigger?: "click" | "hover";
  changeOnSelect?: boolean;
  loadData?: (selectedOptions: CascaderOption[]) => Promise<void> | void;
  showSearch?: boolean;
  fieldNames?: CascaderFieldNames;
  searchPlaceholder?: string;
  emptyText?: string;
  allowClear?: boolean;
  clearable?: boolean;
  separator?: string;
  displayRender?: (labels: string[], selectedOptions: CascaderOption[]) => React.ReactNode;
  triggerClassName?: string;
  popupClassName?: string;
  size?: "sm" | "default" | "lg";
}

const EMPTY_OPTIONS: CascaderOption[] = [];
const DEFAULT_VALUE: (string | number)[] = [];

function CascaderInputInner({
  name,
  form,
  label,
  id: explicitId,
  required,
  hint,
  helperText,
  tooltip,
  error,
  colSpan,
  className,
  hidden,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
  readOnly,
  allowClear = true,
  clearable = true,
  options = EMPTY_OPTIONS,
  value: controlledValue,
  defaultValue = DEFAULT_VALUE,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  expandTrigger = "click",
  changeOnSelect = false,
  loadData,
  showSearch = false,
  fieldNames,
  separator = " / ",
  displayRender,
  triggerClassName,
  popupClassName,
  size = "default",
}: CascaderInputProps) {
  return (
    <FormFieldEngine<(string | number)[]>
      name={name}
      form={form}
      label={label}
      id={explicitId}
      required={required}
      hint={hint}
      helperText={helperText}
      tooltip={tooltip}
      error={error}
      colSpan={colSpan}
      className={className}
      hidden={hidden}
      disabled={disabled}
      readOnly={readOnly}
      value={controlledValue}
      defaultValue={defaultValue}
      onBlur={controlledOnBlur}
    >
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => (
        <Cascader
          id={id}
          options={options}
          value={Array.isArray(value) ? value : DEFAULT_VALUE}
          onChange={(newVals, selectedOptions) => {
            onChange(newVals);
            controlledOnChange?.(newVals, selectedOptions);
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
      )}
    </FormFieldEngine>
  );
}

export const CascaderInput = memo(CascaderInputInner);
CascaderInput.displayName = "CascaderInput";
