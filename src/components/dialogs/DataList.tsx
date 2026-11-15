"use client";

import { isNil } from "es-toolkit";
import { memo } from "react";

import { CopyButton } from "@/components/shared/CopyButton";
import { COL_SPAN_CLASSES, type ColSpan, type ResponsiveColumns, resolveGridClassName } from "@/components/shared/grid";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

import type { DataListItem as DataListItemType, DataListProps } from "./types";

const DATA_LIST_COLUMNS: Record<NonNullable<DataListProps["columns"]>, ResponsiveColumns> = {
  1: { default: 1 },
  2: { default: 1, sm: 2 },
  3: { default: 1, sm: 2, md: 3 },
  4: { default: 1, sm: 2, md: 4 },
};

export const DataListRow = memo(function DataListRow({
  label,
  value,
  copyable = false,
  badge = false,
  badgeVariant,
  span,
  className,
}: DataListItemType) {
  const displayValue = !isNil(value) && value !== "" ? value : "—";
  const canCopy = Boolean(
    copyable && ((typeof value === "string" && value !== "") || (typeof value === "number" && !Number.isNaN(value))),
  );
  const spanClass = span && span in COL_SPAN_CLASSES ? COL_SPAN_CLASSES[span as ColSpan] : undefined;

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/40",
        spanClass,
        className,
      )}
    >
      <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">{label}</span>
      <div className="flex items-center justify-between gap-2">
        <div className="text-foreground text-sm font-semibold break-words">
          {badge && typeof displayValue === "string" ? (
            <Badge variant={badgeVariant} className="text-xs">
              {displayValue}
            </Badge>
          ) : (
            displayValue
          )}
        </div>
        {canCopy && <CopyButton text={String(value)} className="size-6 shrink-0" />}
      </div>
    </div>
  );
});

export const DataList = memo(function DataList({ items, columns = 2, className }: DataListProps) {
  return (
    <div className={resolveGridClassName(DATA_LIST_COLUMNS[columns] ?? DATA_LIST_COLUMNS[2], "compact", className)}>
      {items.map((item, idx) => (
        <DataListRow key={typeof item.label === "string" ? item.label : idx} {...item} />
      ))}
    </div>
  );
});
