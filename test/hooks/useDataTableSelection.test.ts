import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDataTableSelection } from "@/components/data-table/hooks/useDataTableSelection";

interface Row {
  id: string;
  name: string;
  locked?: boolean;
}

const rows: Row[] = [
  { id: "r1", name: "One" },
  { id: "r2", name: "Two", locked: true },
  { id: "r3", name: "Three" },
  { id: "r4", name: "Four" },
];

describe("useDataTableSelection", () => {
  it("provides O(1) selectionSet lookups, guards unselectable rows, and preserves cross-page selection", () => {
    const onChange = vi.fn();
    const isRowSelectable = (r: Row) => !r.locked;
    const getRowId = (r: Row) => r.id;

    const { result, rerender } = renderHook(
      ({ pagedRows }: { pagedRows: Row[] }) =>
        useDataTableSelection({
          rows,
          pagedRows,
          getRowId,
          checkboxSelection: true,
          isRowSelectable,
          onRowSelectionModelChange: onChange,
        }),
      { initialProps: { pagedRows: rows.slice(0, 2) } },
    );

    // Locked row cannot be selected individually
    act(() => {
      result.current.handleSelectRow("r2", true, rows[1]);
    });
    expect(result.current.selectionSet.has("r2")).toBe(false);

    // Select all on page 1 selects only r1 (skips locked r2)
    act(() => {
      result.current.handleSelectAll(true, rows.slice(0, 2));
    });
    expect(result.current.selectionSet).toBeInstanceOf(Set);
    expect(result.current.selectionSet.has("r1")).toBe(true);
    expect(result.current.selectionSet.has("r2")).toBe(false);
    expect(result.current.isAllPageSelected).toBe(true);
    expect(result.current.isSomePageSelected).toBe(false);
    expect(result.current.selectedFullRows).toEqual([rows[0]]);

    // Navigate to page 2 ([r3, r4]): page 1 selection (r1) is preserved
    rerender({ pagedRows: rows.slice(2, 4) });
    expect(result.current.isAllPageSelected).toBe(false);
    expect(result.current.isSomePageSelected).toBe(false);

    act(() => {
      result.current.handleSelectRow("r3", true, rows[2]);
    });
    expect(result.current.isSomePageSelected).toBe(true);
    expect(result.current.isAllPageSelected).toBe(false);
    expect(result.current.selectedFullRows.map((r) => r.id)).toEqual(["r1", "r3"]);

    // Deselect page 2 keeps page 1 selection
    act(() => {
      result.current.handleSelectAll(false, rows.slice(2, 4));
    });
    expect(Array.from(result.current.selectionSet)).toEqual(["r1"]);

    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.selectionSet.size).toBe(0);
    expect(onChange).toHaveBeenLastCalledWith([], []);
  });
});
