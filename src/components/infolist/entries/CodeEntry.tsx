"use client";

import * as React from "react";

import { CopyButton } from "@/components/shared/CopyButton";
import { cn } from "cn";

import type { CodeEntryProps } from "./types";

import { EntryPlaceholder, EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";
import { safeStringify } from "./utils";

export const CodeEntry = React.memo(function CodeEntry({
  name,
  value: explicitValue,
  language,
  formatJson = true,
  copyable = true,
  maxHeight = "max-h-64",
  placeholder = "-",
  ...wrapperProps
}: CodeEntryProps) {
  const rawValue = useInfolistFieldValue(name, explicitValue);

  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return (
      <EntryWrapper {...wrapperProps}>
        <EntryPlaceholder>{placeholder}</EntryPlaceholder>
      </EntryWrapper>
    );
  }

  const displayCode = safeStringify(rawValue, formatJson);

  return (
    <EntryWrapper {...wrapperProps}>
      <div className="group border-border bg-muted/40 relative overflow-hidden rounded-lg border text-xs">
        <div className="border-border/60 bg-muted/60 text-muted-foreground flex items-center justify-between border-b px-3 py-1.5 text-[11px] select-none">
          <span>{language ?? (typeof rawValue === "object" ? "json" : "code")}</span>
          {copyable && <CopyButton text={displayCode} className="size-5" />}
        </div>
        <pre className={cn("overflow-auto p-3 font-mono text-xs leading-relaxed text-foreground/90", maxHeight)}>
          <code>{displayCode}</code>
        </pre>
      </div>
    </EntryWrapper>
  );
});
