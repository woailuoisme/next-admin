import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  computePinningOffsets,
  type DataTableColDef,
  type DataTableFilterOperator,
  resolveNextSortDirection,
  useDataTableEngine,
} from "@/components/data-table/core";

interface ProductRow {
  id: string;
  title: string;
  category: string;
  stock: number;
  featured: boolean;
  note?: string | null;
  locked?: boolean;
}

const columns: DataTableColDef<ProductRow>[] = [
  { field: "id", headerName: "ID", width: 80, minWidth: 60, maxWidth: 160, pinned: "left" },
  { field: "title", headerName: "Title", width: 200, minWidth: 100, maxWidth: 300 },
  { field: "category", headerName: "Category", width: 120 },
  { field: "stock", headerName: "Stock", width: 100 },
  { field: "featured", headerName: "Featured", width: 100 },
  { field: "note", headerName: "Note", width: 140 },
  { field: "actions", headerName: "Actions", width: 90, pinned: "right" },
];

const rows: ProductRow[] = [
  { id: "r1", title: "Pro Keyboard", category: "hardware", stock: 25, featured: true, note: "Mechanical" },
  { id: "r2", title: "Wireless Mouse", category: "hardware", stock: 10, featured: false, note: "", locked: true },
  { id: "r3", title: "Cloud Plan", category: "software", stock: 100, featured: true, note: null },
  { id: "r4", title: "Desk Mat", category: "hardware", stock: 5, featured: false, note: "Wool" },
];

describe("useDataTableEngine (@tanstack/react-table v9)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("supports all 13 filter operators, multi-token quickFilter, multi-column sorting and server bypass", () => {
    const sampleRows = rows.slice(0, 3);
    const cases: Array<{
      field: keyof ProductRow;
      operator: DataTableFilterOperator;
      value?: unknown;
      expectedIds: string[];
    }> = [
      { field: "title", operator: "contains", value: "mouse", expectedIds: ["r2"] },
      { field: "title", operator: "notContains", value: "mouse", expectedIds: ["r1", "r3"] },
      { field: "category", operator: "equals", value: "hardware", expectedIds: ["r1", "r2"] },
      { field: "category", operator: "notEquals", value: "hardware", expectedIds: ["r3"] },
      { field: "title", operator: "startsWith", value: "pro", expectedIds: ["r1"] },
      { field: "title", operator: "endsWith", value: "plan", expectedIds: ["r3"] },
      { field: "note", operator: "isEmpty", expectedIds: ["r2", "r3"] },
      { field: "note", operator: "isNotEmpty", expectedIds: ["r1"] },
      { field: "stock", operator: "greaterThan", value: 25, expectedIds: ["r3"] },
      { field: "stock", operator: "greaterThanOrEqual", value: 25, expectedIds: ["r1", "r3"] },
      { field: "stock", operator: "lessThan", value: 25, expectedIds: ["r2"] },
      { field: "stock", operator: "lessThanOrEqual", value: 25, expectedIds: ["r1", "r2"] },
      { field: "featured", operator: "is", value: "true", expectedIds: ["r1", "r3"] },
    ];

    for (const c of cases) {
      const { result } = renderHook(() =>
        useDataTableEngine({
          data: sampleRows,
          columns,
          filterModel: { items: [{ id: "rule-1", field: c.field, operator: c.operator, value: c.value }] },
        }),
      );
      expect(
        result.current.processedRows.map((r) => r.id),
        `operator=${c.operator}`,
      ).toEqual(c.expectedIds);
    }

    const onFilterModelChange = vi.fn();
    const { result: combined } = renderHook(() =>
      useDataTableEngine({
        data: sampleRows,
        columns,
        filterModel: {
          items: [{ id: "r", field: "category", operator: "equals", value: "hardware" }],
          quickFilterValues: ["pro", "hardware"],
        },
        onFilterModelChange,
      }),
    );
    expect(combined.current.quickFilterText).toBe("pro hardware");
    expect(combined.current.processedRows.map((r) => r.id)).toEqual(["r1"]);

    act(() => {
      combined.current.handleQuickFilterChange("cloud software");
    });
    expect(onFilterModelChange).toHaveBeenCalledWith({
      items: [{ id: "r", field: "category", operator: "equals", value: "hardware" }],
      quickFilterValues: ["cloud", "software"],
    });

    // Server mode bypasses client filtering
    const { result: server } = renderHook(() =>
      useDataTableEngine({
        data: sampleRows,
        columns,
        filterMode: "server",
        filterModel: { items: [{ id: "r", field: "title", operator: "equals", value: "none" }] },
      }),
    );
    expect(server.current.processedRows).toEqual(sampleRows);

    // Sorting direction cycling + multi-column sorting via @tanstack/react-table
    expect(resolveNextSortDirection([], "stock")).toBe("asc");
    expect(resolveNextSortDirection([{ field: "stock", sort: "asc" }], "stock")).toBe("desc");
    expect(resolveNextSortDirection([{ field: "stock", sort: "desc" }], "stock")).toBeNull();

    const { result: sorting } = renderHook(() =>
      useDataTableEngine({
        data: sampleRows,
        columns,
      }),
    );
    act(() => {
      sorting.current.handleSortModelChange([
        { field: "category", sort: "asc" },
        { field: "stock", sort: "desc" },
      ]);
    });
    expect(sorting.current.processedRows.map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
    expect(sorting.current.table.state.sorting).toEqual([
      { id: "category", desc: false },
      { id: "stock", desc: true },
    ]);
  });

  it("handles cross-page selection, locked rows, and multi/single expansion cleanly", () => {
    const onSelectionChange = vi.fn();
    const { result } = renderHook(() =>
      useDataTableEngine({
        data: rows,
        columns,
        pageSize: 2,
        checkboxSelection: true,
        isRowSelectable: (r) => !r.locked,
        onRowSelectionModelChange: onSelectionChange,
        defaultExpandedRowIds: ["r1"],
      }),
    );

    // Locked row cannot be selected
    act(() => {
      result.current.handleSelectRow("r2", true, rows[1]);
    });
    expect(result.current.selectionSet.has("r2")).toBe(false);

    // Select all on page 1 selects only r1 (skips locked r2)
    act(() => {
      result.current.handleSelectAll(true, result.current.pagedRows);
    });
    expect(Array.from(result.current.selectionSet)).toEqual(["r1"]);
    expect(result.current.isAllPageSelected).toBe(true);
    expect(result.current.isSomePageSelected).toBe(false);

    // Move to page 2 ([r3, r4]): page 1 selection (r1) persists
    act(() => {
      result.current.handlePaginationModelChange({ page: 2, pageSize: 2 });
    });
    expect(result.current.isAllPageSelected).toBe(false);
    act(() => {
      result.current.handleSelectRow("r3", true, rows[2]);
    });
    expect(result.current.isSomePageSelected).toBe(true);
    expect(result.current.selectedFullRows.map((r) => r.id)).toEqual(["r1", "r3"]);

    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.selectionSet.size).toBe(0);
    expect(onSelectionChange).toHaveBeenLastCalledWith([], []);

    // Expansion state & singleExpand accordion mode
    expect(result.current.isRowExpanded("r1")).toBe(true);
    act(() => {
      result.current.toggleRowExpanded("r3");
    });
    expect(result.current.expandedRowIds).toEqual(["r1", "r3"]);
    act(() => {
      result.current.collapseAll();
    });
    expect(result.current.expandedRowIds).toEqual([]);

    const { result: accordion } = renderHook(() =>
      useDataTableEngine({
        data: rows,
        columns,
        singleExpand: true,
      }),
    );
    act(() => {
      accordion.current.toggleRowExpanded("r1");
      accordion.current.toggleRowExpanded("r3");
    });
    expect(accordion.current.expandedRowIds).toEqual(["r3"]);
  });

  it("computes pinning offsets and handles rAF resize drag, keyboard step, storage and unmount cleanup", () => {
    const colMap = new Map(columns.map((c) => [c.field, c]));
    const { leftOffsets, rightOffsets } = computePinningOffsets({
      pinnedLeftFields: ["id"],
      pinnedRightFields: ["actions"],
      columnByField: colMap,
      columnWidths: { id: 100 },
      checkboxSelection: true,
      hasExpandColumn: true,
    });
    expect(leftOffsets).toEqual({ id: 80 }); // 44 + 36
    expect(rightOffsets).toEqual({ actions: 0 });

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const containerEl = document.createElement("div");
    const containerRef = { current: containerEl };
    const storageKey = "test-engine-resize-cols";

    const { result, unmount } = renderHook(() =>
      useDataTableEngine({
        data: rows,
        columns,
        storageKey,
        containerRef,
        checkboxSelection: true,
      }),
    );

    const startEvent = {
      clientX: 100,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as React.MouseEvent;

    act(() => {
      result.current.handleResizeStart("id", 80, startEvent);
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 300 }));
    });
    expect(result.current.columnWidths).toEqual({});

    act(() => {
      rafCallbacks.pop()?.(16);
    });
    expect(containerEl.style.getPropertyValue("--col-w-id")).toBe("160px");
    expect(containerEl.style.getPropertyValue("--col-left-id")).toBe("44px");
    expect(containerEl.style.getPropertyValue("--col-right-actions")).toBe("0px");

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 20 }));
      window.dispatchEvent(new MouseEvent("mouseup"));
    });
    expect(result.current.columnWidths).toEqual({ id: 60 });
    expect(JSON.parse(window.localStorage.getItem(storageKey) ?? "{}")).toEqual({ id: 60 });

    // Keyboard step clamping
    act(() => {
      result.current.handleResizeStep("title", 16);
    });
    expect(result.current.columnWidths.title).toBe(216);
    act(() => {
      result.current.handleResizeStep("title", 9999);
    });
    expect(result.current.columnWidths.title).toBe(300);

    // Unmount cleanup cancels rAF and removes window listeners
    act(() => {
      result.current.handleResizeStart("title", 300, startEvent);
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 320 }));
    });
    const removeSpy = vi.spyOn(window, "removeEventListener");
    unmount();
    expect(cancelSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("mouseup", expect.any(Function));
  });
});
