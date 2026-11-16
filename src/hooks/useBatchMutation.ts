import { AsyncQueuer } from "@tanstack/pacer";
import { useBoolean, useLatest, useMemoizedFn } from "ahooks";
import { clamp } from "es-toolkit";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { toastMessages } from "@/lib/toastMessages";

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

export interface UseBatchMutationReturn<TItem, TResult = unknown> {
  mutateBatchAsync: (items: TItem[]) => Promise<TResult[]>;
  isPending: boolean;
  progress: BatchMutationProgress;
  /**
   * Cancels remaining queued tasks and settles immediately.
   */
  cancel: () => void;
}

export function useBatchMutation<TItem, TResult = unknown>(
  options: BatchMutationOptions<TItem, TResult>,
): UseBatchMutationReturn<TItem, TResult> {
  const { concurrency = 3, entityName = "Item" } = options;

  const optionsRef = useLatest(options);
  const [isPending, { setTrue: setPendingTrue, setFalse: setPendingFalse }] = useBoolean(false);
  const [progress, setProgress] = useState<BatchMutationProgress>({
    current: 0,
    total: 0,
  });

  interface BatchRunController {
    cancelled: boolean;
    cancel: () => void;
  }

  const activeRunRef = useRef<BatchRunController | null>(null);

  useEffect(() => {
    return () => {
      activeRunRef.current?.cancel();
      activeRunRef.current = null;
    };
  }, []);

  const cancel = useMemoizedFn(() => {
    const activeRun = activeRunRef.current;
    if (activeRun) {
      activeRun.cancel();
      activeRunRef.current = null;
    }
  });

  const mutateBatchAsync = useMemoizedFn(async (items: TItem[]): Promise<TResult[]> => {
    if (!items || items.length === 0) return [];

    activeRunRef.current?.cancel();
    setPendingTrue();
    setProgress({ current: 0, total: items.length });

    const results: TResult[] = [];
    const failedItems: { item: TItem; error: Error }[] = [];
    let completed = 0;
    let isSettled = false;
    const poolSize = clamp(concurrency, 1, items.length);

    return new Promise<TResult[]>((resolve, reject) => {
      let queuer: AsyncQueuer<TItem> | null = null;
      const runController: BatchRunController = {
        cancelled: false,
        cancel: () => {
          if (isSettled) return;
          isSettled = true;
          runController.cancelled = true;
          try {
            queuer?.clear();
          } finally {
            setPendingFalse();
            if (activeRunRef.current === runController) {
              activeRunRef.current = null;
            }
          }
          resolve(results);
        },
      };

      activeRunRef.current = runController;

      queuer = new AsyncQueuer<TItem>(
        async (item) => {
          if (runController.cancelled) return undefined as TResult;
          return await optionsRef.current.mutationFn(item);
        },
        {
          concurrency: poolSize,
          started: true,
          throwOnError: false,
          onSuccess: (result) => {
            if (!runController.cancelled) {
              results.push(result as TResult);
            }
          },
          onError: (err, item) => {
            if (!runController.cancelled) {
              failedItems.push({
                item,
                error: err instanceof Error ? err : new Error(String(err)),
              });
            }
          },
          onSettled: async () => {
            if (runController.cancelled || isSettled) return;
            completed++;
            setProgress({ current: completed, total: items.length });

            if (completed >= items.length) {
              isSettled = true;
              try {
                const { successMessage, errorMessage, onError, onSuccess } = optionsRef.current;

                if (failedItems.length === 0) {
                  const msg = successMessage
                    ? successMessage(items.length)
                    : toastMessages.batchSuccess(items.length, entityName);
                  toast.success(msg);
                  await onSuccess?.(results, items);
                } else {
                  const msg = errorMessage
                    ? errorMessage(failedItems.length, items.length)
                    : toastMessages.batchPartialError(
                        items.length - failedItems.length,
                        items.length,
                        failedItems.length,
                        entityName,
                      );
                  toast.warning(msg);
                  onError?.(failedItems);
                  if (results.length > 0) {
                    await onSuccess?.(results, items);
                  }
                }
                resolve(results);
              } catch (err) {
                reject(err);
              } finally {
                setPendingFalse();
                if (activeRunRef.current === runController) {
                  activeRunRef.current = null;
                }
              }
            }
          },
        },
      );

      for (const item of items) {
        if (runController.cancelled) break;
        queuer.addItem(item);
      }
    });
  });

  return {
    mutateBatchAsync,
    isPending,
    progress,
    cancel,
  };
}
