"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useId } from "react";

import { Input } from "@/components/ui/input";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { cn } from "cn";

import { FieldClearButton } from "../core";
import type { ShowCheckedStrategy, TreeSelectFieldNames, TreeSelectNode, TreeSelectValue } from "./treeEngine";
import { TreeNodeRow } from "./TreeNodeRow";
import { TreeSelectTrigger } from "./TreeSelectTrigger";
import { useTreeSelectState } from "./useTreeSelectState";

export type { ShowCheckedStrategy, TreeSelectFieldNames, TreeSelectNode, TreeSelectValue };

export interface TreeSelectProps {
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
	placeholder?: string;
	disabled?: boolean;
	readOnly?: boolean;
	onBlur?: () => void;
	allowClear?: boolean;
	clearable?: boolean;
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
	maxTagPlaceholder?: (omittedValues: TreeSelectValue[]) => ReactNode;
	size?: "sm" | "default" | "lg";
	className?: string;
	popupClassName?: string;
	id?: string;
	filterTreeNode?: (searchValue: string, node: TreeSelectNode) => boolean;
	"aria-label"?: string;
	"aria-invalid"?: boolean;
	"aria-describedby"?: string;
}

const EMPTY_TREE_DATA: TreeSelectNode[] = [];

export function TreeSelect({
	treeData = EMPTY_TREE_DATA,
	value,
	defaultValue,
	onChange,
	placeholder: propPlaceholder,
	disabled = false,
	readOnly = false,
	onBlur,
	allowClear = true,
	clearable = true,
	multiple = false,
	treeCheckable = false,
	showCheckedStrategy = "SHOW_PARENT",
	onlyLeafSelectable = false,
	treeLine = false,
	showIcon = false,
	showSearch = true,
	searchPlaceholder: propSearchPlaceholder,
	emptyText: propEmptyText,
	treeDefaultExpandAll = false,
	treeExpandedKeys,
	onTreeExpand,
	loadData,
	fieldNames,
	maxTagCount = 3,
	maxTagPlaceholder,
	size = "default",
	className,
	popupClassName,
	id,
	filterTreeNode,
	"aria-label": ariaLabel,
	"aria-invalid": ariaInvalid,
	"aria-describedby": ariaDescribedBy,
}: TreeSelectProps) {
	const t = useTranslations("form");
	const placeholder = propPlaceholder ?? t("treeselect_placeholder");
	const searchPlaceholder = propSearchPlaceholder ?? t("treeselect_search_placeholder");
	const emptyText = propEmptyText ?? t("treeselect_empty");

	const autoId = useId();
	const triggerId = id || `treeselect-${autoId}`;
	const listboxId = `treeselect-listbox-${autoId}`;

	const state = useTreeSelectState({
		treeData,
		value,
		defaultValue,
		onChange,
		disabled,
		readOnly,
		onBlur,
		allowClear,
		clearable,
		multiple,
		treeCheckable,
		showCheckedStrategy,
		onlyLeafSelectable,
		treeDefaultExpandAll,
		treeExpandedKeys,
		onTreeExpand,
		loadData,
		fieldNames,
		filterTreeNode,
	});

	const expandLabel = t("treeselect_expand_node");
	const collapseLabel = t("treeselect_collapse_node");

	return (
		<Popover open={state.open} onOpenChange={state.handleOpenChange}>
			<TreeSelectTrigger
				triggerId={triggerId}
				listboxId={listboxId}
				open={state.open}
				isMultiple={state.isMultiple}
				hasSelection={state.hasSelection}
				canClear={state.canClear}
				disabled={disabled}
				readOnly={readOnly}
				size={size}
				placeholder={placeholder}
				activeValue={state.activeValue}
				rawValues={state.rawValues}
				maxTagCount={maxTagCount}
				maxTagPlaceholder={maxTagPlaceholder}
				nodeMap={state.nodeMap}
				className={className}
				ariaLabel={ariaLabel}
				ariaInvalid={ariaInvalid}
				ariaDescribedBy={ariaDescribedBy}
				onBlur={onBlur}
				onClear={state.handleClear}
				onRemoveTag={state.handleRemoveTag}
				onKeyDown={state.handleTriggerKeyDown}
			/>

			<PopoverContent
				id={listboxId}
				align="start"
				className={cn(
					"border-border bg-popover text-popover-foreground w-(--radix-popover-trigger-width) min-w-[260px] p-0 shadow-md",
					popupClassName,
				)}
			>
				{showSearch && (
					<div className="border-border/60 relative flex items-center border-b px-2.5 py-2">
						<Search aria-hidden="true" className="text-muted-foreground pointer-events-none mr-1.5 size-3.5 shrink-0" />
						<Input
							type="text"
							value={state.searchValue}
							onChange={(e) => state.setSearchValue(e.target.value)}
							aria-label={searchPlaceholder}
							placeholder={searchPlaceholder}
							className="h-7 flex-1 border-0 bg-transparent px-1 pr-6 text-xs shadow-none focus-visible:ring-0"
						/>
						{state.searchValue && (
							<FieldClearButton
								onClick={() => state.setSearchValue("")}
								ariaLabel={t("treeselect_clear_search")}
								className="absolute right-2.5"
							/>
						)}
					</div>
				)}

				<div className="max-h-72 scrollbar-thin overflow-y-auto p-1.5" role="tree">
					{state.rootKeys.length === 0 ? (
						<div className="text-muted-foreground py-6 text-center text-xs">{emptyText}</div>
					) : (
						<>
							{state.rootKeys.map((rootKey) => (
								<TreeNodeRow
									key={String(rootKey)}
									nodeKey={rootKey}
									nodeMap={state.nodeMap}
									effectiveExpandedKeys={state.effectiveExpandedKeys}
									loadingKeys={state.loadingKeys}
									allCascadedChecked={state.allCascadedChecked}
									halfCheckedKeys={state.halfCheckedKeys}
									selectedKeysSet={state.selectedKeysSet}
									matchedKeys={state.matchedKeys}
									hasSearchFilter={state.hasSearchFilter}
									searchKeyword={state.searchKeyword}
									isMultiple={state.isMultiple}
									treeCheckable={treeCheckable}
									treeLine={treeLine}
									showIcon={showIcon}
									hasLoadData={Boolean(loadData)}
									expandLabel={expandLabel}
									collapseLabel={collapseLabel}
									onSelectNode={state.handleSelectNode}
									onToggleExpand={state.handleToggleExpand}
								/>
							))}
							{state.hasSearchFilter && state.matchedKeys.size === 0 && (
								<div className="text-muted-foreground py-6 text-center text-xs">{emptyText}</div>
							)}
						</>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
