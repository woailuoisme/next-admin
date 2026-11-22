import { StrictMode } from "react";
import { Star } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { Table, TableBody, TableCell, TableFooter, TableRow } from "@/components/ui/table";
import { MaskedCell } from "@/components/data-table/cells/display/MaskedCell";
import { TextCell } from "@/components/data-table/cells/display/TextCell";
import { ImageCell } from "@/components/data-table/cells/media/image/ImageCell";
import { action } from "@/components/actions";
import { actionsCol } from "@/components/data-table/columns/actions";
import { dateCol } from "@/components/data-table/columns/date";
import { iconCol, maskedCol, progressCol, sparklineCol } from "@/components/data-table/columns/display";
import { currencyCol, numberCol } from "@/components/data-table/columns/number";
import type { DataTableColDef } from "@/components/data-table/core/types";
import { DataTableSummaryRow } from "@/components/data-table/footer/DataTableSummaryRow";
import { act, fireEvent, renderWithProviders, screen, waitFor } from "test/test-utils";

interface ContractRow {
	id: string;
	score: number;
	price: number;
	progress: number;
	trend: number[];
	phone: string;
	state: string;
	dueAt: Date;
}

describe("Column <-> Cell Contracts & Cell Performance Guards", () => {
	it("forwards numberCol decimals/colorize and currencyCol mode/currency accurately", () => {
		const numCol = numberCol<ContractRow>("score", "Score", { decimals: 3, colorize: true });
		const currSymCol = currencyCol<ContractRow>("price", "Price Symbol", { currency: "EUR", decimals: 2 });
		const currCodeCol = currencyCol<ContractRow>("price", "Price Intl", { currencyCode: "EUR", decimals: 2 });

		const row: ContractRow = {
			id: "1",
			score: 12.5678,
			price: 98.7,
			progress: 75,
			trend: [10, 20, 5, 30],
			phone: "13812345678",
			state: "ok",
			dueAt: new Date(Date.now() + 7200_000),
		};

		const { container } = renderWithProviders(
			<div>
				<div data-testid="num-wrap">
					{numCol.renderCell?.({ value: row.score, row, field: "score", index: 0, colDef: numCol })}
				</div>
				<div data-testid="curr-sym-wrap">
					{currSymCol.renderCell?.({ value: row.price, row, field: "price", index: 0, colDef: currSymCol })}
				</div>
				<div data-testid="curr-code-wrap">
					{currCodeCol.renderCell?.({ value: row.price, row, field: "price", index: 0, colDef: currCodeCol })}
				</div>
			</div>,
			{ locale: "en" },
		);

		const numWrap = screen.getByTestId("num-wrap");
		expect(numWrap).toHaveTextContent("12.568");
		expect(numWrap.querySelector(".text-chart-2")).toBeInTheDocument();

		expect(screen.getByTestId("curr-sym-wrap")).toHaveTextContent("EUR98.70");
		expect(screen.getByTestId("curr-code-wrap")).toHaveTextContent("€98.70");
		expect(container.textContent).not.toContain("¥");
	});

	it("forwards progressCol showValue, sparklineCol showDot/showMinMax/autoTrendColor, maskedCol maskChar, and iconCol colorMap", () => {
		const prog = progressCol<ContractRow>("progress", "Progress", { showValue: false });
		const spark = sparklineCol<ContractRow>("trend", "Trend", {
			showDot: true,
			showMinMax: true,
			autoTrendColor: false,
		});
		const masked = maskedCol<ContractRow>("phone", "Phone", { maskType: "phone", maskChar: "#" });
		const icon = iconCol<ContractRow>("state", "Icon", {
			iconMap: { ok: Star },
			colorMap: { ok: "text-amber-500" },
		});

		const row = {
			id: "1",
			score: 1,
			price: 1,
			progress: 64,
			trend: [10, 40, 5, 25],
			phone: "13812345678",
			state: "ok",
			dueAt: new Date(),
		};

		renderWithProviders(
			<div>
				<div data-testid="prog-wrap">
					{prog.renderCell?.({ value: row.progress, row, field: "progress", index: 0, colDef: prog })}
				</div>
				<div data-testid="spark-wrap">
					{spark.renderCell?.({ value: row.trend, row, field: "trend", index: 0, colDef: spark })}
				</div>
				<div data-testid="masked-wrap">
					{masked.renderCell?.({ value: row.phone, row, field: "phone", index: 0, colDef: masked })}
				</div>
				<div data-testid="icon-wrap">
					{icon.renderCell?.({ value: row.state, row, field: "state", index: 0, colDef: icon })}
				</div>
			</div>,
			{ locale: "en" },
		);

		// progressCol showValue={false} suppresses label
		expect(screen.getByTestId("prog-wrap")).not.toHaveTextContent("64%");

		// sparklineCol autoTrendColor=false uses text-primary + min/max/endpoint dots
		const sparkCell = screen.getByTestId("sparkline-cell");
		expect(sparkCell.className).toContain("text-primary");
		expect(screen.getByTestId("sparkline-min-dot")).toBeInTheDocument();
		expect(screen.getByTestId("sparkline-max-dot")).toBeInTheDocument();
		expect(screen.getByTestId("sparkline-endpoint-dot")).toBeInTheDocument();

		// maskedCol forwards maskChar="#"
		expect(screen.getByTestId("masked-cell")).toHaveTextContent("138####5678");

		// iconCol applies colorMap for string key "ok"
		const iconSvg = screen.getByTestId("icon-wrap").querySelector("svg");
		expect(iconSvg?.getAttribute("class")).toContain("text-amber-500");
	});

	it("renders future DateCell dualLine countdown badge, skips tooltip when showTooltip=false, and avoids hardcoded Chinese header on actionsCol", () => {
		const futureDate = new Date(Date.now() + 3 * 60 * 60 * 1000);
		const futureCountdownCol = dateCol<ContractRow>("dueAt", "Due", {
			dualLine: true,
			countdown: true,
		});
		const noTooltipCol = dateCol<ContractRow>("dueAt", "Due Plain", {
			showTooltip: false,
		});
		const actCol = actionsCol<ContractRow>({ actions: [action.edit({ onExecute: vi.fn() })] });

		expect(actCol.type).toBe("actions");
		expect(actCol.headerName).toBe("");

		const dummyRow: ContractRow = {
			id: "1",
			score: 1,
			price: 1,
			progress: 1,
			trend: [1, 2],
			phone: "1",
			state: "ok",
			dueAt: futureDate,
		};

		renderWithProviders(
			<div>
				<div data-testid="date-dual">
					{futureCountdownCol.renderCell?.({
						value: futureDate,
						row: dummyRow,
						field: "dueAt",
						index: 0,
						colDef: futureCountdownCol,
					})}
				</div>
				<div data-testid="date-plain">
					{noTooltipCol.renderCell?.({
						value: futureDate,
						row: dummyRow,
						field: "dueAt",
						index: 0,
						colDef: noTooltipCol,
					})}
				</div>
			</div>,
			{ locale: "en" },
		);

		expect(screen.getByTestId("date-dual")).toHaveTextContent(/left|remaining|hours/i);
		expect(screen.getByTestId("date-dual")).not.toHaveTextContent("Expired");
		expect(screen.getByTestId("date-plain").querySelector('[data-slot="tooltip-trigger"]')).not.toBeInTheDocument();
	});

	it("escapes regex metacharacters safely in TextCell highlightText", () => {
		renderWithProviders(<TextCell value="Learn C++ & (test) [v2]" highlightText="C++ & (test)" />, {
			locale: "en",
		});

		const mark = screen.getByText("C++ & (test)");
		expect(mark.tagName).toBe("MARK");
	});

	it("computes min/max aggregation in DataTableSummaryRow over 150,000 rows without call stack overflow", () => {
		const bigRows = Array.from({ length: 150_000 }, (_, i) => ({
			minVal: i === 42 ? -999 : i,
			maxVal: i === 123_456 ? 999_999 : i,
		}));

		const cols: DataTableColDef<{ minVal: number; maxVal: number }>[] = [
			{ field: "minVal", headerName: "MinVal", aggregation: "min" },
			{ field: "maxVal", headerName: "MaxVal", aggregation: "max" },
		];

		renderWithProviders(
			<Table>
				<TableBody>
					<TableRow>
						<TableCell>row</TableCell>
					</TableRow>
				</TableBody>
				<TableFooter>
					<DataTableSummaryRow columns={cols} rows={bigRows} />
				</TableFooter>
			</Table>,
			{ locale: "en" },
		);

		expect(screen.getByText(/-999/)).toBeInTheDocument();
		expect(screen.getByText(/999999/)).toBeInTheDocument();
	});

	it("only mounts ImageLightboxModal dynamically after a thumbnail click in ImageCell", async () => {
		renderWithProviders(<ImageCell src="https://example.com/demo.png" alt="Demo Photo" />, { locale: "en" });

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "查看 Demo Photo 大图" }));

		await waitFor(() => {
			expect(screen.getByRole("dialog")).toBeInTheDocument();
		});
	});

	it("toggles MaskedCell reveal and counts down autoHideDuration safely under StrictMode", () => {
		vi.useFakeTimers();
		try {
			renderWithProviders(
				<StrictMode>
					<MaskedCell value="13812345678" maskType="phone" autoHideDuration={2} />
				</StrictMode>,
				{ locale: "zh" },
			);

			expect(screen.getByTestId("masked-cell")).toHaveTextContent("138****5678");
			fireEvent.click(screen.getByRole("button", { name: "查看明文" }));

			expect(screen.getByTestId("masked-cell")).toHaveTextContent("13812345678");
			expect(screen.getByText("2s")).toBeInTheDocument();

			act(() => {
				vi.advanceTimersByTime(1000);
			});
			expect(screen.getByText("1s")).toBeInTheDocument();

			act(() => {
				vi.advanceTimersByTime(1000);
			});
			expect(screen.getByTestId("masked-cell")).toHaveTextContent("138****5678");
		} finally {
			vi.useRealTimers();
		}
	});
});
