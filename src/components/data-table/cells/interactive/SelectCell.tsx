import { useBoolean, useMemoizedFn } from "ahooks";
import { Loader2 } from "lucide-react";
import { memo, startTransition, useOptimistic } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { SelectCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";

function SelectCellInner<TData = unknown, TVal extends string = string>({
  value,
  options,
  row,
  onCellChange,
  showErrorToast = true,
  errorToastMessage,
  disabled = false,
  align = "left",
  className,
}: SelectCellProps<TData, TVal>) {
  const [optimisticValue, setOptimistic] = useOptimistic(value, (_curr, next: TVal) => next);
  const [loading, { setTrue: setLoadingTrue, setFalse: setLoadingFalse }] = useBoolean(false);

  const handleValueChange = useMemoizedFn((nextValue: string) => {
    if (disabled || loading || nextValue === optimisticValue) return;

    const typedNext = nextValue as TVal;
    startTransition(async () => {
      setOptimistic(typedNext);
      if (onCellChange) {
        try {
          setLoadingTrue();
          const result = onCellChange(row, typedNext);
          if (result instanceof Promise) {
            await result;
          }
        } catch (err) {
          if (showErrorToast) {
            const msg =
              typeof errorToastMessage === "function"
                ? errorToastMessage(err)
                : errorToastMessage || "更新选项失败，已回滚";
            toast.error(msg);
          }
        } finally {
          setLoadingFalse();
        }
      }
    });
  });

  return (
    <div
      className={cn("flex items-center gap-1.5", JUSTIFY_ALIGN_CLASSES[align], className)}
      onClick={(e) => e.stopPropagation()}
    >
      <Select
        value={optimisticValue}
        onValueChange={handleValueChange}
        disabled={disabled || loading}
      >
        <SelectTrigger
          size="sm"
          aria-label="选择值"
          className="bg-background/50 h-7 max-w-[150px] min-w-[90px] text-xs"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {options.map((opt) => (
            <SelectItem
              key={String(opt.value)}
              value={String(opt.value)}
              disabled={opt.disabled}
              className="text-xs"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {loading && <Loader2 className="text-muted-foreground size-3 shrink-0 animate-spin" />}
    </div>
  );
}

export const SelectCell = memo(SelectCellInner) as typeof SelectCellInner;
