"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

export interface UseOptimisticCellMutationOptions<TData, TVal> {
  value: TVal;
  row: TData;
  onMutate?: (row: TData, nextValue: TVal) => Promise<boolean | void> | void;
  showErrorToast?: boolean;
  errorToastMessage?: string | ((error: unknown) => string);
  defaultErrorMessage: string;
  disabled?: boolean;
}

/**
 * 统一封装表格内联交互单元格的乐观更新、Transition 挂起态与失败回滚提示。
 */
export function useOptimisticCellMutation<TData, TVal>({
  value,
  row,
  onMutate,
  showErrorToast = true,
  errorToastMessage,
  defaultErrorMessage,
  disabled = false,
}: UseOptimisticCellMutationOptions<TData, TVal>) {
  const [optimisticValue, setOptimisticValue] = useOptimistic(value, (_curr, next: TVal) => next);
  const [isPending, startTransition] = useTransition();

  const triggerMutation = (nextValue: TVal) => {
    if (disabled || isPending) return;

    startTransition(async () => {
      setOptimisticValue(nextValue);
      if (!onMutate) return;

      try {
        const result = onMutate(row, nextValue);
        if (result instanceof Promise) {
          await result;
        }
      } catch (err) {
        if (showErrorToast) {
          const msg =
            typeof errorToastMessage === "function" ? errorToastMessage(err) : errorToastMessage || defaultErrorMessage;
          toast.error(msg);
        }
      }
    });
  };

  return {
    optimisticValue,
    isPending,
    triggerMutation,
  };
}
