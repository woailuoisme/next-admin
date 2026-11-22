import { describe, expect, it, vi } from "vitest";

import type { DataTableColDef } from "@/components/data-table/core/types";
import { DataTable } from "@/components/data-table/core/DataTable";
import { DataTablePagination } from "@/components/data-table/footer/DataTablePagination";
import { fireEvent, renderWithProviders, screen } from "test/test-utils";

interface Row {
	id: string;
	name: string;
	action: string;
}

const rows: Row[] = [{ id: "1", name: "Row 1", action: "-" }];
const baseColumns: DataTableColDef<Row>[] = [{ field: "name", headerName: "Name" }];

/** 行内交互元素 + 纯文本单元格，用于验证行激活的放行规则 */
function buildColumns(): DataTableColDef<Row>[] {
	return [
		...baseColumns,
		{
			field: "action",
			headerName: "Action",
			renderCell: () => (
				<button type="button" className="rounded border px-1">
					Act
				</button>
			),
		},
	];
}

describe("DataTable row activation guard", () => {
	it("skips row callback for nested interactive elements and still fires for plain content", () => {
		const onRowClick = vi.fn();
		renderWithProviders(
			<DataTable<Row> data={rows} columns={buildColumns()} getRowId={(row) => row.id} onRowClick={onRowClick} />,
			{ locale: "en" },
		);

		fireEvent.click(screen.getByRole("button", { name: "Act" }));
		expect(onRowClick).not.toHaveBeenCalled();

		fireEvent.click(screen.getByText("Row 1"));
		expect(onRowClick).toHaveBeenCalledTimes(1);
		expect(onRowClick.mock.calls[0][1].type).toBe("click");
	});

	it("passes a keyboard event when the row is activated with Enter", () => {
		const onRowClick = vi.fn();
		renderWithProviders(
			<DataTable<Row> data={rows} columns={baseColumns} getRowId={(row) => row.id} onRowClick={onRowClick} />,
			{ locale: "en" },
		);

		const row = screen.getByText("Row 1").closest("tr");
		expect(row).not.toBeNull();
		fireEvent.keyDown(row as HTMLElement, { key: "Enter" });

		expect(onRowClick).toHaveBeenCalledTimes(1);
		expect(onRowClick.mock.calls[0][1].type).toBe("keydown");
	});
});

describe("DataTablePagination page clamping", () => {
	it("clamps an out-of-range page so the summary never inverts the range", () => {
		renderWithProviders(
			<DataTablePagination
				paginationModel={{ page: 5, pageSize: 10 }}
				onPaginationModelChange={() => {}}
				rowCount={3}
			/>,
			{ locale: "en" },
		);

		expect(screen.getByText(/Showing 1 to 3 of 3/)).toBeInTheDocument();
	});
});

describe("DataTable loading backdrop", () => {
	it("marks the table inert while blocking-loading rows are present", () => {
		const { container } = renderWithProviders(
			<DataTable<Row> data={rows} columns={baseColumns} loading getRowId={(row) => row.id} />,
			{ locale: "en" },
		);

		expect(container.querySelector("table")).toHaveAttribute("inert");
	});

	it("keeps the table interactive during first paint so slot overlays stay reachable", () => {
		const { container } = renderWithProviders(
			<DataTable<Row> data={[]} columns={baseColumns} loading getRowId={(row) => row.id} />,
			{ locale: "en" },
		);

		expect(container.querySelector("table")).not.toHaveAttribute("inert");
	});
});
