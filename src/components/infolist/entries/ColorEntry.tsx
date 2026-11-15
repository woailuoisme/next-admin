"use client";

import * as React from "react";

import { CopyButton } from "@/components/shared/CopyButton";

import type { ColorEntryProps } from "./types";

import { EntryPlaceholder, EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";

const HEX_COLOR_RE = /^#[0-9a-f]{3,8}$/i;
const UNSAFE_CSS_VALUE_RE = /[;{}<>\\]/;

function formatColorText(colorStr: string): string {
  return HEX_COLOR_RE.test(colorStr) ? colorStr.toUpperCase() : colorStr;
}

export const ColorEntry = React.memo(function ColorEntry({
  name,
  value: explicitValue,
  showText = true,
  copyable = true,
  placeholder = "-",
  ...wrapperProps
}: ColorEntryProps) {
  const rawValue = useInfolistFieldValue(name, explicitValue);
  const colorStr = typeof rawValue === "string" ? rawValue.trim() : rawValue != null ? String(rawValue).trim() : "";

  if (!colorStr) {
    return (
      <EntryWrapper {...wrapperProps}>
        <EntryPlaceholder>{placeholder}</EntryPlaceholder>
      </EntryWrapper>
    );
  }

  const safeColor = UNSAFE_CSS_VALUE_RE.test(colorStr) ? undefined : colorStr;
  const displayText = formatColorText(colorStr);

  return (
    <EntryWrapper {...wrapperProps}>
      <div className="inline-flex items-center gap-2">
        <div
          aria-hidden="true"
          className="border-border/80 size-5 shrink-0 rounded-md border shadow-xs"
          style={safeColor ? { backgroundColor: safeColor } : undefined}
          title={displayText}
        />
        {showText && <span className="text-foreground font-mono text-xs">{displayText}</span>}
        {copyable && <CopyButton text={colorStr} className="size-5 shrink-0" />}
      </div>
    </EntryWrapper>
  );
});
