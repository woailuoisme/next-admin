import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemoizedFn } from "ahooks";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  MoveDown,
  MoveUp,
  Trash2,
} from "lucide-react";
import { memo, type ReactNode, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { RepeaterItemHelpers, RepeaterLayout } from "./types";

interface RepeaterRowProps<T> {
  itemKey: string;
  item: T;
  index: number;
  totalItems: number;
  layout?: RepeaterLayout;
  isCollapsed: boolean;
  titleNode: ReactNode;
  titleStr: string;
  disabled?: boolean;
  collapsible?: boolean;
  reorderable?: boolean;
  canDuplicate?: boolean;
  canDelete?: boolean;
  confirmDelete?: boolean;
  error?: string | string[];
  onToggleCollapse: (key: string) => void;
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

export const RepeaterRow = memo(function RepeaterRow<T>({
  itemKey,
  item,
  index,
  totalItems,
  layout = "card",
  isCollapsed,
  titleNode,
  titleStr,
  disabled,
  collapsible = true,
  reorderable = true,
  canDuplicate = true,
  canDelete = true,
  confirmDelete = false,
  error,
  onToggleCollapse,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  onUpdate,
  renderItem,
}: RepeaterRowProps<T>) {
  const [deletePopoverOpen, setDeletePopoverOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: itemKey,
    disabled: disabled || !reorderable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggle = useMemoizedFn(() => {
    onToggleCollapse(itemKey);
  });

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
    isCollapsed,
    hasError,
    error,
    moveUp: handleMoveUp,
    moveDown: handleMoveDown,
    remove: handleDirectRemove,
    duplicate: handleDuplicate,
    toggleCollapse: handleToggle,
    update: handleUpdate,
  };

  const isSimple = layout === "simple";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative transition-shadow duration-150",
        isDragging && "z-30 rounded-lg opacity-75 shadow-lg ring-2 ring-primary/40",
      )}
    >
      <Card
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-card shadow-2xs transition-colors",
          hasError && "border-destructive/60 bg-destructive/5",
          isSimple && "border-dashed bg-transparent shadow-none",
        )}
      >
        <CardHeader
          className={cn(
            "flex flex-row items-center justify-between border-b border-border/60 bg-muted/40 px-3.5 py-2 select-none",
            hasError && "border-destructive/30 bg-destructive/10",
            isSimple && "border-b-dashed bg-transparent",
          )}
        >
          <div className="flex min-w-0 items-center gap-1.5">
            {reorderable && !disabled ? (
              <button
                type="button"
                {...attributes}
                {...listeners}
                aria-label={`拖拽排序 ${titleStr}`}
                className="text-muted-foreground/60 hover:bg-muted/80 hover:text-foreground cursor-grab rounded p-1 transition-colors active:cursor-grabbing"
              >
                <GripVertical className="size-3.5" />
              </button>
            ) : null}

            {collapsible ? (
              <button
                type="button"
                onClick={handleToggle}
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? `展开 ${titleStr}` : `折叠 ${titleStr}`}
                className="text-muted-foreground hover:bg-muted/80 hover:text-foreground cursor-pointer rounded p-1 transition-colors"
              >
                {isCollapsed ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
              </button>
            ) : null}

            <span className="text-foreground truncate text-xs font-semibold">{titleNode}</span>

            {hasError ? (
              <Badge variant="destructive" className="h-4.5 gap-1 px-1.5 text-[10px] font-normal">
                <AlertCircle className="size-2.5" />
                <span>{Array.isArray(error) ? error[0] : error || "存在错误"}</span>
              </Badge>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {canDuplicate && !disabled ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleDuplicate}
                className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 cursor-pointer"
                title="复制此项"
                aria-label={`复制 ${titleStr}`}
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
                  aria-label={`上移 ${titleStr}`}
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
                  aria-label={`下移 ${titleStr}`}
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
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-6 cursor-pointer"
                      title="删除此项"
                      aria-label={`删除 ${titleStr}`}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    side="bottom"
                    className="w-56 space-y-2.5 p-3 text-xs shadow-lg"
                  >
                    <div className="text-foreground font-medium">确认删除此项？</div>
                    <p className="text-muted-foreground text-[11px]">该条目及其填写的表单内容将被移除。</p>
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
                  title="删除此项"
                  aria-label={`删除 ${titleStr}`}
                >
                  <Trash2 className="size-3" />
                </Button>
              )
            ) : null}
          </div>
        </CardHeader>

        {!isCollapsed ? (
          <CardContent className={cn("p-3.5", isSimple && "pt-2")}>
            {renderItem(item, index, handleUpdate, helpers)}
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}) as <T>(props: RepeaterRowProps<T>) => ReactNode;
