import { round, sumBy } from "es-toolkit";
import { memo, type ReactElement } from "react";

import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { DataTableColDef } from "../core/types";

import { TEXT_ALIGN_CLASSES } from "../cells/base";
import { readCellValue } from "../core/utils";

export interface DataTableSummaryRowProps<TData = any> {
  columns: DataTableColDef<TData>[];
  rows: TData[];
  checkboxSelection?: boolean;
  hasExpandColumn?: boolean;
}

function DataTableSummaryRowInner<TData = any>({
  columns,
  rows,
  checkboxSelection,
  hasExpandColumn,
}: DataTableSummaryRowProps<TData>) {
  return (
    <TableRow className="hover:bg-muted/30 border-0 bg-transparent font-semibold">
      {checkboxSelection && (
        <TableCell className="text-muted-foreground w-10 text-center font-mono text-[10px]">
          Σ
        </TableCell>
      )}
      {hasExpandColumn && <TableCell className="w-9 p-0" />}

      {columns.map((col, idx) => {
        const { field, aggregation, align } = col;
        const colKey = col.id ?? `${field}_${idx}`;

        if (idx === 0 && !aggregation) {
          return (
            <TableCell
              key={colKey}
              className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
            >
              Summary
            </TableCell>
          );
        }

        if (!aggregation) {
          return <TableCell key={colKey} />;
        }

        const values = rows.map((r) => readCellValue(r, col));
        const nums = values.filter((v): v is number => typeof v === "number" && !Number.isNaN(v));

        let displayValue: any = null;

        if (typeof aggregation === "function") {
          displayValue = aggregation(values, rows);
        } else if (aggregation === "sum") {
          const total = sumBy(nums, (n) => n);
          displayValue = round(total, 2).toLocaleString();
        } else if (aggregation === "avg") {
          const avg = nums.length > 0 ? sumBy(nums, (n) => n) / nums.length : 0;
          displayValue = round(avg, 2).toLocaleString();
        } else if (aggregation === "min") {
          displayValue = nums.length > 0 ? Math.min(...nums) : "—";
        } else if (aggregation === "max") {
          displayValue = nums.length > 0 ? Math.max(...nums) : "—";
        } else if (aggregation === "count") {
          displayValue = rows.length;
        }

        return (
          <TableCell
            key={colKey}
            className={cn("font-mono text-xs", TEXT_ALIGN_CLASSES[align ?? "left"])}
          >
            <span className="text-muted-foreground mr-1 text-[11px] font-normal">
              {typeof aggregation === "string" ? `${aggregation}:` : ""}
            </span>
            <span className="text-foreground font-bold">{displayValue}</span>
          </TableCell>
        );
      })}
    </TableRow>
  );
}

export const DataTableSummaryRow = memo(DataTableSummaryRowInner) as <TData = any>(
  props: DataTableSummaryRowProps<TData>,
) => ReactElement | null;
