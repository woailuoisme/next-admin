import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemoizedFn } from "ahooks";
import { AlertCircle, Eye, EyeOff, GripVertical, Trash2 } from "lucide-react";
import { memo, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { KeyValueRowItem } from "./types";

interface KeyValueRowProps {
  row: KeyValueRowItem;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  keySuggestions?: string[];
  disabled?: boolean;
  canEditKeys?: boolean;
  canDelete?: boolean;
  reorderable?: boolean;
  masked?: boolean;
  onKeyChange: (rowId: string, nextKey: string) => void;
  onValueChange: (rowId: string, nextVal: string) => void;
  onRemove: (rowId: string) => void;
  onBlur?: () => void;
}

export const KeyValueRow = memo(function KeyValueRow({
  row,
  keyPlaceholder = "键名 (Key)",
  valuePlaceholder = "键值 (Value)",
  keySuggestions,
  disabled,
  canEditKeys = true,
  canDelete = true,
  reorderable = true,
  masked = false,
  onKeyChange,
  onValueChange,
  onRemove,
  onBlur,
}: KeyValueRowProps) {
  const datalistId = useId();
  const [revealed, setRevealed] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row._id,
    disabled: disabled || !reorderable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleKeyChange = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
    onKeyChange(row._id, e.target.value);
  });

  const handleValueChange = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(row._id, e.target.value);
  });

  const handleRemove = useMemoizedFn(() => {
    onRemove(row._id);
  });

  const toggleReveal = useMemoizedFn(() => {
    setRevealed((prev) => !prev);
  });

  const isValueMasked = masked && !revealed;
  const hasSuggestions = Boolean(keySuggestions && keySuggestions.length > 0);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "group transition-colors hover:bg-muted/15",
        row.isDuplicate && "bg-destructive/5 hover:bg-destructive/10",
        isDragging && "z-30 bg-muted/60 opacity-75 shadow-md",
      )}
    >
      {/* 拖拽排序把手列 */}
      {reorderable && !disabled ? (
        <td className="border-border/40 w-8 border-r px-2 py-1 text-center align-middle">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="拖拽重新排序"
            className="text-muted-foreground/50 hover:bg-muted/80 hover:text-foreground cursor-grab rounded p-1 transition-colors active:cursor-grabbing"
          >
            <GripVertical className="size-3.5" />
          </button>
        </td>
      ) : null}

      {/* Key 单元格（带右侧中缝分割线） */}
      <td className="border-border/40 relative border-r p-0 align-middle">
        <div className="relative flex items-center">
          <Input
            value={row.key}
            onChange={handleKeyChange}
            onBlur={onBlur}
            placeholder={keyPlaceholder}
            disabled={disabled || !canEditKeys}
            list={hasSuggestions ? datalistId : undefined}
            className={cn(
              "h-9 w-full rounded-none border-0 bg-transparent px-3 py-1.5 font-mono text-xs text-foreground shadow-none outline-hidden transition-colors placeholder:text-muted-foreground/50 focus-visible:bg-muted/20 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
              row.isDuplicate && "bg-destructive/5 pr-7 text-destructive focus-visible:bg-destructive/10",
            )}
          />
          {hasSuggestions ? (
            <datalist id={datalistId}>
              {keySuggestions?.map((sug) => (
                <option key={sug} value={sug} />
              ))}
            </datalist>
          ) : null}

          {row.isDuplicate ? (
            <div className="absolute top-1/2 right-2 -translate-y-1/2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="text-destructive size-3.5 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top">该键名重复，将被后者覆盖</TooltipContent>
              </Tooltip>
            </div>
          ) : null}
        </div>
      </td>

      {/* Value 单元格与行尾删除按钮 */}
      <td className="relative p-0 align-middle">
        <div className="flex items-center">
          <Input
            type={isValueMasked ? "password" : "text"}
            value={row.value}
            onChange={handleValueChange}
            onBlur={onBlur}
            placeholder={valuePlaceholder}
            disabled={disabled}
            className={cn(
              "h-9 flex-1 rounded-none border-0 bg-transparent px-3 py-1.5 text-xs text-foreground shadow-none outline-hidden transition-colors placeholder:text-muted-foreground/50 focus-visible:bg-muted/20 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
              masked && "pr-2 font-mono",
            )}
          />
          {masked && !disabled ? (
            <button
              type="button"
              onClick={toggleReveal}
              aria-label={revealed ? "隐藏值" : "显示值"}
              className="text-muted-foreground/60 hover:text-foreground mr-1 cursor-pointer p-1 transition-colors"
            >
              {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          ) : null}

          {canDelete && !disabled ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleRemove}
              className="text-destructive/80 hover:bg-destructive/10 hover:text-destructive mr-1.5 size-7 shrink-0 cursor-pointer transition-colors"
              title="删除此项"
            >
              <Trash2 className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </td>
    </tr>
  );
});
KeyValueRow.displayName = "KeyValueRow";
