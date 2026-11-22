"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "cn";

import { createContainerBlurHandler } from "../../core";
import { RepeaterRow } from "./RepeaterRow";
import { RepeaterTable } from "./RepeaterTable";
import { RepeaterToolbar } from "./RepeaterToolbar";
import type { RepeaterProps } from "./types";
import { useRepeaterController } from "./useRepeaterController";

const DynamicSortableDndContext = dynamic(() => import("../SortableDndContext").then((mod) => mod.SortableDndContext), {
	ssr: false,
});

export interface RepeaterInnerProps<T> extends RepeaterProps<T> {
	id: string;
	readOnly?: boolean;
	items: T[];
	onChange: (items: T[]) => void;
	onBlur?: () => void;
	hasError?: boolean;
	describedBy?: string;
}

export const RepeaterInner = function RepeaterInner<T>({
	id,
	items,
	onChange,
	onBlur,
	hasError,
	describedBy,
	disabled,
	readOnly,
	layout = "card",
	headers,
	createItem,
	cloneItem,
	renderItem,
	itemTitle,
	getItemKey,
	addButtonText: propAddButtonText,
	emptyText: propEmptyText,
	showEmptyAddButton = true,
	minItems = 0,
	maxItems,
	collapsible = true,
	defaultCollapsed = false,
	reorderable = true,
	canAdd = true,
	canDelete = true,
	canDuplicate = true,
	confirmDelete = false,
	itemErrors,
	autoExpandOnError = true,
	renderSummary,
	renderExtraActions,
}: RepeaterInnerProps<T>) {
	const t = useTranslations("form");
	const isLocked = Boolean(disabled || readOnly);
	const effectiveReorderable = Boolean(reorderable && !readOnly);
	const effectiveCanAdd = Boolean(canAdd && !readOnly);
	const effectiveCanDelete = Boolean(canDelete && !readOnly);
	const effectiveCanDuplicate = Boolean(canDuplicate && !readOnly);
	const addButtonText = propAddButtonText ?? t("repeater_add");
	const emptyText = propEmptyText ?? t("repeater_empty");

	const {
		keys,
		collapsedMap,
		isAddAllowed,
		checkCanDelete,
		checkCanDuplicate,
		toggleCollapse,
		expandAll,
		collapseAll,
		addItem,
		duplicateItem,
		removeItem,
		moveItemUp,
		moveItemDown,
		updateItem,
		handleReorder,
	} = useRepeaterController<T>({
		items,
		onChange,
		disabled: isLocked,
		createItem,
		cloneItem,
		getItemKey,
		minItems,
		maxItems,
		collapsible,
		defaultCollapsed,
		reorderable: effectiveReorderable,
		canAdd: effectiveCanAdd,
		canDelete: effectiveCanDelete,
		canDuplicate: effectiveCanDuplicate,
		itemErrors,
		autoExpandOnError,
	});

	const globalHelpers = { items, addItem, expandAll, collapseAll, canAdd: isAddAllowed };

	const isTable = layout === "table";
	const showCollapseControls = Boolean((layout === "card" || layout === "simple") && collapsible && items.length > 1);
	const dndActive = Boolean(effectiveReorderable && !isLocked && items.length > 0);

	const wrapWithDnd = (content: ReactNode) =>
		dndActive ? (
			<DynamicSortableDndContext items={keys} onReorder={handleReorder}>
				{content}
			</DynamicSortableDndContext>
		) : (
			content
		);

	return (
		<div
			id={id}
			role="group"
			aria-describedby={describedBy}
			data-invalid={hasError || undefined}
			onBlur={createContainerBlurHandler(onBlur)}
			className={cn("w-full space-y-2.5 pt-1", hasError && "rounded-lg ring-1 ring-destructive/40 p-1.5")}
		>
			<RepeaterToolbar
				itemCount={items.length}
				maxItems={maxItems}
				showCollapseControls={showCollapseControls}
				onExpandAll={expandAll}
				onCollapseAll={collapseAll}
				extraActions={renderExtraActions ? renderExtraActions(globalHelpers) : null}
			/>

			{items.length === 0 ? (
				<div className="border-border/80 bg-card/20 flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center">
					<p className="text-muted-foreground/70 mb-3 text-xs">{emptyText}</p>
					{showEmptyAddButton && isAddAllowed ? (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={addItem}
							className="hover:bg-muted h-7.5 cursor-pointer gap-1.5 text-xs shadow-2xs"
						>
							<Plus aria-hidden="true" className="size-3.5" />
							<span>{addButtonText}</span>
						</Button>
					) : null}
				</div>
			) : isTable ? (
				wrapWithDnd(
					<RepeaterTable<T>
						items={items}
						keys={keys}
						headers={headers}
						disabled={isLocked}
						reorderable={effectiveReorderable}
						canDuplicate={effectiveCanDuplicate}
						checkCanDelete={checkCanDelete}
						confirmDelete={confirmDelete}
						itemErrors={itemErrors}
						renderSummary={renderSummary}
						onMoveUp={moveItemUp}
						onMoveDown={moveItemDown}
						onDuplicate={duplicateItem}
						onRemove={removeItem}
						onUpdate={updateItem}
						renderItem={renderItem}
						isAddAllowed={isAddAllowed}
						onAdd={addItem}
						addButtonText={addButtonText}
					/>,
				)
			) : (
				<>
					{wrapWithDnd(
						<div className="space-y-2">
							{items.map((item, index) => {
								const itemKey = keys[index]!;
								const fallbackTitle = t("repeater_item_fallback", { index: index + 1 });
								const titleNode = itemTitle ? itemTitle(item, index) : fallbackTitle;
								const titleStr = typeof titleNode === "string" ? titleNode : fallbackTitle;

								return (
									<RepeaterRow<T>
										key={itemKey}
										itemKey={itemKey}
										item={item}
										index={index}
										totalItems={items.length}
										layout={layout}
										isCollapsed={Boolean(collapsedMap[itemKey])}
										titleNode={titleNode}
										titleStr={titleStr}
										disabled={isLocked}
										collapsible={collapsible}
										reorderable={effectiveReorderable}
										canDuplicate={checkCanDuplicate(item, index)}
										canDelete={checkCanDelete(item, index)}
										confirmDelete={confirmDelete}
										error={itemErrors?.[index]}
										onToggleCollapse={toggleCollapse}
										onMoveUp={moveItemUp}
										onMoveDown={moveItemDown}
										onDuplicate={duplicateItem}
										onRemove={removeItem}
										onUpdate={updateItem}
										renderItem={renderItem}
									/>
								);
							})}
						</div>,
					)}

					{isAddAllowed ? (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={addItem}
							className="hover:bg-muted h-8.5 w-full cursor-pointer gap-1.5 text-xs shadow-2xs"
						>
							<Plus aria-hidden="true" className="size-3.5" />
							<span>{addButtonText}</span>
						</Button>
					) : null}
				</>
			)}
		</div>
	);
} as <T>(props: RepeaterInnerProps<T>) => ReactNode;
