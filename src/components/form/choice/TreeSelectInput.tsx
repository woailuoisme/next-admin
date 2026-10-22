import { memo } from "react";
import { cn } from "@/lib/utils";

import { FieldConnector, FieldWrapper, useFieldId, type BaseInputProps } from "../core";
import {
  TreeSelect,
  type TreeSelectFieldNames,
  type TreeSelectNode,
  type TreeSelectValue,
  type ShowCheckedStrategy,
} from "./TreeSelect";

export type { TreeSelectFieldNames, TreeSelectNode, TreeSelectValue, ShowCheckedStrategy };

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
const EMPTY_ARRAY: [] = [];

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
  placeholder = "请选择...",
  searchPlaceholder = "搜索节点名称...",
  emptyText = "暂无匹配数据",
  disabled,
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
  const id = useFieldId(name, explicitId);

  const isMultiple = multiple || treeCheckable;
  const normalizedDefaultValue =
    defaultValue !== undefined ? defaultValue : isMultiple ? EMPTY_ARRAY : undefined;

  return (
    <FieldConnector<TreeSelectValue | TreeSelectValue[] | undefined>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={normalizedDefaultValue}
      onBlur={controlledOnBlur}
      error={error}
    >
      {({ value, onChange, error: computedError }) => {
        const hasError = Boolean(computedError);

        return (
          <FieldWrapper
            label={label}
            id={id}
            required={required}
            error={computedError}
            hint={hint}
            helperText={helperText}
            tooltip={tooltip}
            colSpan={colSpan}
            hidden={hidden}
            className={className}
          >
            <TreeSelect
              id={id}
              treeData={treeData}
              value={value}
              onChange={(nextVal, nodes, extra) => {
                onChange(nextVal);
                controlledOnChange?.(nextVal, nodes, extra);
              }}
              placeholder={placeholder}
              searchPlaceholder={searchPlaceholder}
              emptyText={emptyText}
              disabled={disabled}
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
              className={cn(
                hasError && "border-destructive focus-visible:ring-destructive",
                triggerClassName,
              )}
              popupClassName={popupClassName}
            />
          </FieldWrapper>
        );
      }}
    </FieldConnector>
  );
}

export const TreeSelectInput = memo(TreeSelectInputInner);
TreeSelectInput.displayName = "TreeSelectInput";
