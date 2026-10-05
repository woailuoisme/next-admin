import { useBoolean, useMemoizedFn } from "ahooks";
import { Loader2 } from "lucide-react";
import { memo, startTransition, useOptimistic } from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import type { ToggleCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";

function ToggleCellInner<TData = unknown>({
  checked = false,
  row,
  onCellChange,
  onToggle,
  showErrorToast = true,
  errorToastMessage,
  disabled = false,
  readOnly = false,
  align = "center",
  className,
}: ToggleCellProps<TData>) {
  const handler = onCellChange || onToggle;
  const [optimisticChecked, setOptimistic] = useOptimistic(
    checked,
    (_current, next: boolean) => next,
  );
  const [loading, { setTrue: setLoadingTrue, setFalse: setLoadingFalse }] = useBoolean(false);

  const handleCheckedChange = useMemoizedFn(async (nextChecked: boolean) => {
    if (disabled || readOnly || loading) return;

    startTransition(async () => {
      setOptimistic(nextChecked);
      if (handler) {
        try {
          setLoadingTrue();
          const result = handler(row, nextChecked);
          if (result instanceof Promise) {
            await result;
          }
        } catch (err) {
          if (showErrorToast) {
            const msg =
              typeof errorToastMessage === "function"
                ? errorToastMessage(err)
                : errorToastMessage || "更新状态失败，已回滚";
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
      onClick={(e) => e.stopPropagation()} // Prevent row selection on switch click
    >
      <Switch
        size="sm"
        aria-label="切换状态"
        checked={optimisticChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled || readOnly || loading}
        className={cn(readOnly && "pointer-events-none cursor-default opacity-80")}
      />
      {loading && <Loader2 className="text-muted-foreground size-3 shrink-0 animate-spin" />}
    </div>
  );
}

export const ToggleCell = memo(ToggleCellInner) as typeof ToggleCellInner;
