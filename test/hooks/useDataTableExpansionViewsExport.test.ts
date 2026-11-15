import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useDataTableExpansion } from "@/components/data-table/hooks/useDataTableExpansion";
import * as exportModule from "@/components/data-table/hooks/useDataTableExport";
import { useDataTableViews } from "@/components/data-table/hooks/useDataTableViews";

describe("useDataTableExpansion, useDataTableViews & useDataTableExport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("supports multi-expand and singleExpand accordion mode in useDataTableExpansion", () => {
    const { result: multi } = renderHook(() => useDataTableExpansion({ defaultExpandedRowIds: ["a"] }));
    expect(multi.current.isRowExpanded("a")).toBe(true);
    act(() => {
      multi.current.toggleRowExpanded("b");
    });
    expect(multi.current.expandedRowIds).toEqual(["a", "b"]);
    act(() => {
      multi.current.collapseAll();
    });
    expect(multi.current.expandedRowIds).toEqual([]);

    const { result: accordion } = renderHook(() => useDataTableExpansion({ singleExpand: true }));
    act(() => {
      accordion.current.toggleRowExpanded("r1");
    });
    expect(accordion.current.expandedRowIds).toEqual(["r1"]);
    act(() => {
      accordion.current.toggleRowExpanded("r2");
    });
    expect(accordion.current.expandedRowIds).toEqual(["r2"]);
    act(() => {
      accordion.current.toggleRowExpanded("r2");
    });
    expect(accordion.current.expandedRowIds).toEqual([]);
  });

  it("manages saved views and derives fallback active tab without useEffect cascading updates", () => {
    const onTabChange = vi.fn();
    const onApplyFilterModel = vi.fn();
    const initialTabs = [
      { id: "all", label: "All" },
      {
        id: "pending",
        label: "Pending",
        filterModel: { items: [{ id: "f1", field: "status", operator: "equals" as const, value: "pending" }] },
      },
    ];

    const { result, rerender } = renderHook(
      ({ tabs }) =>
        useDataTableViews({
          tabs,
          defaultActiveTab: "pending",
          onTabChange,
          onApplyFilterModel,
          defaultSavedViews: [{ id: "sys", name: "Default", isSystem: true, filterModel: { items: [] } }],
          currentFilterModel: { items: [{ id: "x", field: "name", operator: "contains", value: "ok" }] },
        }),
      { initialProps: { tabs: initialTabs } },
    );

    expect(result.current.currentActiveTab).toBe("pending");
    // Removing "pending" from tabs derives "all" at render time without triggering onTabChange effect loop
    rerender({ tabs: [{ id: "all", label: "All" }] });
    expect(result.current.currentActiveTab).toBe("all");
    expect(onTabChange).not.toHaveBeenCalled();

    let createdId = "";
    act(() => {
      createdId = result.current.saveCurrentAsView("My View");
    });
    expect(result.current.savedViews).toHaveLength(2);
    expect(result.current.activeViewId).toBe(createdId);

    // Cannot delete system view
    act(() => {
      result.current.deleteView("sys");
    });
    expect(result.current.savedViews).toHaveLength(2);

    // Custom view can be renamed & deleted
    act(() => {
      result.current.renameView(createdId, "Renamed View");
    });
    expect(result.current.savedViews.find((v) => v.id === createdId)?.name).toBe("Renamed View");
    act(() => {
      result.current.deleteView(createdId);
    });
    expect(result.current.savedViews).toHaveLength(1);
    expect(result.current.activeViewId).toBeNull();
  });

  it("exports CSV with UTF-8 BOM + escaped quotes and JSON payloads cleanly", () => {
    const mockCreateObjectURL = vi.fn(() => "blob:mock");
    const mockRevokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const blobChunks: BlobPart[] = [];
    const OriginalBlob = globalThis.Blob;
    vi.stubGlobal(
      "Blob",
      class MockBlob extends OriginalBlob {
        constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
          super(parts, options);
          if (parts) blobChunks.push(...parts);
        }
      },
    );

    const { result } = renderHook(() =>
      exportModule.useDataTableExport({
        visibleColumns: [
          { field: "name", headerName: "Name" },
          { field: "quote", headerName: "Quote" },
        ],
        selectedFullRows: [],
        processedRows: [{ name: "Alice", quote: 'He said "hi"' }],
        exportFileName: "report.csv",
      }),
    );

    act(() => {
      result.current.handleExportCsv();
    });
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(String(blobChunks[0])).toBe('\uFEFF"Name","Quote"\n"Alice","He said ""hi"""');

    act(() => {
      result.current.handleExportJson();
    });
    expect(clickSpy).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(blobChunks[1]))).toEqual([{ name: "Alice", quote: 'He said "hi"' }]);
  });
});
