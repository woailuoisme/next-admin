import * as React from "react";

import type { KeyValueEntryProps } from "./types";

import { EntryPlaceholder, EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";

function formatDisplayValue(val: unknown): string {
  return typeof val === "object" && val !== null ? JSON.stringify(val) : String(val ?? "");
}

const EMPTY_ENTRIES: Array<{ key: string; value: any }> = [];

export const KeyValueEntry = React.memo(function KeyValueEntry({
  name,
  value: explicitValue,
  variant = "list",
  placeholder = "-",
  ...wrapperProps
}: KeyValueEntryProps) {
  const rawValue = useInfolistFieldValue(name, explicitValue);

  const entries: Array<{ key: string; value: any }> = React.useMemo(() => {
    if (!rawValue) return EMPTY_ENTRIES;
    if (Array.isArray(rawValue)) {
      return rawValue.map((item) => ({
        key: String(item.key ?? ""),
        value: item.value,
      }));
    }
    if (typeof rawValue === "object") {
      return Object.entries(rawValue).map(([k, v]) => ({
        key: k,
        value: v,
      }));
    }
    return EMPTY_ENTRIES;
  }, [rawValue]);

  const renderContent = () => {
    if (entries.length === 0) {
      return <EntryPlaceholder>{placeholder}</EntryPlaceholder>;
    }

    if (variant === "table") {
      return (
        <div className="border-border overflow-hidden rounded-lg border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-border bg-muted/50 text-muted-foreground border-b font-medium">
                <th className="w-1/3 px-3 py-2 text-left">Key</th>
                <th className="px-3 py-2 text-left">Value</th>
              </tr>
            </thead>
            <tbody className="divide-border/60 divide-y">
              {entries.map(({ key, value }, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="text-muted-foreground px-3 py-2 font-mono font-medium break-all">{key}</td>
                  <td className="text-foreground px-3 py-2 break-all">{formatDisplayValue(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="divide-border/60 border-border/80 bg-muted/20 divide-y rounded-lg border px-3 py-1 text-xs">
        {entries.map(({ key, value }, idx) => (
          <div key={idx} className="flex items-baseline justify-between gap-4 py-1.5">
            <span className="text-muted-foreground shrink-0 font-mono font-medium">{key}</span>
            <span className="text-foreground truncate text-right">{formatDisplayValue(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return <EntryWrapper {...wrapperProps}>{renderContent()}</EntryWrapper>;
});
