import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { action, ActionButton, ActionList } from "@/components/actions";
import { parseCsvText } from "@/components/actions/prebuilt/fileParsing";
import { fireEvent, renderWithProviders, screen, waitFor } from "test/test-utils";

interface DemoRow {
	id: string;
	name: string;
	price: number;
	createdAt: string;
	deletedAt: string | null;
}

describe("Prebuilt Actions: Import, Export, Replicate & Soft Delete Lifecycle", () => {
	it("parses quoted CSV values, BOM and CRLF cleanly", () => {
		const csv = '\uFEFFtitle,price,note\r\n"Keyboard, Pro",199,"Line ""A"""\r\nMouse,49,Basic\r\n';
		const parsed = parseCsvText(csv);

		expect(parsed.headers).toEqual(["title", "price", "note"]);
		expect(parsed.rows).toEqual([
			{ title: "Keyboard, Pro", price: "199", note: 'Line "A"' },
			{ title: "Mouse", price: "49", note: "Basic" },
		]);
	});

	it("validates uploaded CSV rows via Zod in ImportActionModal and submits valid rows", async () => {
		const onImport = vi.fn(async () => {});
		const rowSchema = z.object({
			title: z.string().min(2),
			price: z.number().positive(),
		});

		const { user } = renderWithProviders(
			<ActionButton
				action={action.import({
					label: "批量导入",
					entityName: "商品",
					rowSchema,
					fields: [
						{ key: "title", label: "商品名称", required: true },
						{ key: "price", label: "价格", required: true, transform: (v) => Number(v) },
					],
					onImport,
				})}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "批量导入" }));
		expect(await screen.findByText("导入 商品")).toBeInTheDocument();

		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		expect(fileInput).toBeTruthy();

		const csvFile = new File(["title,price\nKeyboard,199\nA,-5\n"], "products.csv", { type: "text/csv" });
		Object.defineProperty(csvFile, "text", {
			value: async () => "title,price\nKeyboard,199\nA,-5\n",
		});

		fireEvent.change(fileInput, { target: { files: [csvFile] } });

		expect(await screen.findByText("通过校验 1 条")).toBeInTheDocument();
		expect(screen.getByText("异常 1 条")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /导入有效数据 \(1\)/ }));
		await waitFor(() => {
			expect(onImport).toHaveBeenCalledWith([{ title: "Keyboard", price: 199 }], expect.any(Object));
		});
	});

	it("exports selected columns and triggers after hook in ExportActionModal", async () => {
		const afterExport = vi.fn();
		const rows: DemoRow[] = [{ id: "1", name: "Item One", price: 100, createdAt: "2026-01-01", deletedAt: null }];

		const { user } = renderWithProviders(
			<ActionButton
				action={action.export<void, DemoRow>({
					label: "导出数据",
					defaultFormat: "csv",
					fileName: "demo-export",
					columns: [
						{ field: "id", headerName: "ID" },
						{ field: "name", headerName: "名称" },
					],
					resolveRows: () => rows,
					after: afterExport,
				})}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "导出数据" }));
		expect(await screen.findByRole("button", { name: /开始导出/ })).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /开始导出/ }));
		await waitFor(() => {
			expect(afterExport).toHaveBeenCalledWith({ format: "csv", count: 1, payload: undefined });
		});
	});

	it("replicates record excluding id/createdAt and switches forceDelete/restore via isTrashed", async () => {
		const onReplicate = vi.fn(async () => ({}));
		const onRestore = vi.fn(async () => ({}));
		const onForceDelete = vi.fn(async () => ({}));

		const activeRow: DemoRow = {
			id: "row-1",
			name: "Active Item",
			price: 50,
			createdAt: "2026-01-01",
			deletedAt: null,
		};
		const trashedRow: DemoRow = {
			...activeRow,
			id: "row-2",
			name: "Trashed Item",
			deletedAt: "2026-02-01",
		};

		const rowActions = [
			action.replicate<DemoRow>({
				mutateClone: (clone) => ({ ...clone, name: `${String(clone.name)} Copy` }),
				onReplicate,
			}),
			action.restore<DemoRow>({
				isTrashed: (r) => Boolean(r.deletedAt),
				onExecute: onRestore,
			}),
			action.forceDelete<DemoRow>({
				isTrashed: (r) => Boolean(r.deletedAt),
				onExecute: onForceDelete,
			}),
		];

		const activeView = renderWithProviders(<ActionList actions={rowActions} payload={activeRow} surface="cell" />);
		expect(screen.getByRole("button", { name: "复制" })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "恢复" })).toBeNull();
		expect(screen.queryByRole("button", { name: "永久删除" })).toBeNull();

		const user = activeView.user;
		await user.click(screen.getByRole("button", { name: "复制" }));
		await user.click(await screen.findByRole("button", { name: "确认复制" }));

		await waitFor(() => {
			expect(onReplicate).toHaveBeenCalledWith({ name: "Active Item Copy", price: 50, deletedAt: null }, activeRow);
		});
		activeView.unmount();

		const trashedView = renderWithProviders(
			<ActionList actions={rowActions} payload={trashedRow} surface="cell" maxInline={3} />,
		);
		expect(screen.getByRole("button", { name: "恢复" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "永久删除" })).toBeInTheDocument();

		await trashedView.user.click(screen.getByRole("button", { name: "恢复" }));
		await trashedView.user.click(await screen.findByRole("button", { name: "确认恢复" }));

		await waitFor(() => {
			expect(onRestore).toHaveBeenCalledWith(trashedRow);
		});
	});
});
