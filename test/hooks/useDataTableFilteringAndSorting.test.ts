import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DataTableColDef, DataTableFilterOperator } from "@/components/data-table/core/types";
import { useDataTableFiltering } from "@/components/data-table/hooks/useDataTableFiltering";
import { resolveNextSortDirection, useDataTableSorting } from "@/components/data-table/hooks/useDataTableSorting";

interface ProductRow {
  id: string;
  title: string;
  category: string;
  stock: number;
  featured: boolean;
  note?: string | null;
}

const columns: DataTableColDef<ProductRow>[] = [
  { field: "title", headerName: "Title" },
  { field: "category", headerName: "Category" },
  { field: "stock", headerName: "Stock" },
  { field: "featured", headerName: "Featured" },
  { field: "note", headerName: "Note" },
];

const rows: ProductRow[] = [
  { id: "1", title: "Pro Keyboard", category: "hardware", stock: 25, featured: true, note: "Mechanical" },
  { id: "2", title: "Wireless Mouse", category: "hardware", stock: 10, featured: false, note: "" },
  { id: "3", title: "Cloud Plan", category: "software", stock: 100, featured: true, note: null },
];

describe("useDataTableFiltering & useDataTableSorting", () => {
  it("supports all 13 filter operators in client mode and bypasses in server mode", () => {
    const cases: Array<{
      field: keyof ProductRow;
      operator: DataTableFilterOperator;
      value?: unknown;
      expectedIds: string[];
    }> = [
      { field: "title", operator: "contains", value: "mouse", expectedIds: ["2"] },
      { field: "title", operator: "notContains", value: "mouse", expectedIds: ["1", "3"] },
      { field: "category", operator: "equals", value: "hardware", expectedIds: ["1", "2"] },
      { field: "category", operator: "notEquals", value: "hardware", expectedIds: ["3"] },
      { field: "title", operator: "startsWith", value: "pro", expectedIds: ["1"] },
      { field: "title", operator: "endsWith", value: "plan", expectedIds: ["3"] },
      { field: "note", operator: "isEmpty", expectedIds: ["2", "3"] },
      { field: "note", operator: "isNotEmpty", expectedIds: ["1"] },
      { field: "stock", operator: "greaterThan", value: 25, expectedIds: ["3"] },
      { field: "stock", operator: "greaterThanOrEqual", value: 25, expectedIds: ["1", "3"] },
      { field: "stock", operator: "lessThan", value: 25, expectedIds: ["2"] },
      { field: "stock", operator: "lessThanOrEqual", value: 25, expectedIds: ["1", "2"] },
      { field: "featured", operator: "is", value: "true", expectedIds: ["1", "3"] },
    ];

    for (const c of cases) {
      const { result } = renderHook(() =>
        useDataTableFiltering({
          rows,
          columns,
          visibleColumns: columns,
          filterModel: {
            items: [{ id: "rule-1", field: c.field, operator: c.operator, value: c.value }],
          },
        }),
      );
      expect(
        result.current.filteredRows.map((r) => r.id),
        `operator=${c.operator}`,
      ).toEqual(c.expectedIds);
    }

    // Quick filter combines tokens across visible columns
    const { result: combined } = renderHook(() =>
      useDataTableFiltering({
        rows,
        columns,
        visibleColumns: columns,
        filterModel: {
          items: [{ id: "r", field: "category", operator: "equals", value: "hardware" }],
          quickFilterValues: ["keyboard"],
        },
      }),
    );
    expect(combined.current.quickFilterText).toBe("keyboard");
    expect(combined.current.filteredRows.map((r) => r.id)).toEqual(["1"]);

    // Server mode preserves original rows without client filtering
    const { result: server } = renderHook(() =>
      useDataTableFiltering({
        rows,
        columns,
        visibleColumns: columns,
        filterMode: "server",
        filterModel: { items: [{ id: "r", field: "title", operator: "equals", value: "none" }] },
      }),
    );
    expect(server.current.filteredRows).toBe(rows);
  });

  it("handles controlled quickFilter updates outside state updater and multi-column sorting", () => {
    const onFilterModelChange = vi.fn();
    const { result } = renderHook(() =>
      useDataTableFiltering({
        rows,
        columns,
        visibleColumns: columns,
        filterModel: { items: [], quickFilterValues: ["initial"] },
        onFilterModelChange,
      }),
    );

    act(() => {
      result.current.handleQuickFilterChange("pro hardware");
    });
    expect(onFilterModelChange).toHaveBeenCalledWith({
      items: [],
      quickFilterValues: ["pro", "hardware"],
    });

    // Multi-column sorting & direction cycling
    expect(resolveNextSortDirection([], "stock")).toBe("asc");
    expect(resolveNextSortDirection([{ field: "stock", sort: "asc" }], "stock")).toBe("desc");
    expect(resolveNextSortDirection([{ field: "stock", sort: "desc" }], "stock")).toBeNull();

    const { result: sorting } = renderHook(() => useDataTableSorting({ columns }));
    act(() => {
      sorting.current.handleSortModelChange([
        { field: "category", sort: "asc" },
        { field: "stock", sort: "desc" },
      ]);
    });
    expect(sorting.current.sortRows(rows).map((r) => r.id)).toEqual(["1", "2", "3"]);
  });
});
