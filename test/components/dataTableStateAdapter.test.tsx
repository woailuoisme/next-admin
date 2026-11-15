import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { useClientTableStateAdapter } from "@/components/data-table/adapters";
import { DataTable } from "@/components/data-table/core/DataTable";
import type { DataTableFilterModel, TableStateAdapter } from "@/components/data-table/core/types";
import { act, fireEvent, renderWithProviders, screen, waitFor } from "test/test-utils";

describe("DataTable State Seam (TableStateAdapter)", () => {
  const columns = [
    { field: "id", headerName: "ID", sortable: true },
    { field: "title", headerName: "Title", sortable: true },
  ];

  it("binds data, loading, pagination, and sorting through a unified TableStateAdapter", () => {
    const onPageChange = vi.fn();
    const onSortChange = vi.fn();

    const mockAdapter: TableStateAdapter<{ id: string; title: string }> = {
      data: [
        { id: "1", title: "First Document" },
        { id: "2", title: "Second Document" },
      ],
      total: 20,
      loading: false,
      paginationMode: "server",
      page: 2,
      pageSize: 10,
      sortModel: [{ field: "title", sort: "asc" }],
      onPageChange,
      onPageSizeChange: vi.fn(),
      onSortChange,
      onSearchChange: vi.fn(),
    };

    renderWithProviders(<DataTable state={mockAdapter} columns={columns} getRowId={(r) => r.id} />);

    // Renders data through adapter
    expect(screen.getByText("First Document")).toBeInTheDocument();
    expect(screen.getByText("Second Document")).toBeInTheDocument();

    // Renders pagination from adapter
    expect(screen.getAllByText(/20/)[0]).toBeInTheDocument();

    // Sort trigger routes to adapter onSortChange
    const idHeader = screen.getByText("ID");
    fireEvent.click(idHeader);
    expect(onSortChange).toHaveBeenCalledWith("id", "asc");
  });

  it("retains filter items via onFilterModelChange and resets both items and quickFilter atomically without duplicate updates", async () => {
    const onFilterModelSpy = vi.fn();
    const onSearchSpy = vi.fn();

    function Harness() {
      const client = useClientTableStateAdapter({
        data: [
          { id: "1", title: "Alpha Order" },
          { id: "2", title: "Beta Order" },
        ],
      });
      const [observedSearchCalls, setObservedSearchCalls] = useState(0);

      const spiedAdapter: TableStateAdapter<{ id: string; title: string }> = {
        ...client,
        onFilterModelChange: (model: DataTableFilterModel) => {
          onFilterModelSpy(model);
          client.onFilterModelChange?.(model);
        },
        onSearchChange: (val: string) => {
          onSearchSpy(val);
          setObservedSearchCalls((c) => c + 1);
          client.onSearchChange?.(val);
        },
      };

      return (
        <div>
          <span data-testid="search-call-count">{observedSearchCalls}</span>
          <DataTable
            state={spiedAdapter}
            columns={columns}
            getRowId={(r) => r.id}
            resetFiltersText="Reset All Filters"
            filterConfig={{
              layout: "aboveContent",
              filters: [
                {
                  type: "custom",
                  field: "title",
                  label: "Title Filter",
                  render: ({ value, onChange }) => (
                    <input
                      aria-label="Custom Title Filter"
                      value={value ?? ""}
                      onChange={(e) => onChange(e.target.value)}
                    />
                  ),
                },
              ],
            }}
          />
        </div>
      );
    }

    renderWithProviders(<Harness />, { locale: "en" });

    // Wait for dynamic LazyFilterPanel chunk to mount inline
    const customInput = await waitFor(() => screen.getByLabelText("Custom Title Filter"));

    // Apply both a structured filter rule and quick filter search
    fireEvent.change(customInput, { target: { value: "NonExistent" } });
    expect(onFilterModelSpy).toHaveBeenCalledTimes(1);
    expect(onFilterModelSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [expect.objectContaining({ field: "title", operator: "equals", value: "NonExistent" })],
      }),
    );
    expect(screen.queryByText("Alpha Order")).not.toBeInTheDocument();

    // Quick filter triggers adapter onSearchChange only once without duplicate onFilterModelChange
    vi.useFakeTimers();
    try {
      const searchInput = screen.getByPlaceholderText(/Search/i);
      fireEvent.change(searchInput, { target: { value: "extra" } });
      act(() => {
        vi.advanceTimersByTime(300);
      });
    } finally {
      vi.useRealTimers();
    }

    expect(onSearchSpy).toHaveBeenCalledTimes(1);
    expect(onSearchSpy).toHaveBeenLastCalledWith("extra");
    expect(onFilterModelSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("search-call-count")).toHaveTextContent("1");

    expect(screen.getByText("Reset All Filters")).toBeInTheDocument();

    const filterSpyCallsBeforeReset = onFilterModelSpy.mock.calls.length;
    const searchSpyCallsBeforeReset = onSearchSpy.mock.calls.length;

    fireEvent.click(screen.getByText("Reset All Filters"));

    // Atomic single-call reset clears both items and quickFilterValues without stale latestRef restoration
    expect(onFilterModelSpy.mock.calls.length).toBe(filterSpyCallsBeforeReset + 1);
    expect(onFilterModelSpy).toHaveBeenLastCalledWith({
      items: [],
      quickFilterValues: [],
    });
    expect(onSearchSpy.mock.calls.length).toBe(searchSpyCallsBeforeReset);
    expect(screen.getByText("Alpha Order")).toBeInTheDocument();
    expect(screen.getByText("Beta Order")).toBeInTheDocument();
  });
});
