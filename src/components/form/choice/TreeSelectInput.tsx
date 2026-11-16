"use client";

import { memo } from "react";

import { FormFieldEngine, type BaseInputProps } from "../core";
import {
  TreeSelect,
  type ShowCheckedStrategy,
  type TreeSelectFieldNames,
  type TreeSelectNode,
  type TreeSelectValue,
} from "./TreeSelect";

export type { ShowCheckedStrategy, TreeSelectFieldNames, TreeSelectNode, TreeSelectValue };

export interface TreeSelectInputProps extends BaseInputProps {
  treeData?: TreeSelectNode[];
  value?: TreeSelectValue | TreeSelectValue[];
  defaultValue?: TreeSelectValue | TreeSelectValue[];
  onChange?: (
    value: TreeSelectValue | TreeSelectValue[] | undefined,
    selectedNodes: TreeSelectNode[] | TreeSelectNode | undefined,
    extra?: {
      triggerValue?: TreeSelectValue;
      checked?: boolean;
      allCheckedKeys?: TreeSelectValue[];
    },
  ) => void;
  onBlur?: () => void;
  multiple?: boolean;
  treeCheckable?: boolean;
  showCheckedStrategy?: ShowCheckedStrategy;
  onlyLeafSelectable?: boolean;
  treeLine?: boolean;
  showIcon?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  treeDefaultExpandAll?: boolean;
  treeExpandedKeys?: TreeSelectValue[];
  onTreeExpand?: (keys: TreeSelectValue[]) => void;
  loadData?: (node: TreeSelectNode) => Promise<void> | void;
  fieldNames?: TreeSelectFieldNames;
  maxTagCount?: number;
  maxTagPlaceholder?: (omittedValues: TreeSelectValue[]) => React.ReactNode;
  allowClear?: boolean;
  clearable?: boolean;
  triggerClassName?: string;
  popupClassName?: string;
  size?: "sm" | "default" | "lg";
  filterTreeNode?: (searchValue: string, node: TreeSelectNode) => boolean;
}

const EMPTY_TREE_DATA: TreeSelectNode[] = [];
const EMPTY_ARRAY: TreeSelectValue[] = [];

function TreeSelectInputInner({
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
  treeData = EMPTY_TREE_DATA,
  value: controlledValue,
  defaultValue,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  multiple = false,
  treeCheckable = false,
  showCheckedStrategy = "SHOW_PARENT",
  onlyLeafSelectable = false,
  treeLine = false,
  showIcon = false,
  showSearch = true,
  treeDefaultExpandAll = false,
  treeExpandedKeys,
  onTreeExpand,
  loadData,
  fieldNames,
  maxTagCount = 3,
  maxTagPlaceholder,
  triggerClassName,
  popupClassName,
  size = "default",
  filterTreeNode,
}: TreeSelectInputProps) {
  const isMultiple = multiple || treeCheckable;
  const normalizedDefaultValue = defaultValue !== undefined ? defaultValue : isMultiple ? EMPTY_ARRAY : undefined;

  return (
    <FormFieldEngine<TreeSelectValue | TreeSelectValue[] | undefined>
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
      defaultValue={normalizedDefaultValue}
      onBlur={controlledOnBlur}
    >
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => (
        <TreeSelect
          id={id}
          treeData={treeData}
          value={value}
          onChange={(nextVal, nodes, extra) => {
            onChange(nextVal);
            controlledOnChange?.(nextVal, nodes, extra);
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          emptyText={emptyText}
          disabled={isDisabled}
          readOnly={isReadOnly}
          allowClear={allowClear}
          clearable={clearable}
          multiple={multiple}
          treeCheckable={treeCheckable}
          showCheckedStrategy={showCheckedStrategy}
          onlyLeafSelectable={onlyLeafSelectable}
          treeLine={treeLine}
          showIcon={showIcon}
          showSearch={showSearch}
          treeDefaultExpandAll={treeDefaultExpandAll}
          treeExpandedKeys={treeExpandedKeys}
          onTreeExpand={onTreeExpand}
          loadData={loadData}
          fieldNames={fieldNames}
          maxTagCount={maxTagCount}
          maxTagPlaceholder={maxTagPlaceholder}
          size={size}
          filterTreeNode={filterTreeNode}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={triggerClassName}
          popupClassName={popupClassName}
        />
      )}
    </FormFieldEngine>
  );
}

export const TreeSelectInput = memo(TreeSelectInputInner);
TreeSelectInput.displayName = "TreeSelectInput";
