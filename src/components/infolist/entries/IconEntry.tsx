"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import * as React from "react";

import { cn } from "cn";

import type { EntrySemanticColor, IconEntryProps } from "./types";

import { EntryPlaceholder, EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";
import { hasRenderableNode } from "../core/utils";

const iconColorClasses: Record<EntrySemanticColor, string> = {
  primary: "text-primary",
  secondary: "text-muted-foreground",
  success: "text-chart-2",
  warning: "text-chart-4",
  destructive: "text-destructive",
  info: "text-chart-1",
  neutral: "text-muted-foreground",
};

function getIconEntryLabel(
  text: React.ReactNode | undefined,
  rawValue: unknown,
  hasRawValue: boolean,
  valStr: string,
  booleanYesLabel: string,
  booleanNoLabel: string,
): React.ReactNode {
  if (hasRenderableNode(text)) {
    return <span className="text-sm font-medium">{text}</span>;
  }
  if (!hasRawValue) {
    return null;
  }
  if (typeof rawValue === "boolean") {
    return <span className="text-muted-foreground text-sm">{rawValue ? booleanYesLabel : booleanNoLabel}</span>;
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
  const t = useTranslations("infolist");
  const rawValue = useInfolistFieldValue(name, explicitValue);
  const hasRawValue = rawValue !== null && rawValue !== undefined && rawValue !== "";

  if (!hasRawValue && !explicitIcon) {
    return (
      <EntryWrapper {...wrapperProps}>
        <EntryPlaceholder>{placeholder}</EntryPlaceholder>
      </EntryWrapper>
    );
  }

  const valStr = hasRawValue ? String(rawValue) : "";

  let ResolvedIcon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }> | null = null;
  let resolvedColor: EntrySemanticColor = color ?? "neutral";

  if (hasRawValue && iconMap && valStr in iconMap) {
    ResolvedIcon = iconMap[valStr];
  } else if (explicitIcon) {
    ResolvedIcon = explicitIcon;
  } else if (typeof rawValue === "boolean") {
    ResolvedIcon = rawValue ? CheckCircle2 : XCircle;
    if (!color) {
      resolvedColor = rawValue ? "success" : "destructive";
    }
  }

  if (hasRawValue && colorMap && valStr in colorMap) {
    resolvedColor = colorMap[valStr];
  }

  const labelNode = getIconEntryLabel(text, rawValue, hasRawValue, valStr, t("boolean_yes"), t("boolean_no"));

  return (
    <EntryWrapper {...wrapperProps}>
      <div className="inline-flex items-center gap-2">
        {ResolvedIcon && (
          <ResolvedIcon className={cn("size-4 shrink-0", iconColorClasses[resolvedColor])} aria-hidden />
        )}
        {labelNode}
      </div>
    </EntryWrapper>
  );
});
