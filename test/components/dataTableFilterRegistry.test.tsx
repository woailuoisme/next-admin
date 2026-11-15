import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { actionsCol } from "@/components/data-table/columns/actions";
import { DataTable } from "@/components/data-table/core/DataTable";
import type { DataTableColDef, DataTableFilterModel } from "@/components/data-table/core/types";
import { FilterRegistry } from "@/components/data-table/toolbar/filters/FilterRegistry";
import { QueryBuilderControl } from "@/components/data-table/toolbar/filters/controls/QueryBuilderControl";
import { fireEvent, renderWithProviders, screen, waitFor } from "test/test-utils";

interface SampleRow {
  id: string;
  name: string;
  status: string;
  active: boolean;
  amount: number;
}

const sampleRows: SampleRow[] = [
  { id: "r1", name: "Alpha", status: "active", active: true, amount: 120 },
  { id: "r2", name: "Beta", status: "pending", active: false, amount: 240 },
  { id: "r3", name: "Gamma", status: "active", active: true, amount: 360 },
];

const baseColumns: DataTableColDef<SampleRow>[] = [
  { field: "name", headerName: "Name", width: 180 },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    type: "singleSelect",
    valueOptions: ["active", "pending"],
  },
  { field: "active", headerName: "Active", width: 100, type: "boolean" },
  { field: "amount", headerName: "Amount", width: 120, type: "number" },
  actionsCol<SampleRow>({ crud: { onView: vi.fn() } }),
];

describe("FilterRegistry & QueryBuilder & DataTableRow memoization", () => {
  it("supports aboveContent layout with select, ternary, and deferred custom filters", () => {
    const onFilterModelChange = vi.fn();

    renderWithProviders(
      <FilterRegistry
        columns={baseColumns}
        filterModel={{ items: [{ id: "f1", field: "status", operator: "equals", value: "active" }] }}
        onFilterModelChange={onFilterModelChange}
        filterConfig={{
          layout: "aboveContent",
          deferFilters: true,
          filters: [
            {
              type: "select",
              field: "status",
              label: "Status",
              options: [
                { label: "Active", value: "active", badge: 2 },
                { label: "Pending", value: "pending", badge: 1 },
              ],
            },
            { type: "ternary", field: "active", label: "Active State", trueLabel: "Yes", falseLabel: "No" },
            {
              type: "custom",
              field: "name",
              label: "Keyword",
              render: ({ value, onChange }) => (
                <input aria-label="Keyword input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
              ),
            },
          ],
        }}
      />,
      { locale: "en" },
    );

    expect(screen.getByTestId("data-table-filter-panel")).toBeInTheDocument();
    expect(screen.getByText("1 active")).toBeInTheDocument();

    // Deferred mode holds draft changes until Apply is clicked
    fireEvent.change(screen.getByLabelText("Keyword input"), { target: { value: "Alp" } });
    expect(onFilterModelChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));
    expect(onFilterModelChange).toHaveBeenCalledTimes(1);
    expect(onFilterModelChange).toHaveBeenLastCalledWith({
      items: expect.arrayContaining([
        expect.objectContaining({ field: "status", operator: "equals", value: "active" }),
        expect.objectContaining({ field: "name", operator: "equals", value: "Alp" }),
      ]),
    });

    // Reset clears all active filters immediately
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onFilterModelChange).toHaveBeenLastCalledWith({ items: [] });
  });

  it("defers FilterRegistry body and QueryBuilder mounting until popover or sheet trigger is opened", async () => {
    function ControlledRegistry({ layout }: { layout: "popover" | "sheet" }) {
      const [model, setModel] = useState<DataTableFilterModel>({
        items: [{ id: "q1", field: "name", operator: "contains", value: "Al" }],
      });
      return (
        <FilterRegistry
          columns={baseColumns}
          filterModel={model}
          onFilterModelChange={setModel}
          filterConfig={{
            layout,
            showQueryBuilder: true,
            sheetTitle: "Filter Drawer",
            sheetDescription: "Refine dataset",
          }}
        />
      );
    }

    const pop = renderWithProviders(<ControlledRegistry layout="popover" />, { locale: "en" });
    expect(screen.queryByTestId("data-table-filter-panel")).not.toBeInTheDocument();
    expect(screen.queryByTestId("query-builder-control")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Filter/i }));
    await waitFor(() => {
      expect(screen.getByTestId("data-table-filter-panel")).toBeInTheDocument();
      expect(screen.getByTestId("query-builder-control")).toBeInTheDocument();
    });
    pop.unmount();

    renderWithProviders(<ControlledRegistry layout="sheet" />, { locale: "en" });
    expect(screen.queryByText("Filter Drawer")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Filter/i }));
    await waitFor(() => {
      expect(screen.getByText("Filter Drawer")).toBeInTheDocument();
      expect(screen.getByText("Refine dataset")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-filter-panel")).toBeInTheDocument();
    });
  });

  it("excludes actions and system columns from QueryBuilder column options", () => {
    const columnsWithSystem: DataTableColDef<SampleRow>[] = [
      ...baseColumns,
      { field: "__checkbox__", headerName: "Checkbox Sys", width: 44 },
      { field: "__actions__", headerName: "Actions Sys", width: 44 },
      { field: "customActions", headerName: "", type: "actions", width: 80 },
    ];
    const onAddRule = vi.fn();

    renderWithProviders(
      <QueryBuilderControl
        filterableColumns={columnsWithSystem}
        rules={[{ id: "r1", field: "name", operator: "contains", value: "" }]}
        onAddRule={onAddRule}
        onUpdateRule={vi.fn()}
        onRemoveRule={vi.fn()}
      />,
      { locale: "en" },
    );

    const columnTrigger = screen.getByLabelText("Rule column");
    fireEvent.click(columnTrigger);

    // Real data columns appear; system / actions columns are excluded
    expect(screen.getByRole("option", { name: "Amount" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Checkbox Sys" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Actions Sys" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "actions" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "customActions" })).not.toBeInTheDocument();
  });

  it("keeps untouched sibling DataTableRow components memoized on selection, expansion, and column resize drag", async () => {
    const renderCounts = new Map<string, number>();

    const trackedColumns: DataTableColDef<SampleRow>[] = [
      {
        field: "name",
        headerName: "Name",
        width: 180,
        renderCell: ({ row }) => {
          renderCounts.set(row.id, (renderCounts.get(row.id) ?? 0) + 1);
          return <span>{row.name}</span>;
        },
      },
      { field: "amount", headerName: "Amount", width: 120 },
    ];

    const rafQueue: FrameRequestCallback[] = [];
    const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafQueue.push(cb);
      return rafQueue.length;
    });

    try {
      const { container } = renderWithProviders(
        <DataTable
          data={sampleRows}
          columns={trackedColumns}
          getRowId={(r) => r.id}
          checkboxSelection
          renderExpandedRow={({ row }) => <div>Expanded: {row.name}</div>}
          showToolbar={false}
          hidePagination
        />,
        { locale: "en" },
      );

      expect(renderCounts.get("r1")).toBe(1);
      expect(renderCounts.get("r2")).toBe(1);
      expect(renderCounts.get("r3")).toBe(1);

      // 1. Toggle row selection on r1 -> r2 and r3 must NOT re-render
      fireEvent.click(screen.getByLabelText("Select row r1"));
      expect(renderCounts.get("r1")).toBeGreaterThanOrEqual(2);
      expect(renderCounts.get("r2")).toBe(1);
      expect(renderCounts.get("r3")).toBe(1);

      const r1AfterSelect = renderCounts.get("r1")!;

      // 2. Toggle row expansion on r1 -> r2 and r3 must STILL stay at 1
      const expandButtons = screen.getAllByRole("button", { name: /Expand/i });
      fireEvent.click(expandButtons[0]);
      expect(screen.getByText("Expanded: Alpha")).toBeInTheDocument();
      expect(renderCounts.get("r1")).toBeGreaterThanOrEqual(r1AfterSelect + 1);
      expect(renderCounts.get("r2")).toBe(1);
      expect(renderCounts.get("r3")).toBe(1);

      const r1AfterExpand = renderCounts.get("r1")!;

      // 3. Column resize drag mutates CSS vars via rAF without re-rendering any table rows
      const resizeHandle = screen.getByRole("separator", { name: /Resize column Name/i });
      fireEvent.mouseDown(resizeHandle, { clientX: 180 });
      fireEvent.mouseMove(document, { clientX: 280 });
      while (rafQueue.length > 0) {
        const cb = rafQueue.shift()!;
        cb(16);
      }

      const scrollContainer = container.querySelector(".overflow-auto") as HTMLElement | null;
      expect(scrollContainer?.style.getPropertyValue("--col-w-name")).toBe("280px");
      expect(renderCounts.get("r1")).toBe(r1AfterExpand);
      expect(renderCounts.get("r2")).toBe(1);
      expect(renderCounts.get("r3")).toBe(1);

      fireEvent.mouseUp(document);
    } finally {
      rafSpy.mockRestore();
    }
  });
});
