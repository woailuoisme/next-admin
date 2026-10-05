import { useBoolean, useLatest, useMemoizedFn } from "ahooks";
import { clamp } from "es-toolkit";
import { useState } from "react";
import { toast } from "sonner";

export interface BatchMutationOptions<TItem, TResult = unknown> {
  /**
   * Async execution function invoked for each individual item.
   */
  mutationFn: (item: TItem) => Promise<TResult>;
  /**
   * Maximum concurrent asynchronous operations running simultaneously. Defaults to 3.
   */
  concurrency?: number;
  /**
   * Noun representing the target entity, e.g. "Product", "Order", "User".
   */
  entityName?: string;
  /**
   * Callback triggered after batch execution finishes (even if partial failures occurred).
   */
  onSuccess?: (results: TResult[], items: TItem[]) => void | Promise<void>;
  /**
   * Callback triggered when any item fails.
   */
  onError?: (failedItems: { item: TItem; error: Error }[]) => void;
  /**
   * Custom success toast message builder.
   */
  successMessage?: (count: number) => string;
  /**
   * Custom warning toast message builder when partial failures happen.
   */
  errorMessage?: (failedCount: number, totalCount: number) => string;
}

export interface BatchMutationProgress {
  current: number;
  total: number;
}

export function useBatchMutation<TItem, TResult = unknown>(
  options: BatchMutationOptions<TItem, TResult>,
) {
  const { concurrency = 3, entityName = "Item" } = options;

  const optionsRef = useLatest(options);
  const [isPending, { setTrue: setPendingTrue, setFalse: setPendingFalse }] = useBoolean(false);
  const [progress, setProgress] = useState<BatchMutationProgress>({
    current: 0,
    total: 0,
  });

  const mutateBatchAsync = useMemoizedFn(async (items: TItem[]): Promise<TResult[]> => {
    if (!items || items.length === 0) return [];

    setPendingTrue();
    setProgress({ current: 0, total: items.length });

    const results: TResult[] = [];
    const failedItems: { item: TItem; error: Error }[] = [];
    let completed = 0;
    let nextIndex = 0;

    const poolSize = clamp(concurrency, 1, items.length);

    async function worker() {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex++;
        const item = items[currentIndex];
        try {
          const res = await optionsRef.current.mutationFn(item);
          results.push(res);
        } catch (err) {
          failedItems.push({
            item,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        } finally {
          completed++;
          setProgress({ current: completed, total: items.length });
        }
      }
    }

    try {
      await Promise.all(Array.from({ length: poolSize }, () => worker()));

      const { successMessage, errorMessage, onError, onSuccess } = optionsRef.current;

      if (failedItems.length === 0) {
        const msg = successMessage
          ? successMessage(items.length)
          : `Successfully processed ${items.length} ${entityName}${items.length > 1 ? "s" : ""}.`;
        toast.success(msg);
      } else {
        const msg = errorMessage
          ? errorMessage(failedItems.length, items.length)
          : `Completed with warnings: ${items.length - failedItems.length}/${items.length} ${entityName}s processed, ${failedItems.length} failed.`;
        toast.warning(msg);
        onError?.(failedItems);
      }

      await onSuccess?.(results, items);
      return results;
    } finally {
      setPendingFalse();
    }
  });

  return {
    mutateBatchAsync,
    isPending,
    progress,
  };
}
