import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { type ReactNode, createElement } from "react";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseScalarSearchParam } from "@/components/data-table/core/tableSearchSchema";
import { useResourceController } from "@/components/resource/useResourceController";
import { defineResource } from "@/lib/resource";
import { createTestQueryClient } from "test/test-utils";

function createWrapper(initialSearchParams = "", onUrlUpdate?: (qs: string) => void) {
  const queryClient = createTestQueryClient();
  const NuqsWrapper = withNuqsTestingAdapter({
    searchParams: initialSearchParams,
    hasMemory: true,
    rateLimitFactor: 0,
    onUrlUpdate: onUrlUpdate ? (e) => onUrlUpdate(e.queryString) : undefined,
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(NuqsWrapper, null, createElement(QueryClientProvider, { client: queryClient }, children));
  };
}

describe("DataTable & Resource State Controllers", () => {
  it("parses scalar search params cleanly without corrupting leading zeros", () => {
    expect(parseScalarSearchParam("2")).toBe(2);
    expect(parseScalarSearchParam("true")).toBe(true);
    expect(parseScalarSearchParam("false")).toBe(false);
    expect(parseScalarSearchParam("00123")).toBe("00123");
    expect(parseScalarSearchParam("hello")).toBe("hello");
  });

  it("strips unknown URL params via searchSchema so CSR queryKey matches SSR", () => {
    const searchSchema = z.object({
      page: z.coerce.number().optional(),
      search: z.string().optional(),
    });
    const receivedFilters: Array<Record<string, unknown>> = [];

    const testResource = defineResource<{ id: string }, Record<string, unknown>, z.infer<typeof searchSchema>>({
      name: "orders",
      entityName: "Order",
      basePath: "/orders",
      endpoint: "orders",
      i18nNamespace: "orders",
      searchSchema,
      api: {
        list: async (filters) => {
          receivedFilters.push(filters);
          return { items: [], total: 0 };
        },
        detail: async (id) => ({ id }),
      },
    });

    renderHook(
      () =>
        useResourceController({
          resource: testResource,
          search: { page: 2 },
        }),
      { wrapper: createWrapper("?page=2&utm_source=newsletter") },
    );

    expect(receivedFilters[0]).toEqual({ page: 2 });
  });

  it("useResourceController manages pagination, sorting, and filtering via nuqs", async () => {
    const urlUpdates: string[] = [];
    const rows = Array.from({ length: 15 }, (_, idx) => ({ id: String(idx + 1), name: `Order-${idx + 1}` }));

    const { result } = renderHook(
      () =>
        useResourceController({
          data: rows,
          total: 42,
          paginationMode: "server",
        }),
      {
        wrapper: createWrapper("?page=2&sortBy=createdAt&sortOrder=desc", (qs) => urlUpdates.push(qs)),
      },
    );

    expect(result.current.tableState.page).toBe(2);
    expect(result.current.tableState.paginationMode).toBe("server");
    expect(result.current.total).toBe(42);
    expect(result.current.tableState.sortModel).toEqual([{ field: "createdAt", sort: "desc" }]);

    act(() => {
      result.current.tableState.onPageChange(3);
    });
    expect(result.current.tableState.page).toBe(3);

    act(() => {
      result.current.tableState.onSearchChange?.("urgent");
    });
    expect(result.current.search.search).toBe("urgent");
    expect(result.current.tableState.page).toBe(1);
    expect(result.current.tableState.filterModel?.quickFilterValues).toEqual(["urgent"]);

    act(() => {
      result.current.tableState.onSortChange("amount", "asc");
    });
    expect(result.current.tableState.sortModel).toEqual([{ field: "amount", sort: "asc" }]);
    act(() => {
      result.current.tableState.onSortChange("amount", null);
    });
    expect(result.current.tableState.sortModel).toEqual([]);

    act(() => {
      result.current.tableState.onFilterModelChange?.({
        items: [{ id: "f1", field: "name", operator: "contains", value: "Order-1" }],
        quickFilterValues: ["urgent"],
      });
    });
    expect(result.current.tableState.filterModel?.items).toEqual([
      { id: "f1", field: "name", operator: "contains", value: "Order-1" },
    ]);
    expect(result.current.tableState.page).toBe(1);

    act(() => {
      result.current.tableState.onFilterModelChange?.({
        items: [],
        quickFilterValues: [],
      });
    });
    expect(result.current.tableState.filterModel?.items).toEqual([]);
    expect(result.current.tableState.filterModel?.quickFilterValues).toEqual([]);
    expect(result.current.search.search).toBeUndefined();
    await waitFor(() => expect(urlUpdates.length).toBeGreaterThan(0));
  });
});
