import { CheckCircle2, XCircle } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import type { EntrySemanticColor, IconEntryProps } from "./types";

import { EntryPlaceholder, EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";

const iconColorClasses: Record<EntrySemanticColor, string> = {
  primary: "text-primary",
  secondary: "text-muted-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  destructive: "text-destructive",
  info: "text-sky-600 dark:text-sky-400",
  neutral: "text-muted-foreground",
};

function getIconEntryLabel(
  text: React.ReactNode | undefined,
  rawValue: unknown,
  valStr: string,
): React.ReactNode {
  if (text !== undefined) {
    return <span className="text-sm font-medium">{text}</span>;
  }
  if (typeof rawValue === "boolean") {
    return <span className="text-muted-foreground text-sm">{rawValue ? "Yes" : "No"}</span>;
  }
  return <span className="text-foreground text-sm">{valStr}</span>;
}

export const IconEntry = React.memo(function IconEntry({
  name,
  value: explicitValue,
  color,
  icon: explicitIcon,
  iconMap,
  colorMap,
  text,
  placeholder = "-",
  ...wrapperProps
}: IconEntryProps) {
  const rawValue = useInfolistFieldValue(name, explicitValue);

  if ((rawValue === null || rawValue === undefined) && !explicitIcon) {
    return (
      <EntryWrapper {...wrapperProps}>
        <EntryPlaceholder>{placeholder}</EntryPlaceholder>
      </EntryWrapper>
    );
  }

  const valStr = String(rawValue);

  let ResolvedIcon: React.ComponentType<{ className?: string }> | null = null;
  let resolvedColor: EntrySemanticColor = color ?? "neutral";

  if (iconMap && valStr in iconMap) {
    ResolvedIcon = iconMap[valStr];
  } else if (explicitIcon) {
    ResolvedIcon = explicitIcon;
  } else if (typeof rawValue === "boolean") {
    ResolvedIcon = rawValue ? CheckCircle2 : XCircle;
    if (!color) {
      resolvedColor = rawValue ? "success" : "destructive";
    }
  }

  if (colorMap && valStr in colorMap) {
    resolvedColor = colorMap[valStr];
  }

  return (
    <EntryWrapper {...wrapperProps}>
      <div className="inline-flex items-center gap-2">
        {ResolvedIcon && (
          <ResolvedIcon className={cn("size-4 shrink-0", iconColorClasses[resolvedColor])} />
        )}
        {getIconEntryLabel(text, rawValue, valStr)}
      </div>
    </EntryWrapper>
  );
});
