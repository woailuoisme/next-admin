"use client";

import { useMemoizedFn } from "ahooks";
import { isNil } from "es-toolkit";
import { Check, Copy } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { DataListItem as DataListItemType, DataListProps } from "./types";

const SPAN_MAP: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
};

const COLUMNS_MAP: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
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
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = useMemoizedFn(() => {
    if (typeof value !== "string" && typeof value !== "number") {
      return;
    }

    navigator.clipboard
      .writeText(String(value))
      .then(() => {
        setCopied(true);
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          setCopied(false);
          timerRef.current = null;
        }, 1500);
      })
      .catch(() => {
        // Ignore clipboard access errors
      });
  });

  const displayValue = !isNil(value) && value !== "" ? value : "—";

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/40",
        span ? SPAN_MAP[span] : undefined,
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
        {copyable && value ? (
          <>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy to clipboard"
              className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-6 shrink-0 items-center justify-center rounded-md transition-colors"
              title="Copy value"
            >
              {copied ? <Check className="text-primary size-3.5" /> : <Copy className="size-3.5" />}
            </button>
            <span className="sr-only" aria-live="polite">
              {copied ? "Copied to clipboard" : ""}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
});

export const DataList = memo(function DataList({ items, columns = 2, className }: DataListProps) {
  const colClass = COLUMNS_MAP[columns] ?? "grid-cols-1 sm:grid-cols-2";

  return (
    <div className={cn("grid gap-3", colClass, className)}>
      {items.map((item, idx) => (
        <DataListRow key={typeof item.label === "string" ? item.label : idx} {...item} />
      ))}
    </div>
  );
});
