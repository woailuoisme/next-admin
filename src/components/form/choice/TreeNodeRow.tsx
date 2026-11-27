"use client";

import { Check, ChevronDown, ChevronRight, FileText, Folder, FolderOpen } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "cn";

import { HighlightedText } from "./HighlightedText";
import type { InternalTreeNode, TreeSelectValue } from "./treeEngine";

export interface TreeNodeRowProps {
	nodeKey: TreeSelectValue;
	nodeMap: Map<TreeSelectValue, InternalTreeNode>;
	effectiveExpandedKeys: Set<TreeSelectValue>;
	loadingKeys: Set<TreeSelectValue>;
	allCascadedChecked: Set<TreeSelectValue>;
	halfCheckedKeys: Set<TreeSelectValue>;
	selectedKeysSet: Set<TreeSelectValue>;
	matchedKeys: Set<TreeSelectValue>;
	searchExpandedKeys: Set<TreeSelectValue>;
	hasSearchFilter: boolean;
	searchKeyword: string;
	isMultiple: boolean;
	treeCheckable: boolean;
	treeLine: boolean;
	showIcon: boolean;
	hasLoadData: boolean;
	expandLabel: string;
	collapseLabel: string;
	onCheckNode: (item: InternalTreeNode) => void;
	onSelectNode: (item: InternalTreeNode) => void;
	onToggleExpand: (item: InternalTreeNode, e?: MouseEvent) => void;
}

export function TreeNodeRow({
	nodeKey,
	nodeMap,
	effectiveExpandedKeys,
	loadingKeys,
	allCascadedChecked,
	halfCheckedKeys,
	selectedKeysSet,
	matchedKeys,
	searchExpandedKeys,
	hasSearchFilter,
	searchKeyword,
	isMultiple,
	treeCheckable,
	treeLine,
	showIcon,
	hasLoadData,
	expandLabel,
	collapseLabel,
	onCheckNode,
	onSelectNode,
	onToggleExpand,
}: TreeNodeRowProps) {
	const item = nodeMap.get(nodeKey);
	if (!item) return null;

	if (hasSearchFilter && !matchedKeys.has(nodeKey) && !searchExpandedKeys.has(nodeKey)) {
		return null;
	}

	const isExpanded = effectiveExpandedKeys.has(nodeKey);
	const isLoading = loadingKeys.has(nodeKey);
	const hasChildren = item.childrenKeys.length > 0 || (hasLoadData && !item.isLeaf);

	const isChecked = allCascadedChecked.has(nodeKey);
	const isHalfChecked = halfCheckedKeys.has(nodeKey);
	const isSingleSelected = !isMultiple && selectedKeysSet.has(nodeKey);

	let iconElement: ReactNode = null;
	if (showIcon) {
		if (typeof item.icon === "function") {
			iconElement = item.icon(item.raw, isExpanded);
		} else if (item.icon) {
			iconElement = item.icon;
		} else if (hasChildren) {
			iconElement = isExpanded ? (
				<FolderOpen className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
			) : (
				<Folder className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
			);
		} else {
			iconElement = <FileText className="text-muted-foreground/80 size-4 shrink-0" aria-hidden="true" />;
		}
	}

	const labelDisabled = item.disabled || !item.selectable || (treeCheckable && item.disableCheckbox && item.selectable);

	return (
		<div className="relative flex flex-col">
			{treeLine && item.level > 0 ? (
				<div
					aria-hidden="true"
					className="border-border/60 pointer-events-none absolute top-0 bottom-0 border-l border-dashed"
					style={{ left: `${(item.level - 1) * 20 + 10}px` }}
				/>
			) : null}

			<div
				role="treeitem"
				aria-level={item.level + 1}
				aria-expanded={hasChildren ? isExpanded : undefined}
				aria-checked={treeCheckable ? (isChecked ? true : isHalfChecked ? "mixed" : false) : undefined}
				aria-selected={treeCheckable ? undefined : isMultiple ? allCascadedChecked.has(nodeKey) : isSingleSelected}
				aria-disabled={item.disabled || undefined}
				className={cn(
					"group relative flex min-h-8 items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors select-none",
					item.disabled ? "text-muted-foreground/50 cursor-not-allowed" : "hover:bg-accent/60",
					isSingleSelected && "bg-primary/10 text-primary hover:bg-primary/15 font-medium",
				)}
				style={{ paddingLeft: `${item.level * 20 + 8}px` }}
			>
				{treeLine && item.level > 0 ? (
					<div
						aria-hidden="true"
						className="border-border/60 pointer-events-none absolute h-px border-b border-dashed"
						style={{
							left: `${(item.level - 1) * 20 + 10}px`,
							width: "12px",
							top: "50%",
						}}
					/>
				) : null}

				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					disabled={!hasChildren || item.disabled || isLoading}
					tabIndex={hasChildren && !item.disabled ? 0 : -1}
					aria-label={isExpanded ? collapseLabel : expandLabel}
					aria-expanded={hasChildren ? isExpanded : undefined}
					onClick={(e) => {
						e.stopPropagation();
						if (hasChildren && !isLoading) {
							void onToggleExpand(item, e);
						}
					}}
					className={cn(
						"size-5 shrink-0 rounded-sm p-0",
						hasChildren && !item.disabled ? "cursor-pointer" : "pointer-events-none opacity-0",
					)}
				>
					{isLoading ? (
						<Spinner aria-hidden="true" className="text-primary size-3.5" />
					) : isExpanded ? (
						<ChevronDown aria-hidden="true" className="text-muted-foreground size-3.5" />
					) : (
						<ChevronRight aria-hidden="true" className="text-muted-foreground size-3.5" />
					)}
				</Button>

				{treeCheckable ? (
					<Checkbox
						checked={isChecked ? true : isHalfChecked ? "indeterminate" : false}
						disabled={item.disabled || item.disableCheckbox}
						onCheckedChange={() => onCheckNode(item)}
						aria-label={item.label}
						className="size-4 shrink-0 rounded-sm"
					/>
				) : null}

				<Button
					type="button"
					variant="ghost"
					size="xs"
					disabled={labelDisabled}
					data-treeitem-action
					onClick={() => onSelectNode(item)}
					className={cn(
						"h-auto min-w-0 flex-1 justify-start gap-1.5 px-1 py-0.5 text-left font-normal shadow-none outline-hidden hover:bg-transparent focus-visible:underline",
						labelDisabled ? "cursor-not-allowed" : "cursor-pointer",
					)}
				>
					{iconElement}
					<span className="min-w-0 flex-1 truncate">
						{hasSearchFilter ? (
							<HighlightedText text={item.label} keyword={searchKeyword} variant="mark" />
						) : (
							item.labelNode
						)}
					</span>
					{isSingleSelected ? <Check aria-hidden="true" className="text-primary size-3.5 shrink-0" /> : null}
				</Button>
			</div>

			{hasChildren && isExpanded ? (
				<div role="group" className="flex flex-col">
					{item.childrenKeys.map((childKey) => (
						<TreeNodeRow
							key={String(childKey)}
							nodeKey={childKey}
							nodeMap={nodeMap}
							effectiveExpandedKeys={effectiveExpandedKeys}
							loadingKeys={loadingKeys}
							allCascadedChecked={allCascadedChecked}
							halfCheckedKeys={halfCheckedKeys}
							selectedKeysSet={selectedKeysSet}
							matchedKeys={matchedKeys}
							searchExpandedKeys={searchExpandedKeys}
							hasSearchFilter={hasSearchFilter}
							searchKeyword={searchKeyword}
							isMultiple={isMultiple}
							treeCheckable={treeCheckable}
							treeLine={treeLine}
							showIcon={showIcon}
							hasLoadData={hasLoadData}
							expandLabel={expandLabel}
							collapseLabel={collapseLabel}
							onCheckNode={onCheckNode}
							onSelectNode={onSelectNode}
							onToggleExpand={onToggleExpand}
						/>
					))}
				</div>
			) : null}
		</div>
	);
}
