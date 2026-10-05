import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useQuickFilter } from "@/components/data-table/toolbar/hooks/useQuickFilter";

describe("useQuickFilter hook (TanStack Pacer useDebouncer)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with default value and debounce changes", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useQuickFilter({
        value: "init",
        onChange,
        debounceWait: 200,
      }),
    );

    expect(result.current.search).toBe("init");

    act(() => {
      result.current.handleSearchChange("new query");
    });

    expect(result.current.search).toBe("new query");
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("new query");
  });

  it("should clear search and invoke onChange immediately on handleClearSearch", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useQuickFilter({
        value: "active",
        onChange,
        debounceWait: 300,
      }),
    );

    act(() => {
      result.current.handleSearchChange("typing...");
    });

    expect(result.current.search).toBe("typing...");

    act(() => {
      result.current.handleClearSearch();
    });

    expect(result.current.search).toBe("");
    expect(onChange).toHaveBeenCalledWith("");

    // Advance timer to make sure typing... was cancelled
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("");
  });
});
