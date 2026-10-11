import { closestCenter, DndContext } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronsDownUp, ChevronsUpDown, Plus } from "lucide-react";
import { memo, type ReactNode, useId, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { RepeaterProps } from "./types";

import { FieldConnector, FieldWrapper } from "../../core";
import { RepeaterRow } from "./RepeaterRow";
import { RepeaterTable } from "./RepeaterTable";
import { useRepeaterController } from "./useRepeaterController";

const DEFAULT_EMPTY_ARRAY: unknown[] = [];

interface RepeaterInnerProps<T> extends RepeaterProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
}

const RepeaterInner = memo(function RepeaterInner<T>({
  items,
  onChange,
  disabled,
  layout = "card",
  headers,
  createItem,
  cloneItem,
  renderItem,
  itemTitle,
  getItemKey,
  addButtonText = "添加新项",
  emptyText = "暂无条目，请点击下方按钮新增",
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
  const {
    keys,
    collapsedMap,
    sensors,
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
    handleDragEnd,
  } = useRepeaterController<T>({
    items,
    onChange,
    disabled,
    createItem,
    cloneItem,
    getItemKey,
    minItems,
    maxItems,
    collapsible,
    defaultCollapsed,
    reorderable,
    canAdd,
    canDelete,
    canDuplicate,
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

  return (
    <div className="w-full space-y-2.5 pt-1">
      {/* 顶部工具栏与统计徽标 */}
      <div className="flex min-h-6 items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {items.length > 0 ? (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
              <span>{items.length} 项</span>
              {maxItems !== undefined ? <span className="text-muted-foreground/80">/ {maxItems}</span> : null}
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          {/* 仅在卡片折叠流中展示全部展开/折叠 */}
          {isCardOrSimple && collapsible && items.length > 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={expandAll}
                className="text-muted-foreground hover:text-foreground h-6 gap-1 text-[11px]"
                title="展开全部卡片"
              >
                <ChevronsUpDown className="size-3" />
                <span>全部展开</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={collapseAll}
                className="text-muted-foreground hover:text-foreground h-6 gap-1 text-[11px]"
                title="折叠全部卡片"
              >
                <ChevronsDownUp className="size-3" />
                <span>全部折叠</span>
              </Button>
            </>
          ) : null}

          {renderExtraActions ? renderExtraActions(globalHelpers) : null}
        </div>
      </div>

      {/* 内容主体 */}
      {isTable ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={keys} strategy={verticalListSortingStrategy}>
            <RepeaterTable<T>
              items={items}
              keys={keys}
              headers={headers}
              disabled={disabled}
              reorderable={reorderable}
              canDuplicate={canDuplicate}
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
            />
          </SortableContext>
        </DndContext>
      ) : items.length === 0 ? (
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
              <Plus className="size-3.5" />
              <span>{addButtonText}</span>
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={keys} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {items.map((item, index) => {
                  const itemKey = keys[index]!;
                  const isCollapsed = Boolean(collapsedMap[itemKey]);
                  const titleNode = itemTitle ? itemTitle(item, index) : `项 #${index + 1}`;
                  const titleStr = typeof titleNode === "string" ? titleNode : `项 #${index + 1}`;
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
                      disabled={disabled}
                      collapsible={collapsible}
                      reorderable={reorderable}
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
              </div>
            </SortableContext>
          </DndContext>

          {/* 卡片模式底部全宽新增按钮 */}
          {isAddAllowed ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="hover:bg-muted h-8.5 w-full cursor-pointer gap-1.5 text-xs shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>{addButtonText}</span>
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}) as <T>(props: RepeaterInnerProps<T>) => ReactNode;

export const Repeater = memo(function Repeater<T = unknown>({
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
  disabled,
  value: controlledValue,
  defaultValue = DEFAULT_EMPTY_ARRAY as T[],
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  layout = "card",
  headers,
  createItem,
  cloneItem,
  renderItem,
  itemTitle,
  getItemKey,
  addButtonText = "添加新项",
  emptyText = "暂无条目，请点击下方按钮新增",
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
}: RepeaterProps<T>) {
  const autoId = useId();
  const id = explicitId || (name ? `field-${name}` : autoId);

  return (
    <FieldConnector<T[]>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      error={error}
    >
      {({ value = DEFAULT_EMPTY_ARRAY as T[], onChange, error: computedError }) => {
        const items = Array.isArray(value) ? value : (DEFAULT_EMPTY_ARRAY as T[]);

        return (
          <FieldWrapper
            label={label}
            id={id}
            required={required}
            hint={hint}
            helperText={helperText}
            tooltip={tooltip}
            error={computedError}
            colSpan={colSpan}
            className={className}
            hidden={hidden}
          >
            <RepeaterInner<T>
              items={items}
              onChange={onChange}
              disabled={disabled}
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
          </FieldWrapper>
        );
      }}
    </FieldConnector>
  );
}) as <T = unknown>(props: RepeaterProps<T>) => ReactNode;
