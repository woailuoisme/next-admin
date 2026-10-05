import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useBatchMutation } from "@/hooks/use-batch-mutation";

describe("useBatchMutation hook (TanStack Pacer AsyncQueuer)", () => {
  it("should process items up to concurrency and report progress", async () => {
    const executed: number[] = [];
    const mutationFn = vi.fn(async (item: number) => {
      executed.push(item);
      return item * 2;
    });

    const { result } = renderHook(() =>
      useBatchMutation({
        concurrency: 2,
        entityName: "Item",
        mutationFn,
      }),
    );

    expect(result.current.isPending).toBe(false);
    expect(result.current.progress).toEqual({ current: 0, total: 0 });

    let results: number[] = [];
    await act(async () => {
      results = await result.current.mutateBatchAsync([1, 2, 3, 4]);
    });

    expect(results).toEqual([2, 4, 6, 8]);
    expect(mutationFn).toHaveBeenCalledTimes(4);
    expect(result.current.isPending).toBe(false);
    expect(result.current.progress).toEqual({ current: 4, total: 4 });
  });

  it("should handle partial failures gracefully without throwing", async () => {
    const onError = vi.fn();
    const mutationFn = vi.fn(async (item: number) => {
      if (item === 2) {
        throw new Error("Item 2 failed");
      }
      return item * 10;
    });

    const { result } = renderHook(() =>
      useBatchMutation({
        concurrency: 2,
        entityName: "Task",
        mutationFn,
        onError,
      }),
    );

    let results: number[] = [];
    await act(async () => {
      results = await result.current.mutateBatchAsync([1, 2, 3]);
    });

    expect(results).toEqual([10, 30]);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith([
      {
        item: 2,
        error: expect.any(Error),
      },
    ]);
  });

  it("should support cancelling remaining items early", async () => {
    const mutationFn = vi.fn(async (item: number) => {
      await new Promise((res) => setTimeout(res, 50));
      return item;
    });

    const { result } = renderHook(() =>
      useBatchMutation({
        concurrency: 1,
        entityName: "SlowItem",
        mutationFn,
      }),
    );

    let promise: Promise<number[]>;
    act(() => {
      promise = result.current.mutateBatchAsync([1, 2, 3, 4, 5]);
    });

    act(() => {
      result.current.cancel();
    });

    await act(async () => {
      await promise;
    });

    expect(result.current.isPending).toBe(false);
  });
});
