import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { type ReactNode, createElement, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import type { TableRouterPort } from "@/components/data-table/adapters";
import {
  parseNextSearchParams,
  useClientTableStateAdapter,
  useUrlTableStateAdapterWithPort,
} from "@/components/data-table/adapters";
import { createTestQueryClient } from "test/test-utils";

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function createMemoryRouterPort(initial: TableRouterPort["searchParams"] = {}) {
  const replaceCalls: Array<Record<string, unknown>> = [];
  const pushCalls: Array<Record<string, unknown>> = [];

  return {
    replaceCalls,
    pushCalls,
    usePort(overrides?: TableRouterPort["searchParams"]): {
      router: TableRouterPort;
      searchParams: TableRouterPort["searchParams"];
    } {
      const [searchParams, setSearchParams] = useState<TableRouterPort["searchParams"]>({
        ...initial,
        ...overrides,
      });

      const navigate: TableRouterPort["navigate"] = (updater, opts) => {
        setSearchParams((prev) => {
          const next = updater(prev);
          if (opts?.replace) {
            replaceCalls.push(next);
          } else {
            pushCalls.push(next);
          }
          const normalized: TableRouterPort["searchParams"] = {};
          for (const [k, v] of Object.entries(next)) {
            if (typeof v === "string" || typeof v === "number" || typeof v === "boolean" || v === undefined) {
              normalized[k] = v;
            }
          }
          return normalized;
        });
      };

      return { router: { searchParams, navigate }, searchParams };
    },
  };
}

describe("DataTable State Adapters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("parses URLSearchParams primitives cleanly without corrupting leading zeros or long strings", () => {
    const params = new URLSearchParams(
      "page=2&pageSize=25&active=true&archived=false&zip=00123&search=hello&empty=&dup=first&dup=second",
    );
    expect(parseNextSearchParams(params)).toEqual({
      page: 2,
      pageSize: 25,
      active: true,
      archived: false,
      zip: "00123",
      search: "hello",
      dup: "first",
    });
  });

  it("strips unknown URL params via searchSchema when building queryOptions so CSR queryKey matches SSR", () => {
    const memory = createMemoryRouterPort({ page: 2, utm_source: "newsletter" });
    const searchSchema = z.object({
      page: z.coerce.number().optional(),
      search: z.string().optional(),
    });
    const receivedFilters: Array<Record<string, unknown>> = [];

    renderHook(
      () => {
        const { router } = memory.usePort();
        return useUrlTableStateAdapterWithPort({
          router,
          search: { page: 2 },
          searchSchema,
          queryOptions: (filters) => {
            receivedFilters.push(filters);
            return {
              queryKey: ["orders", "list", filters],
              queryFn: async () => ({ items: [], total: 0 }),
            };
          },
        });
      },
      { wrapper: createWrapper() },
    );

    expect(receivedFilters[0]).toEqual({ page: 2 });
  });

  it("useUrlTableStateAdapterWithPort manages pagination, sorting, and search via memory TableRouterPort", () => {
    const memory = createMemoryRouterPort({ page: 2, sortBy: "createdAt", sortOrder: "desc" });
    const rows = Array.from({ length: 15 }, (_, idx) => ({ id: String(idx + 1), name: `Order-${idx + 1}` }));

    const { result } = renderHook(
      () => {
        const { router } = memory.usePort();
        return useUrlTableStateAdapterWithPort({
          router,
          search: {},
          data: rows,
          total: 42,
          paginationMode: "server",
          searchDebounceMs: 150,
        });
      },
      { wrapper: createWrapper() },
    );

    expect(result.current.page).toBe(2);
    expect(result.current.state.paginationMode).toBe("server");
    expect(result.current.total).toBe(42);
    expect(result.current.state.sortModel).toEqual([{ field: "createdAt", sort: "desc" }]);

    // Page navigation uses replace so lists don't flood browser history
    act(() => {
      result.current.state.onPageChange(3);
    });
    expect(result.current.page).toBe(3);
    expect(memory.pushCalls).toHaveLength(0);
    expect(memory.replaceCalls).toHaveLength(1);

    // Search debounces and navigates with { replace: true }, resetting page
    const replaceBeforeSearch = memory.replaceCalls.length;
    act(() => {
      result.current.state.onSearchChange?.("urgent");
    });
    expect(memory.replaceCalls).toHaveLength(replaceBeforeSearch);
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(memory.replaceCalls).toHaveLength(replaceBeforeSearch + 1);
    expect(result.current.search.search).toBe("urgent");
    expect(result.current.page).toBe(1);
    expect(result.current.state.filterModel?.quickFilterValues).toEqual(["urgent"]);

    // Sorting clears or updates URL sort params and resets page
    act(() => {
      result.current.state.onSortChange("amount", "asc");
    });
    expect(result.current.state.sortModel).toEqual([{ field: "amount", sort: "asc" }]);
    act(() => {
      result.current.state.onSortChange("amount", null);
    });
    expect(result.current.state.sortModel).toEqual([]);

    // Structured filter items update filterModel.items without being dropped, and reset clears both items & URL search
    act(() => {
      result.current.state.onPageChange(2);
    });
    expect(result.current.page).toBe(2);

    act(() => {
      result.current.state.onFilterModelChange?.({
        items: [{ id: "f1", field: "name", operator: "contains", value: "Order-1" }],
        quickFilterValues: ["urgent"],
      });
    });
    expect(result.current.state.filterModel?.items).toEqual([
      { id: "f1", field: "name", operator: "contains", value: "Order-1" },
    ]);
    expect(result.current.page).toBe(1);

    act(() => {
      result.current.state.onFilterModelChange?.({
        items: [],
        quickFilterValues: [],
      });
    });
    expect(result.current.state.filterModel?.items).toEqual([]);
    expect(result.current.state.filterModel?.quickFilterValues).toEqual([]);
    expect(result.current.search.search).toBeUndefined();
  });

  it("useClientTableStateAdapter manages purely in-memory state with client pagination", () => {
    const rows = [
      { id: "1", name: "Alpha" },
      { id: "2", name: "Beta" },
    ];

    const { result } = renderHook(() =>
      useClientTableStateAdapter({
        data: rows,
        initialPage: 2,
        initialPageSize: 10,
      }),
    );

    expect(result.current.paginationMode).toBe("client");
    expect(result.current.page).toBe(2);
    expect(result.current.total).toBe(2);

    act(() => {
      result.current.onSortModelChange?.([{ field: "name", sort: "desc" }]);
    });
    expect(result.current.page).toBe(1);
    expect(result.current.sortModel).toEqual([{ field: "name", sort: "desc" }]);

    act(() => {
      result.current.onSearchChange?.("beta test");
    });
    expect(result.current.filterModel?.quickFilterValues).toEqual(["beta", "test"]);
    expect(result.current.page).toBe(1);

    act(() => {
      result.current.onPageSizeChange(25);
    });
    expect(result.current.pageSize).toBe(25);
  });
});
