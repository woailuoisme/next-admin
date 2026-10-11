import * as React from "react";

import { CopyButton } from "@/components/copy-button";

import type { ColorEntryProps } from "./types";

import { EntryPlaceholder, EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";

export const ColorEntry = React.memo(function ColorEntry({
  name,
  value: explicitValue,
  showText = true,
  copyable = true,
  placeholder = "-",
  ...wrapperProps
}: ColorEntryProps) {
  const rawValue = useInfolistFieldValue(name, explicitValue);

  if (!rawValue) {
    return (
      <EntryWrapper {...wrapperProps}>
        <EntryPlaceholder>{placeholder}</EntryPlaceholder>
      </EntryWrapper>
    );
  }

  const colorStr = String(rawValue);

  return (
    <EntryWrapper {...wrapperProps}>
      <div className="inline-flex items-center gap-2">
        <div
          className="border-border/80 size-5 shrink-0 rounded-md border shadow-xs"
          style={{ backgroundColor: colorStr }}
          title={colorStr}
        />
        {showText && (
          <span className="text-foreground font-mono text-xs uppercase">{colorStr.toUpperCase()}</span>
        )}
        {copyable && <CopyButton text={colorStr} className="size-5 shrink-0" />}
      </div>
    </EntryWrapper>
  );
});
