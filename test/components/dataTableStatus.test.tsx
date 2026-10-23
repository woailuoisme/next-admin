import { describe, expect, it } from "vitest";

import { DataTable } from "@/components/data-table/core/DataTable";
import { renderWithProviders, screen } from "test/test-utils";

const columns = [{ field: "name", headerName: "Name" }];

function renderTable(rowCount: number, locale: "en" | "zh") {
  const data = Array.from({ length: rowCount }, (_, index) => ({ id: String(index + 1), name: `Row ${index + 1}` }));
  return renderWithProviders(<DataTable data={data} columns={columns} getRowId={(row: { id: string }) => row.id} />, {
    locale,
  });
}

describe("DataTable screen reader status region", () => {
  it("announces the localized row count in Chinese", () => {
    renderTable(2, "zh");

    expect(screen.getByRole("status")).toHaveTextContent("共 2 条记录");
  });

  it("announces the localized row count in English", () => {
    renderTable(2, "en");

    expect(screen.getByRole("status")).toHaveTextContent("2 records available");
  });

  it("uses the singular form for a single record instead of '1 records'", () => {
    renderTable(1, "en");

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("1 record available");
    expect(status).not.toHaveTextContent("1 records");
  });
});
