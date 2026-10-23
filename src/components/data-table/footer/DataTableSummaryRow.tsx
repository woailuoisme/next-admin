import { useTranslations } from "next-intl";
import { round, sumBy } from "es-toolkit";
import { memo, type ReactElement } from "react";

import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { DataTableColDef } from "../core/types";

import { TEXT_ALIGN_CLASSES } from "../cells/base";
import { useOptionalDataTableContext } from "../core/DataTableContext";
import { readCellValue } from "../core/utils";
import type { MessageKeyOf } from "@/types/i18n";

export interface DataTableSummaryRowProps<TData = unknown> {
  columns: DataTableColDef<TData>[];
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
      return nums.length > 0 ? Math.min(...nums) : "—";
    case "max":
      return nums.length > 0 ? Math.max(...nums) : "—";
    case "count":
      return rows.length;
    default:
      return null;
  }
}

function DataTableSummaryRowInner<TData = unknown>({
  columns,
  rows,
  checkboxSelection,
  hasExpandColumn,
  summaryLabel,
}: DataTableSummaryRowProps<TData>) {
  const ctx = useOptionalDataTableContext<TData>();
  const t = useTranslations("table");
  const resolvedSummaryLabel = summaryLabel ?? ctx?.summaryLabel ?? t("summary_label");

  return (
    <TableRow className="hover:bg-muted/30 border-0 bg-transparent font-semibold">
      {checkboxSelection && (
        <TableCell className="text-muted-foreground w-10 text-center font-mono text-[10px]">Σ</TableCell>
      )}
      {hasExpandColumn && <TableCell className="w-9 p-0" />}

      {columns.map((col, idx) => {
        const { field, aggregation, align } = col;
        const colKey = col.id ?? `${field}_${idx}`;

        if (idx === 0 && !aggregation) {
          return (
            <TableCell key={colKey} className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              {resolvedSummaryLabel}
            </TableCell>
          );
        }

        if (!aggregation) {
          return <TableCell key={colKey} />;
        }

        const values = rows.map((r) => readCellValue(r, col));
        const displayValue = computeAggregationValue(aggregation, values, rows);
        const prefix = typeof aggregation === "string" ? getAggregationPrefix(aggregation, t) : "";

        return (
          <TableCell key={colKey} className={cn("font-mono text-xs", TEXT_ALIGN_CLASSES[align ?? "left"])}>
            {prefix && <span className="text-muted-foreground mr-1 text-[11px] font-normal">{prefix}</span>}
            <span className="text-foreground font-bold">{displayValue}</span>
          </TableCell>
        );
      })}
    </TableRow>
  );
}

export const DataTableSummaryRow = memo(DataTableSummaryRowInner) as <TData = unknown>(
  props: DataTableSummaryRowProps<TData>,
) => ReactElement | null;
