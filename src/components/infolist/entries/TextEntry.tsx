import { ExternalLink } from "lucide-react";
import * as React from "react";

import { CopyButton } from "@/components/shared/CopyButton";
import { cn } from "@/lib/utils";

import type { EntrySemanticColor, TextEntryProps } from "./types";

import { EntryPlaceholder, EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";

export const badgeColorClasses: Record<EntrySemanticColor, string> = {
  primary: "border-primary/20 bg-primary/10 text-primary",
  secondary: "border-border bg-secondary text-secondary-foreground",
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  destructive: "border-destructive/25 bg-destructive/10 text-destructive",
  info: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  neutral: "border-border bg-muted/60 text-muted-foreground",
};

interface FormatContentOptions {
  format: TextEntryProps["format"];
  rawValue: any;
  color: EntrySemanticColor;
  currency: string;
  decimals?: number;
  dateOptions?: Intl.DateTimeFormatOptions;
  href?: string;
  openInNewTab: boolean;
}

function renderFormattedContent({
  format,
  rawValue,
  color,
  currency,
  decimals,
  dateOptions,
  href,
  openInNewTab,
}: FormatContentOptions): React.ReactNode {
  switch (format) {
    case "badge":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tracking-tight transition-colors",
            badgeColorClasses[color] ?? badgeColorClasses.neutral,
          )}
        >
          {rawValue}
        </span>
      );

    case "currency": {
      const num = Number(rawValue);
      return Number.isNaN(num)
        ? String(rawValue)
        : new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(num);
    }

    case "number": {
      const num = Number(rawValue);
      return Number.isNaN(num)
        ? String(rawValue)
        : new Intl.NumberFormat(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(num);
    }

    case "date": {
      const date = new Date(rawValue);
      return Number.isNaN(date.getTime())
        ? String(rawValue)
        : new Intl.DateTimeFormat(
            undefined,
            dateOptions ?? {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            },
          ).format(date);
    }

    case "url": {
      const linkUrl = href ?? String(rawValue);
      return (
        <a
          href={linkUrl}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noreferrer noopener" : undefined}
          className="text-primary inline-flex items-center gap-1 underline-offset-4 transition-colors hover:underline"
        >
          <span>{String(rawValue)}</span>
          {openInNewTab && <ExternalLink className="size-3 opacity-70" />}
        </a>
      );
    }

    case "email":
      return (
        <a href={`mailto:${rawValue}`} className="text-primary underline-offset-4 transition-colors hover:underline">
          {String(rawValue)}
        </a>
      );

    case "phone":
      return (
        <a href={`tel:${rawValue}`} className="text-primary underline-offset-4 transition-colors hover:underline">
          {String(rawValue)}
        </a>
      );

    default:
      return rawValue;
  }
}

export const TextEntry = React.memo(function TextEntry({
  name,
  value: explicitValue,
  format = "text",
  color = "neutral",
  currency = "USD",
  decimals,
  dateOptions,
  prefix,
  suffix,
  copyable,
  placeholder = "-",
  href,
  openInNewTab = true,
  ...wrapperProps
}: TextEntryProps) {
  const rawValue = useInfolistFieldValue(name, explicitValue);

  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return (
      <EntryWrapper {...wrapperProps}>
        <EntryPlaceholder>{placeholder}</EntryPlaceholder>
      </EntryWrapper>
    );
  }

  const formattedContent = renderFormattedContent({
    format,
    rawValue,
    color,
    currency,
    decimals,
    dateOptions,
    href,
    openInNewTab,
  });

  const copyText = typeof copyable === "string" ? copyable : String(rawValue);

  return (
    <EntryWrapper {...wrapperProps}>
      <div className="inline-flex max-w-full items-center gap-1.5">
        {prefix && <span className="text-muted-foreground shrink-0">{prefix}</span>}
        <div className="truncate">{formattedContent}</div>
        {suffix && <span className="text-muted-foreground shrink-0">{suffix}</span>}
        {copyable && <CopyButton text={copyText} className="size-5 shrink-0" />}
      </div>
    </EntryWrapper>
  );
});
