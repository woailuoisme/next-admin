import { useTranslations } from "next-intl";
import { round, sumBy } from "es-toolkit";
import { type ReactElement } from "react";

import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "cn";

import type { DataTableColDef } from "../core/types";

import { TEXT_ALIGN_CLASSES } from "../cells/base";
import { EMPTY_ARRAY } from "../core/constants";
import { useOptionalDataTableContext } from "../core/DataTableContext";
import { buildColumnPinStyles, readCellValue, resolveExpandColumnLeft, toColumnCssVarKey } from "../core/utils";
import type { MessageKeyOf } from "@/types/i18n";

export interface DataTableSummaryRowProps<TData extends Record<string, any> = Record<string, any>> {
	columns?: DataTableColDef<TData>[];
	rows: TData[];
	checkboxSelection?: boolean;
	hasExpandColumn?: boolean;

	summaryLabel?: string;
}

const AGGREGATION_KEY_MAP = {
	sum: "aggregation_sum",
	avg: "aggregation_avg",
	min: "aggregation_min",
	max: "aggregation_max",
	count: "aggregation_count",
} as const;

function getAggregationPrefix(aggregation: string, t: (key: MessageKeyOf<"table">) => string): string {
	const key = AGGREGATION_KEY_MAP[aggregation as keyof typeof AGGREGATION_KEY_MAP];
	if (key) {
		return t(key);
	}
	return `${aggregation}:`;
}

function computeAggregationValue<TData>(
	aggregation: DataTableColDef<TData>["aggregation"],
	values: unknown[],
	rows: TData[],
): React.ReactNode {
	if (typeof aggregation === "function") {
		return aggregation(values, rows as unknown[]) as React.ReactNode;
	}

	const nums = values.filter((v): v is number => typeof v === "number" && !Number.isNaN(v));

	switch (aggregation) {
		case "sum": {
			const total = sumBy(nums, (n) => n);
			return round(total, 2).toLocaleString();
		}
		case "avg": {
			const avg = nums.length > 0 ? sumBy(nums, (n) => n) / nums.length : 0;
			return round(avg, 2).toLocaleString();
		}
		case "min":
		case "max": {
			if (nums.length === 0) return "—";
			let extreme = nums[0];
			for (let i = 1; i < nums.length; i++) {
				if (aggregation === "min" ? nums[i] < extreme : nums[i] > extreme) {
					extreme = nums[i];
				}
			}
			return extreme;
		}
		case "count":
			return rows.length;
		default:
			return null;
	}
}

export function DataTableSummaryRow<TData extends Record<string, any> = Record<string, any>>({
	columns: propColumns,
	rows,
	checkboxSelection: propCheckboxSelection,
	hasExpandColumn: propHasExpandColumn,
	summaryLabel,
}: DataTableSummaryRowProps<TData>): ReactElement | null {
	const ctx = useOptionalDataTableContext<TData>();
	const t = useTranslations("table");
	const columns = propColumns ?? ctx?.visibleColumns ?? EMPTY_ARRAY;
	const checkboxSelection = propCheckboxSelection ?? ctx?.checkboxSelection ?? false;
	const hasExpandColumn = propHasExpandColumn ?? Boolean(ctx?.renderExpandedRow);
	const pinnedLeftSet = new Set(ctx?.pinnedLeftFields ?? EMPTY_ARRAY);
	const pinnedRightSet = new Set(ctx?.pinnedRightFields ?? EMPTY_ARRAY);
	const resolvedSummaryLabel = summaryLabel ?? ctx?.summaryLabel ?? t("summary_label");

	return (
		<TableRow className="hover:bg-muted/30 border-0 bg-transparent font-semibold">
			{checkboxSelection && (
				<TableCell className="bg-muted text-muted-foreground sticky start-0 z-15 w-11 text-center font-mono text-[10px]">
					Σ
				</TableCell>
			)}
			{hasExpandColumn && (
				<TableCell
					style={{
						insetInlineStart: resolveExpandColumnLeft(checkboxSelection, pinnedLeftSet.size > 0),
					}}
					className={cn(
						"w-9 p-0",
						(checkboxSelection || pinnedLeftSet.size > 0) &&
							"sticky z-15 border-r border-border/70 bg-muted shadow-pin-left",
					)}
				/>
			)}

			{columns.map((col, idx) => {
				const { field, aggregation, align, width, minWidth, maxWidth } = col;
				const colKey = col.id ?? `${field}_${idx}`;
				const varKey = toColumnCssVarKey(field);
				const isLeftPinned = pinnedLeftSet.has(field);
				const isRightPinned = pinnedRightSet.has(field);

				const cellStyle = buildColumnPinStyles({
					varKey,
					width,
					minWidth,
					maxWidth,
					isLeftPinned,
					isRightPinned,
				});
				const pinClass = cn(
					isLeftPinned && "sticky z-15 border-r border-border/70 bg-muted shadow-pin-left",
					isRightPinned && "sticky z-15 border-l border-border/70 bg-muted shadow-pin-right",
				);

				if (idx === 0 && !aggregation) {
					return (
						<TableCell
							key={colKey}
							style={cellStyle}
							className={cn("text-muted-foreground text-xs font-bold tracking-wider uppercase", pinClass)}
						>
							{resolvedSummaryLabel}
						</TableCell>
					);
				}

				if (!aggregation) {
					return <TableCell key={colKey} style={cellStyle} className={pinClass || undefined} />;
				}

				const values = rows.map((r) => readCellValue(r, col));
				const displayValue = computeAggregationValue(aggregation, values, rows);
				const prefix = typeof aggregation === "string" ? getAggregationPrefix(aggregation, t) : "";

				return (
					<TableCell
						key={colKey}
						style={cellStyle}
						className={cn("font-mono text-xs", TEXT_ALIGN_CLASSES[align ?? "left"], pinClass)}
					>
						{prefix && <span className="text-muted-foreground mr-1 text-[11px] font-normal">{prefix}</span>}
						<span className="text-foreground font-bold">{displayValue}</span>
					</TableCell>
				);
			})}
		</TableRow>
	);
}
