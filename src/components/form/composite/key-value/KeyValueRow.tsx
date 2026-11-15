"use client";

import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { AlertCircle, Eye, EyeOff, GripVertical, Trash2 } from "lucide-react";
import { memo, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import type { KeyValueRowItem } from "./types";

import { SortableRowSlot } from "../repeater/useRepeaterItemShell";

interface KeyValueRowProps {
  row: KeyValueRowItem;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  keySuggestions?: string[];
  disabled?: boolean;
  readOnly?: boolean;
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
  keyPlaceholder: propKeyPlaceholder,
  valuePlaceholder: propValuePlaceholder,
  keySuggestions,
  disabled,
  readOnly,
  canEditKeys = true,
  canDelete = true,
  reorderable = true,
  masked = false,
  onKeyChange,
  onValueChange,
  onRemove,
  onBlur,
}: KeyValueRowProps) {
  const t = useTranslations("form");
  const keyPlaceholder = propKeyPlaceholder ?? t("keyvalue_key_placeholder");
  const valuePlaceholder = propValuePlaceholder ?? t("keyvalue_value_placeholder");
  const datalistId = useId();
  const [revealed, setRevealed] = useState(false);

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
  const canReorder = Boolean(reorderable && !disabled && !readOnly);

  return (
    <SortableRowSlot id={row._id} disabled={!canReorder}>
      {({ setNodeRef, style, isDragging, attributes, listeners }) => (
        <TableRow
          ref={setNodeRef}
          style={style}
          className={cn(
            "group transition-colors hover:bg-muted/15",
            row.isDuplicate && "bg-destructive/5 hover:bg-destructive/10",
            isDragging && "z-30 bg-muted/60 opacity-75 shadow-md",
          )}
        >
          {/* 拖拽排序把手列 */}
          {canReorder ? (
            <TableCell className="border-border/40 w-8 border-r px-2 py-1 text-center align-middle">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                {...attributes}
                {...listeners}
                aria-label={t("keyvalue_drag_handle")}
                className="text-muted-foreground/50 hover:bg-muted/80 hover:text-foreground size-6 cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="size-3.5" />
              </Button>
            </TableCell>
          ) : null}

          {/* Key 单元格（带右侧中缝分割线） */}
          <TableCell className="border-border/40 relative border-r p-0 align-middle">
            <div className="relative flex items-center">
              <Input
                value={row.key}
                onChange={handleKeyChange}
                onBlur={onBlur}
                placeholder={keyPlaceholder}
                disabled={disabled || !canEditKeys}
                readOnly={readOnly}
                list={hasSuggestions ? datalistId : undefined}
                aria-label={keyPlaceholder}
                aria-invalid={row.isDuplicate || undefined}
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={t("keyvalue_duplicate_tooltip")}
                        className="text-destructive focus-visible:ring-ring flex size-4 items-center justify-center rounded-sm p-0 hover:bg-transparent focus-visible:ring-2"
                      >
                        <AlertCircle className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">{t("keyvalue_duplicate_tooltip")}</TooltipContent>
                  </Tooltip>
                </div>
              ) : null}
            </div>
          </TableCell>

          {/* Value 单元格与行尾删除按钮 */}
          <TableCell className="relative p-0 align-middle">
            <div className="flex items-center">
              <Input
                type={isValueMasked ? "password" : "text"}
                value={row.value}
                onChange={handleValueChange}
                onBlur={onBlur}
                placeholder={valuePlaceholder}
                disabled={disabled}
                readOnly={readOnly}
                aria-label={valuePlaceholder}
                className={cn(
                  "h-9 flex-1 rounded-none border-0 bg-transparent px-3 py-1.5 text-xs text-foreground shadow-none outline-hidden transition-colors placeholder:text-muted-foreground/50 focus-visible:bg-muted/20 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
                  masked && "pr-2 font-mono",
                )}
              />
              {masked && !disabled ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={toggleReveal}
                  aria-label={revealed ? t("keyvalue_hide_value") : t("keyvalue_show_value")}
                  className="text-muted-foreground/60 hover:text-foreground mr-1 size-6 cursor-pointer"
                >
                  {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
              ) : null}

              {canDelete && !disabled && !readOnly ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleRemove}
                  className="text-destructive/80 hover:bg-destructive/10 hover:text-destructive mr-1.5 size-7 shrink-0 cursor-pointer transition-colors"
                  title={t("keyvalue_delete_row")}
                  aria-label={t("keyvalue_delete_row")}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              ) : null}
            </div>
          </TableCell>
        </TableRow>
      )}
    </SortableRowSlot>
  );
});
KeyValueRow.displayName = "KeyValueRow";
