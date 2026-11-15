"use client";

import * as React from "react";

import { Separator } from "@/components/ui/separator";
import { cn } from "cn";

export interface SummaryLineItem {
  label: React.ReactNode;
  value: number | string;
  format?: "currency" | "number" | "text";
}

export interface SummaryEntryProps {
  items: readonly SummaryLineItem[];
  total?: SummaryLineItem;
  currencyPrefix?: string;
  decimals?: number;
  className?: string;
}

function formatSummaryValue(item: SummaryLineItem, currencyPrefix: string, decimals: number): React.ReactNode {
  if (typeof item.value !== "number") return item.value;
  if (item.format === "number") return item.value.toLocaleString();
  if (item.format === "text") return String(item.value);
  return `${currencyPrefix}${item.value.toFixed(decimals)}`;
}

/**
 * Filament 风格详情账单/指标汇总卡片：
 * 统一渲染明细行与高亮总计行，消除业务 Infolist 内的手工财务卡片 JSX。
 */
export const SummaryEntry = React.memo(function SummaryEntry({
  items,
  total,
  currencyPrefix = "$",
  decimals = 2,
  className,
}: SummaryEntryProps) {
  return (
    <div className={cn("border-border/60 bg-muted/10 space-y-1.5 rounded-lg border p-3 text-xs", className)}>
      {items.map((item, idx) => (
        <div
          key={typeof item.label === "string" ? item.label : idx}
          className="text-muted-foreground flex justify-between"
        >
          <span>{item.label}</span>
          <span>{formatSummaryValue(item, currencyPrefix, decimals)}</span>
        </div>
      ))}
      {total ? (
        <>
          <Separator className="my-1" />
          <div className="text-foreground flex justify-between pt-1 text-sm font-bold">
            <span>{total.label}</span>
            <span className="text-primary font-mono">{formatSummaryValue(total, currencyPrefix, decimals)}</span>
          </div>
        </>
      ) : null}
    </div>
  );
});
