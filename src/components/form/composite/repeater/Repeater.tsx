"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ChevronsDownUp, ChevronsUpDown, Plus } from "lucide-react";
import { memo, type ReactNode, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

import type { RepeaterProps } from "./types";

import { createContainerBlurHandler, FormFieldEngine } from "../../core";
import { RepeaterRow } from "./RepeaterRow";
import { RepeaterTable } from "./RepeaterTable";
import { useRepeaterController } from "./useRepeaterController";

const DynamicSortableDndContext = dynamic(() => import("../SortableDndContext").then((mod) => mod.SortableDndContext), {
  ssr: false,
});

const DEFAULT_EMPTY_ARRAY: unknown[] = [];

interface RepeaterInnerProps<T> extends RepeaterProps<T> {
  id: string;
  readOnly?: boolean;
  items: T[];
  onChange: (items: T[]) => void;
  onBlur?: () => void;
  hasError?: boolean;
  describedBy?: string;
}

const RepeaterInner = memo(function RepeaterInner<T>({
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

  const globalHelpers = useMemo(
    () => ({
      items,
      addItem,
      expandAll,
      collapseAll,
      canAdd: isAddAllowed,
    }),
    [items, addItem, expandAll, collapseAll, isAddAllowed],
  );

  const isTable = layout === "table";
  const isCardOrSimple = layout === "card" || layout === "simple";
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
      {/* 顶部工具栏与统计徽标 */}
      <div className="flex min-h-6 items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {items.length > 0 ? (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
              <span>{t("repeater_count", { count: items.length })}</span>
              {maxItems !== undefined ? <span className="text-muted-foreground/80">/ {maxItems}</span> : null}
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          {isCardOrSimple && collapsible && items.length > 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={expandAll}
                className="text-muted-foreground hover:text-foreground h-6 gap-1 text-[11px]"
                title={t("repeater_expand_all")}
              >
                <ChevronsUpDown aria-hidden="true" className="size-3" />
                <span>{t("repeater_expand_all")}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={collapseAll}
                className="text-muted-foreground hover:text-foreground h-6 gap-1 text-[11px]"
                title={t("repeater_collapse_all")}
              >
                <ChevronsDownUp aria-hidden="true" className="size-3" />
                <span>{t("repeater_collapse_all")}</span>
              </Button>
            </>
          ) : null}

          {renderExtraActions ? renderExtraActions(globalHelpers) : null}
        </div>
      </div>

      {/* 内容主体 */}
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
                const isCollapsed = Boolean(collapsedMap[itemKey]);
                const fallbackTitle = t("repeater_item_fallback", { index: index + 1 });
                const titleNode = itemTitle ? itemTitle(item, index) : fallbackTitle;
                const titleStr = typeof titleNode === "string" ? titleNode : fallbackTitle;
                const canDeleteThis = checkCanDelete(item, index);
                const canDuplicateThis = checkCanDuplicate(item, index);
                const error = itemErrors?.[index];

                return (
                  <RepeaterRow<T>
                    key={itemKey}
                    itemKey={itemKey}
                    item={item}
                    index={index}
                    totalItems={items.length}
                    layout={layout}
                    isCollapsed={isCollapsed}
                    titleNode={titleNode}
                    titleStr={titleStr}
                    disabled={isLocked}
                    collapsible={collapsible}
                    reorderable={effectiveReorderable}
                    canDuplicate={canDuplicateThis}
                    canDelete={canDeleteThis}
                    confirmDelete={confirmDelete}
                    error={error}
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
}) as <T>(props: RepeaterInnerProps<T>) => ReactNode;

export const Repeater = memo(function Repeater<T = unknown>({
  defaultValue = DEFAULT_EMPTY_ARRAY as T[],
  layout = "card",
  headers,
  createItem,
  cloneItem,
  renderItem,
  itemTitle,
  getItemKey,
  addButtonText,
  emptyText,
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
  ...fieldProps
}: RepeaterProps<T>) {
  return (
    <FormFieldEngine<T[]> defaultValue={defaultValue} {...fieldProps}>
      {({
        id,
        value = DEFAULT_EMPTY_ARRAY as T[],
        onChange,
        onBlur,
        disabled: isDisabled,
        readOnly: isReadOnly,
        hasError,
        describedBy,
      }) => {
        const items = Array.isArray(value) ? value : (DEFAULT_EMPTY_ARRAY as T[]);

        return (
          <RepeaterInner<T>
            id={id}
            items={items}
            onChange={onChange}
            onBlur={onBlur}
            hasError={hasError}
            describedBy={describedBy}
            disabled={isDisabled}
            readOnly={isReadOnly}
            layout={layout}
            headers={headers}
            createItem={createItem}
            cloneItem={cloneItem}
            renderItem={renderItem}
            itemTitle={itemTitle}
            getItemKey={getItemKey}
            addButtonText={addButtonText}
            emptyText={emptyText}
            showEmptyAddButton={showEmptyAddButton}
            minItems={minItems}
            maxItems={maxItems}
            collapsible={collapsible}
            defaultCollapsed={defaultCollapsed}
            reorderable={reorderable}
            canAdd={canAdd}
            canDelete={canDelete}
            canDuplicate={canDuplicate}
            confirmDelete={confirmDelete}
            itemErrors={itemErrors}
            autoExpandOnError={autoExpandOnError}
            renderSummary={renderSummary}
            renderExtraActions={renderExtraActions}
          />
        );
      }}
    </FormFieldEngine>
  );
}) as <T = unknown>(props: RepeaterProps<T>) => ReactNode;
