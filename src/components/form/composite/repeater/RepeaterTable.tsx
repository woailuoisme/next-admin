import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemoizedFn } from "ahooks";
import { Copy, GripVertical, MoveDown, MoveUp, Plus, Trash2 } from "lucide-react";
import { Fragment, isValidElement, memo, type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { RepeaterHeaderColumn, RepeaterItemHelpers } from "./types";

const NOOP = () => {};

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
  error?: string | string[];
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate: (index: number) => void;
  onRemove: (index: number) => void;
  onUpdate: (nextVal: T, index: number) => void;
  renderItem: (
    item: T,
    index: number,
    updateItem: (val: T) => void,
    helpers: RepeaterItemHelpers<T>,
  ) => ReactNode;
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
  error,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  onUpdate,
  renderItem,
}: RepeaterTableRowProps<T>) {
  const [deletePopoverOpen, setDeletePopoverOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: itemKey,
    disabled: disabled || !reorderable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleMoveUp = useMemoizedFn(() => {
    onMoveUp(index);
  });

  const handleMoveDown = useMemoizedFn(() => {
    onMoveDown(index);
  });

  const handleDuplicate = useMemoizedFn(() => {
    onDuplicate(index);
  });

  const handleDirectRemove = useMemoizedFn(() => {
    setDeletePopoverOpen(false);
    onRemove(index);
  });

  const handleUpdate = useMemoizedFn((nextVal: T) => {
    onUpdate(nextVal, index);
  });

  const hasError = Boolean(error && (Array.isArray(error) ? error.length > 0 : true));
  const isFirst = index === 0;
  const isLast = index === totalItems - 1;

  const helpers: RepeaterItemHelpers<T> = {
    index,
    totalItems,
    isFirst,
    isLast,
    isCollapsed: false,
    hasError,
    error,
    moveUp: handleMoveUp,
    moveDown: handleMoveDown,
    remove: handleDirectRemove,
    duplicate: handleDuplicate,
    toggleCollapse: NOOP,
    update: handleUpdate,
  };

  const rendered = renderItem(item, index, handleUpdate, helpers);

  // 检查子元素是否为 Fragment 或单个 td，若是则直接平铺渲染，避免生成嵌套的 <td>
  const isFragmentOrTd = isValidElement(rendered) && (rendered.type === Fragment || rendered.type === "td");

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-b border-border/40 transition-colors hover:bg-muted/20",
        hasError && "bg-destructive/5 hover:bg-destructive/10",
        isDragging && "z-30 bg-muted opacity-75 shadow-md",
      )}
    >
      {reorderable && !disabled ? (
        <td className="border-border/40 w-8 border-r px-2 py-2 text-center align-middle">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`拖拽排序第 ${index + 1} 行`}
            className="text-muted-foreground/60 hover:bg-muted/80 hover:text-foreground cursor-grab rounded p-1 transition-colors active:cursor-grabbing"
          >
            <GripVertical className="size-3.5" />
          </button>
        </td>
      ) : null}

      {/* 子项内容：若为标准 td 或 Fragment 则由表格直接平铺，若为整体节点则包裹在 td 中 */}
      {isFragmentOrTd ? rendered : <td className="px-3 py-2 align-middle">{rendered}</td>}

      <td className="border-border/40 w-24 shrink-0 border-l px-2 py-2 text-right align-middle">
        <div className="flex items-center justify-end gap-0.5">
          {canDuplicate && !disabled ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleDuplicate}
              className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 cursor-pointer"
              title="复制此行"
            >
              <Copy className="size-3" />
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
                title="上移"
              >
                <MoveUp className="size-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleMoveDown}
                disabled={isLast}
                className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 cursor-pointer disabled:opacity-30"
                title="下移"
              >
                <MoveDown className="size-3" />
              </Button>
            </>
          ) : null}

          {canDelete && !disabled ? (
            confirmDelete ? (
              <Popover open={deletePopoverOpen} onOpenChange={setDeletePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive/80 hover:bg-destructive/10 hover:text-destructive size-6 cursor-pointer transition-colors"
                    title="删除此行"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" side="bottom" className="w-56 space-y-2.5 p-3 text-xs shadow-lg">
                  <div className="text-foreground font-medium">确认删除此行？</div>
                  <p className="text-muted-foreground text-[11px]">该行数据将被即刻移除。</p>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => setDeletePopoverOpen(false)}
                    >
                      取消
                    </Button>
                    <Button type="button" variant="destructive" size="xs" onClick={handleDirectRemove}>
                      确认删除
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleDirectRemove}
                className="text-destructive/80 hover:bg-destructive/10 hover:text-destructive size-6 cursor-pointer transition-colors"
                title="删除此行"
              >
                <Trash2 className="size-3" />
              </Button>
            )
          ) : null}
        </div>
      </td>
    </tr>
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
  renderItem: (
    item: T,
    index: number,
    updateItem: (val: T) => void,
    helpers: RepeaterItemHelpers<T>,
  ) => ReactNode;
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
  addButtonText = "添加新项",
}: RepeaterTableProps<T>) {
  const hasReorderCol = Boolean(reorderable && !disabled);
  const totalCols = (headers?.length || 1) + (hasReorderCol ? 1 : 0) + 1;

  return (
    <div className="border-border/80 bg-card overflow-x-auto rounded-lg border shadow-2xs">
      <table className="w-full caption-bottom border-collapse text-xs">
        <thead className="border-border/60 bg-muted/40 text-muted-foreground border-b font-medium select-none">
          <tr>
            {hasReorderCol ? <th className="border-border/60 w-8 border-r px-2 py-2 text-center" /> : null}
            {headers && headers.length > 0 ? (
              headers.map((col, idx) => (
                <th
                  key={idx}
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
                </th>
              ))
            ) : (
              <th className="text-muted-foreground px-3 py-2 text-left font-medium">明细项目</th>
            )}
            <th className="border-border/60 text-muted-foreground w-24 border-l px-2 py-2 text-right font-medium">
              操作
            </th>
          </tr>
        </thead>

        <tbody className="divide-border/40 divide-y">
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
        </tbody>

        {renderSummary ? (
          <tfoot className="border-border/60 bg-muted/30 border-t font-medium">
            <tr>
              <td colSpan={totalCols} className="px-3 py-2">
                {renderSummary(items)}
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>

      {/* Filament 5 官方原生一体化贯通式底部加行栏 */}
      {isAddAllowed && onAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className="border-border/60 bg-card text-foreground hover:bg-muted/40 active:bg-muted/60 flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 border-t px-3 text-xs font-medium transition-colors"
        >
          <Plus className="text-muted-foreground size-3.5" />
          <span>{addButtonText}</span>
        </button>
      ) : null}
    </div>
  );
}) as <T>(props: RepeaterTableProps<T>) => ReactNode;
