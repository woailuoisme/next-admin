import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DataTableColDef } from "@/components/data-table/core/types";
import { computePinningOffsets, useDataTablePinning } from "@/components/data-table/hooks/useDataTablePinning";
import { useDataTableResize } from "@/components/data-table/hooks/useDataTableResize";

const columns: DataTableColDef[] = [
  { field: "id", headerName: "ID", width: 80, minWidth: 60, maxWidth: 160, pinned: "left" },
  { field: "name", headerName: "Name", width: 200, minWidth: 100, maxWidth: 300 },
  { field: "actions", headerName: "Actions", width: 90, pinned: "right" },
];

describe("useDataTablePinning & useDataTableResize", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("computes pinning offsets accurately across checkbox and expand columns", () => {
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

    const { result } = renderHook(() =>
      useDataTablePinning({
        columns,
        columnWidths: { id: 100 },
        checkboxSelection: true,
      }),
    );
    expect(result.current.leftOffsets).toEqual({ id: 44 });
    expect(result.current.pinnedLeftFields).toEqual(["id"]);
    expect(result.current.pinnedRightFields).toEqual(["actions"]);
  });

  it("writes CSS vars during drag via rAF without committing mid-drag state, clamps bounds, persists, and cleans up on unmount", () => {
    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const containerEl = document.createElement("div");
    const containerRef = { current: containerEl };
    const storageKey = "test-resize-cols";

    const { result, unmount } = renderHook(() =>
      useDataTableResize({
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
    });

    // Drag to +200 -> clamped to maxWidth 160
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 300 }));
    });
    expect(result.current.columnWidths).toEqual({}); // React state still uncommitted mid-drag

    // Flush rAF: CSS variables update directly on container DOM
    act(() => {
      rafCallbacks.pop()?.(16);
    });
    expect(containerEl.style.getPropertyValue("--col-w-id")).toBe("160px");
    expect(containerEl.style.getPropertyValue("--col-left-id")).toBe("44px");
    expect(containerEl.style.getPropertyValue("--col-right-actions")).toBe("0px");

    // Drag below minWidth (100 - 80 = 20 -> clamped to minWidth 60)
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 20 }));
    });

    // Release mouse -> commits width 60 & persists to localStorage
    act(() => {
      window.dispatchEvent(new MouseEvent("mouseup"));
    });
    expect(result.current.columnWidths).toEqual({ id: 60 });
    expect(JSON.parse(window.localStorage.getItem(storageKey) ?? "{}")).toEqual({ id: 60 });
    expect(result.current.getColumnWidth("id")).toBe(60);

    // Start a drag then unmount to verify active listener + pending rAF cleanup
    act(() => {
      result.current.handleResizeStart("name", 200, startEvent);
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 250 }));
    });
    const removeSpy = vi.spyOn(window, "removeEventListener");
    unmount();
    expect(cancelSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("mouseup", expect.any(Function));
  });
});
