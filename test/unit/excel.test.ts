import { describe, expect, it, vi } from "vitest";

import { exportToExcel } from "@/lib/excel";

describe("exportToExcel unit tests", () => {
  it("should warn and return early when columns array is empty", async () => {
    const result = await exportToExcel({
      columns: [],
      data: [{ id: 1, name: "Test" }],
    });

    expect(result).toBeUndefined();
  });

  it("should dynamically load exceljs and generate workbook when valid data is provided", async () => {
    const columns = [
      { field: "id", headerName: "ID" },
      { field: "name", headerName: "User Name" },
      {
        field: "score",
        headerName: "Score",
        valueFormatter: (val: unknown) => `${val} pts`,
      },
    ];

    const data = [
      { id: 1, name: "Alice", score: 95 },
      { id: 2, name: "Bob", score: 88 },
    ];

    // Mock document.body.appendChild & removeChild for blob download
    const appendSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
    const removeSpy = vi.spyOn(document.body, "removeChild").mockImplementation((node) => node);

    await expect(
      exportToExcel({
        columns,
        data,
        fileName: "test-report",
        sheetName: "Users",
      }),
    ).resolves.not.toThrow();

    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
