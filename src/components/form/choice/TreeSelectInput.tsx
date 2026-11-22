"use client";

import { type ConnectedFieldProps, connectField, type FormFieldRenderProps } from "../core";
import {
	TreeSelect,
	type ShowCheckedStrategy,
	type TreeSelectFieldNames,
	type TreeSelectNode,
	type TreeSelectValue,
} from "./TreeSelect";

export type { ShowCheckedStrategy, TreeSelectFieldNames, TreeSelectNode, TreeSelectValue };

export interface TreeSelectExtraProps {
	treeData?: TreeSelectNode[];
	onSelectionChange?: (
		value: TreeSelectValue | TreeSelectValue[] | undefined,
		selectedNodes: TreeSelectNode[] | TreeSelectNode | undefined,
		extra?: {
			triggerValue?: TreeSelectValue;
			checked?: boolean;
			allCheckedKeys?: TreeSelectValue[];
		},
	) => void;
	multiple?: boolean;
	treeCheckable?: boolean;
	showCheckedStrategy?: ShowCheckedStrategy;
	onlyLeafSelectable?: boolean;
	treeLine?: boolean;
	showIcon?: boolean;
	showSearch?: boolean;
	placeholder?: string;
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

export type TreeSelectInputProps = ConnectedFieldProps<TreeSelectValue | TreeSelectValue[] | undefined> &
	TreeSelectExtraProps;

const EMPTY_TREE_DATA: TreeSelectNode[] = [];
const EMPTY_ARRAY: TreeSelectValue[] = [];

function TreeSelectControl({
	id,
	value,
	onChange,
	onBlur,
	disabled: isDisabled,
	readOnly: isReadOnly,
	hasError,
	describedBy,
	placeholder,
	searchPlaceholder,
	emptyText,
	allowClear = true,
	clearable = true,
	treeData = EMPTY_TREE_DATA,
	onSelectionChange,
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
}: FormFieldRenderProps<TreeSelectValue | TreeSelectValue[] | undefined> & TreeSelectExtraProps) {
	const isMultiple = multiple || treeCheckable;
	const resolvedValue = value === undefined ? (isMultiple ? EMPTY_ARRAY : undefined) : value;

	return (
		<TreeSelect
			id={id}
			treeData={treeData}
			value={resolvedValue}
			onChange={(nextVal, nodes, extra) => {
				onChange(nextVal);
				onSelectionChange?.(nextVal, nodes, extra);
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
	);
}

export const TreeSelectInput = connectField<TreeSelectValue | TreeSelectValue[] | undefined, TreeSelectExtraProps>(
	TreeSelectControl,
);
