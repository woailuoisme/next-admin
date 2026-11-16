"use client";

import { useTranslations } from "next-intl";
import { Copy, GripVertical, MoveDown, MoveUp, Plus } from "lucide-react";
import { Fragment, isValidElement, memo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "cn";

import type { RepeaterHeaderColumn, RepeaterItemHelpers } from "./types";
import { RepeaterDeleteButton, SortableRowSlot, useRepeaterItemShell } from "./useRepeaterItemShell";

interface RepeaterTableRowProps<T> {
  itemKey: string;
  item: T;
  index: number;
  totalItems: number;
  disabled?: boolean;
  reorderable?: boolean;
  canDuplicate?: boolean;
  canDelete?: boolean;
  confirmDelete?: boolean;
  hasActionCol?: boolean;
  error?: string | string[];
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate: (index: number) => void;
  onRemove: (index: number) => void;
  onUpdate: (nextVal: T, index: number) => void;
  renderItem: (item: T, index: number, updateItem: (val: T) => void, helpers: RepeaterItemHelpers<T>) => ReactNode;
}

const RepeaterTableRow = memo(function RepeaterTableRow<T>({
  itemKey,
  item,
  index,
  totalItems,
  disabled,
  reorderable = true,
  canDuplicate = true,
  canDelete = true,
  confirmDelete = false,
  hasActionCol = true,
  error,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  onUpdate,
  renderItem,
}: RepeaterTableRowProps<T>) {
  const t = useTranslations("form");

  const {
    hasError,
    isFirst,
    isLast,
    helpers,
    handleMoveUp,
    handleMoveDown,
    handleDuplicate,
    handleDirectRemove,
    handleUpdate,
  } = useRepeaterItemShell<T>({
    itemKey,
    index,
    totalItems,
    error,
    onMoveUp,
    onMoveDown,
    onDuplicate,
    onRemove,
    onUpdate,
  });

  const rendered = renderItem(item, index, handleUpdate, helpers);

  // 检查子元素是否为 Fragment 或单个 td / TableCell，若是则直接平铺渲染，避免生成嵌套单元格
  const isFragmentOrTd =
    isValidElement(rendered) && (rendered.type === Fragment || rendered.type === "td" || rendered.type === TableCell);

  const rowLabel = `#${index + 1}`;

  return (
    <SortableRowSlot id={itemKey} disabled={disabled || !reorderable}>
      {({ setNodeRef, style: dragStyle, isDragging, attributes: dragAttributes, listeners: dragListeners }) => (
        <TableRow
          ref={setNodeRef}
          style={dragStyle}
          className={cn(
            "border-b border-border/40 transition-colors hover:bg-muted/20",
            hasError && "bg-destructive/5 hover:bg-destructive/10",
            isDragging && "z-30 bg-muted opacity-75 shadow-md",
          )}
        >
          {reorderable && !disabled ? (
            <TableCell className="border-border/40 w-8 border-r px-2 py-2 text-center align-middle">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                {...dragAttributes}
                {...dragListeners}
                aria-label={`${t("repeater_drag_handle")} ${rowLabel}`}
                className="text-muted-foreground/60 hover:bg-muted/80 hover:text-foreground size-6 cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="size-3.5" />
              </Button>
            </TableCell>
          ) : null}

          {isFragmentOrTd ? rendered : <TableCell className="px-3 py-2 align-middle">{rendered}</TableCell>}

          {hasActionCol && (
            <TableCell className="border-border/40 w-24 shrink-0 border-l px-2 py-2 text-right align-middle">
              <div className="flex items-center justify-end gap-0.5">
                {canDuplicate && !disabled ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={handleDuplicate}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 cursor-pointer"
                    title={t("repeater_duplicate")}
                    aria-label={`${t("repeater_duplicate")} ${rowLabel}`}
                  >
                    <Copy aria-hidden="true" className="size-3" />
                  </Button>
                ) : null}

                {reorderable && !disabled ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={handleMoveUp}
                      disabled={isFirst}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 cursor-pointer disabled:opacity-30"
                      title={t("repeater_move_up")}
                      aria-label={`${t("repeater_move_up")} ${rowLabel}`}
                    >
                      <MoveUp aria-hidden="true" className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={handleMoveDown}
                      disabled={isLast}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 cursor-pointer disabled:opacity-30"
                      title={t("repeater_move_down")}
                      aria-label={`${t("repeater_move_down")} ${rowLabel}`}
                    >
                      <MoveDown aria-hidden="true" className="size-3" />
                    </Button>
                  </>
                ) : null}

                {canDelete && !disabled ? (
                  <RepeaterDeleteButton
                    confirmDelete={confirmDelete}
                    onConfirmDelete={handleDirectRemove}
                    ariaLabel={`${t("repeater_delete_row")} ${rowLabel}`}
                    title={t("repeater_delete_row")}
                    confirmTitle={t("repeater_confirm_delete_row_title")}
                    confirmDescription={t("repeater_confirm_delete_row_desc")}
                    cancelLabel={t("repeater_cancel")}
                    confirmLabel={t("repeater_confirm_delete_action")}
                    destructiveHighlight
                  />
                ) : null}
              </div>
            </TableCell>
          )}
        </TableRow>
      )}
    </SortableRowSlot>
  );
}) as <T>(props: RepeaterTableRowProps<T>) => ReactNode;

interface RepeaterTableProps<T> {
  items: T[];
  keys: string[];
  headers?: RepeaterHeaderColumn[];
  disabled?: boolean;
  reorderable?: boolean;
  canDuplicate?: boolean;
  checkCanDelete: (item: T, index: number) => boolean;
  confirmDelete?: boolean;
  itemErrors?: Record<number, string | string[]>;
  renderSummary?: (items: T[]) => ReactNode;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate: (index: number) => void;
  onRemove: (index: number) => void;
  onUpdate: (nextVal: T, index: number) => void;
  renderItem: (item: T, index: number, updateItem: (val: T) => void, helpers: RepeaterItemHelpers<T>) => ReactNode;
  isAddAllowed?: boolean;
  onAdd?: () => void;
  addButtonText?: string;
}

export const RepeaterTable = memo(function RepeaterTable<T>({
  items,
  keys,
  headers,
  disabled,
  reorderable = true,
  canDuplicate = true,
  checkCanDelete,
  confirmDelete = false,
  itemErrors,
  renderSummary,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  onUpdate,
  renderItem,
  isAddAllowed,
  onAdd,
  addButtonText,
}: RepeaterTableProps<T>) {
  const t = useTranslations("form");
  const resolvedAddText = addButtonText ?? t("repeater_add");
  const hasReorderCol = Boolean(reorderable && !disabled);
  const hasActionCol = Boolean(
    !disabled && (canDuplicate || reorderable || items.some((item, index) => checkCanDelete(item, index))),
  );
  const totalCols = (headers?.length || 1) + (hasReorderCol ? 1 : 0) + (hasActionCol ? 1 : 0);

  return (
    <div className="border-border/80 bg-card overflow-hidden rounded-lg border shadow-2xs">
      <Table className="text-xs">
        <TableHeader className="border-border/60 bg-muted/40 text-muted-foreground border-b font-medium select-none">
          <TableRow className="hover:bg-transparent">
            {hasReorderCol ? <TableHead className="border-border/60 w-8 border-r px-2 py-2 text-center" /> : null}
            {headers && headers.length > 0 ? (
              headers.map((col, idx) => {
                const colKey = col.id ?? (typeof col.label === "string" ? col.label : `col-${idx}`);
                return (
                  <TableHead
                    key={colKey}
                    className={cn(
                      "border-r border-border/40 px-3 py-2 text-left font-medium text-muted-foreground last:border-r-0",
                      col.width,
                      col.className,
                    )}
                  >
                    <span className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {col.required && <span className="text-destructive">*</span>}
                    </span>
                  </TableHead>
                );
              })
            ) : (
              <TableHead className="text-muted-foreground px-3 py-2 text-left font-medium">
                {t("repeater_table_default_col")}
              </TableHead>
            )}
            {hasActionCol && (
              <TableHead className="border-border/60 text-muted-foreground w-24 border-l px-2 py-2 text-right font-medium">
                {t("repeater_table_actions_col")}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody className="divide-border/40 divide-y">
          {items.map((item, index) => {
            const key = keys[index]!;
            const canDeleteThis = checkCanDelete(item, index);
            const error = itemErrors?.[index];

            return (
              <RepeaterTableRow
                key={key}
                itemKey={key}
                item={item}
                index={index}
                totalItems={items.length}
                disabled={disabled}
                reorderable={reorderable}
                canDuplicate={canDuplicate}
                canDelete={canDeleteThis}
                hasActionCol={hasActionCol}
                confirmDelete={confirmDelete}
                error={error}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onDuplicate={onDuplicate}
                onRemove={onRemove}
                onUpdate={onUpdate}
                renderItem={renderItem}
              />
            );
          })}
        </TableBody>

        {renderSummary ? (
          <TableFooter className="border-border/60 bg-muted/30 border-t font-medium">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={totalCols} className="px-3 py-2">
                {renderSummary(items)}
              </TableCell>
            </TableRow>
          </TableFooter>
        ) : null}
      </Table>

      {isAddAllowed && onAdd ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onAdd}
          className="border-border/60 bg-card text-foreground hover:bg-muted/40 active:bg-muted/60 h-9 w-full rounded-none border-t px-3 text-xs font-medium"
        >
          <Plus className="text-muted-foreground size-3.5" />
          <span>{resolvedAddText}</span>
        </Button>
      ) : null}
    </div>
  );
}) as <T>(props: RepeaterTableProps<T>) => ReactNode;
