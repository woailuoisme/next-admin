import { fireEvent, waitFor } from "@testing-library/react";
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

	it("resets client page to 1 on search filter and clamps out-of-range page when data shrinks", async () => {
		const fiveRows = [
			{ id: "1", name: "Alice", age: 30, status: "Active" },
			{ id: "2", name: "Bob", age: 25, status: "Pending" },
			{ id: "3", name: "Carol", age: 28, status: "Active" },
			{ id: "4", name: "Dave", age: 32, status: "Active" },
			{ id: "5", name: "Eve", age: 22, status: "Pending" },
		];

		const { rerender } = renderWithProviders(
			<DataTable
				data={fiveRows}
				columns={columns}
				pageSize={2}
				pageSizeOptions={[2, 5]}
				getRowId={(row: { id: string }) => row.id}
			/>,
			{ locale: "en" },
		);

		expect(screen.getByText("Alice")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "3" }));
		expect(screen.getByText("Eve")).toBeInTheDocument();

		// Shrinking rows below page 3 clamps back into valid page 1 without rendering empty page
		rerender(
			<DataTable
				data={fiveRows.slice(0, 2)}
				columns={columns}
				pageSize={2}
				pageSizeOptions={[2, 5]}
				getRowId={(row: { id: string }) => row.id}
			/>,
		);
		expect(screen.getByText("Alice")).toBeInTheDocument();

		// Advance to page 2 then apply quick search -> resets back to page 1 so match on first page appears
		rerender(
			<DataTable
				data={fiveRows}
				columns={columns}
				pageSize={2}
				pageSizeOptions={[2, 5]}
				getRowId={(row: { id: string }) => row.id}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "2" }));
		expect(screen.getByText("Carol")).toBeInTheDocument();

		const searchInput = screen.getByPlaceholderText("Search records...");
		fireEvent.change(searchInput, { target: { value: "Alice" } });
		await waitFor(() => {
			expect(screen.getByText("Alice")).toBeInTheDocument();
		});
	});
});
