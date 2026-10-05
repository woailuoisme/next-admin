import { useBoolean, useMemoizedFn } from "ahooks";
import { Loader2 } from "lucide-react";
import { memo, startTransition, useOptimistic } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import type { CheckboxCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";

function CheckboxCellInner<TData = unknown>({
  checked = false,
  row,
  onCellChange,
  showErrorToast = true,
  errorToastMessage,
  disabled = false,
  align = "center",
  className,
}: CheckboxCellProps<TData>) {
  const [optimisticChecked, setOptimistic] = useOptimistic(checked, (_curr, next: boolean) => next);
  const [loading, { setTrue: setLoadingTrue, setFalse: setLoadingFalse }] = useBoolean(false);

  const handleCheckedChange = useMemoizedFn((val: boolean | "indeterminate") => {
    if (disabled || loading) return;
    const nextChecked = val === true;

    startTransition(async () => {
      setOptimistic(nextChecked);
      if (onCellChange) {
        try {
          setLoadingTrue();
          const result = onCellChange(row, nextChecked);
          if (result instanceof Promise) {
            await result;
          }
        } catch (err) {
          if (showErrorToast) {
            const msg =
              typeof errorToastMessage === "function"
                ? errorToastMessage(err)
                : errorToastMessage || "更新勾选失败，已回滚";
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
      <Checkbox
        checked={optimisticChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled || loading}
        aria-label="选择行"
      />
      {loading && <Loader2 className="text-muted-foreground size-3 shrink-0 animate-spin" />}
    </div>
  );
}

export const CheckboxCell = memo(CheckboxCellInner) as typeof CheckboxCellInner;
