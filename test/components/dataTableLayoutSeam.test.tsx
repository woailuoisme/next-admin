import { describe, expect, it } from "vitest";

import { DataTable } from "@/components/data-table/core/DataTable";
import { renderWithProviders, screen } from "test/test-utils";

describe("DataTable Layout Seam (CSS Variables & Pinning)", () => {
  const columns = [
    { field: "name", headerName: "Name", width: 200, pinned: "left" as const },
    { field: "age", headerName: "Age", width: 100 },
    { field: "status", headerName: "Status", width: 120, pinned: "right" as const },
  ];

  const data = [
    { id: "1", name: "Alice", age: 30, status: "Active" },
    { id: "2", name: "Bob", age: 25, status: "Pending" },
  ];

  it("injects layout CSS variables on the table container", () => {
    const { container } = renderWithProviders(
      <DataTable data={data} columns={columns} getRowId={(row: { id: string }) => row.id} />,
    );

    // The scrollable table container should have --col-w-* and pinning variables
    const scrollContainer = container.querySelector(".overflow-auto");
    expect(scrollContainer).toBeInTheDocument();

    const styleAttr = scrollContainer?.getAttribute("style") ?? "";
    expect(styleAttr).toContain("--col-w-name: 200px");
    expect(styleAttr).toContain("--col-w-age: 100px");
    expect(styleAttr).toContain("--col-w-status: 120px");
    expect(styleAttr).toContain("--col-left-name: 0px");
  });

  it("applies CSS variable fallback values on table cells and headers", () => {
    renderWithProviders(<DataTable data={data} columns={columns} getRowId={(row: { id: string }) => row.id} />);

    // Header cells should reference CSS variables in style attribute and resolve properly
    const nameHeader = screen.getByText("Name").closest("th");
    expect(nameHeader?.getAttribute("style")).toContain("var(--col-w-name, 200px)");
    expect(nameHeader).toHaveStyle({ width: "200px" });

    // Body cells should reference CSS variables
    const aliceCell = screen.getByText("Alice").closest("td");
    expect(aliceCell?.getAttribute("style")).toContain("var(--col-w-name, 200px)");
    expect(aliceCell).toHaveStyle({ width: "200px" });
  });
});
