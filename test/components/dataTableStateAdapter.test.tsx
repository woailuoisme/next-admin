import { describe, expect, it, vi } from "vitest";

import { DataTable } from "@/components/data-table/core/DataTable";
import type { TableStateAdapter } from "@/components/data-table/core/types";
import { fireEvent, renderWithProviders, screen } from "test/test-utils";

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
});
