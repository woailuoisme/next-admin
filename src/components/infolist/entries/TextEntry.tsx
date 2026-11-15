"use client";

import { useLocale, useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import * as React from "react";

import { CopyButton } from "@/components/shared/CopyButton";
import { sanitizeContactToken, sanitizeUrl } from "@/components/shared/url";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

import type { EntrySemanticColor, TextEntryProps } from "./types";

import { EntryPlaceholder, EntryWrapper } from "../core/EntryWrapper";
import { useInfolistFieldValue } from "../core/InfolistContext";
import { hasRenderableNode } from "../core/utils";

export const badgeColorClasses: Record<EntrySemanticColor, string> = {
  primary: "border-primary/20 bg-primary/10 text-primary",
  secondary: "border-border bg-secondary text-secondary-foreground",
  success: "border-chart-2/30 bg-chart-2/10 text-chart-2 dark:bg-chart-2/20",
  warning: "border-chart-4/30 bg-chart-4/10 text-chart-4 dark:bg-chart-4/20",
  destructive: "border-destructive/25 bg-destructive/10 text-destructive",
  info: "border-chart-1/30 bg-chart-1/10 text-chart-1 dark:bg-chart-1/20",
  neutral: "border-border bg-muted/60 text-muted-foreground",
};

const NUMBER_FORMATTER_CACHE = new Map<string, Intl.NumberFormat>();
const DATE_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

function getNumberFormatter(
  locale: string,
  currency?: string,
  decimals?: number,
  isCurrency = false,
): Intl.NumberFormat | null {
  const key = `${locale}:${isCurrency ? "c" : "n"}:${currency ?? ""}:${decimals ?? ""}`;
  let formatter = NUMBER_FORMATTER_CACHE.get(key);
  if (!formatter) {
    try {
      formatter = isCurrency
        ? new Intl.NumberFormat(locale || undefined, {
            style: "currency",
            currency: currency || "USD",
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : new Intl.NumberFormat(locale || undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });
      if (NUMBER_FORMATTER_CACHE.size < 100) {
        NUMBER_FORMATTER_CACHE.set(key, formatter);
      }
    } catch {
      return null;
    }
  }
  return formatter;
}

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

function getDateFormatter(locale: string, options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat | null {
  const resolved = options ?? DEFAULT_DATE_OPTIONS;
  const key = `${locale}:${JSON.stringify(resolved)}`;
  let formatter = DATE_FORMATTER_CACHE.get(key);
  if (!formatter) {
    try {
      formatter = new Intl.DateTimeFormat(locale || undefined, resolved);
      if (DATE_FORMATTER_CACHE.size < 100) {
        DATE_FORMATTER_CACHE.set(key, formatter);
      }
    } catch {
      return null;
    }
  }
  return formatter;
}

function parseNumericValue(raw: unknown): number | null {
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : null;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

interface FormatContentOptions {
  format: TextEntryProps["format"];
  rawValue: unknown;
  locale: string;
  color: EntrySemanticColor;
  currency: string;
  decimals?: number;
  dateOptions?: Intl.DateTimeFormatOptions;
  href?: string;
  openInNewTab: boolean;
  booleanYesLabel: string;
  booleanNoLabel: string;
  openExternalLabel: string;
}

function renderFormattedContent({
  format,
  rawValue,
  locale,
  color,
  currency,
  decimals,
  dateOptions,
  href,
  openInNewTab,
  booleanYesLabel,
  booleanNoLabel,
  openExternalLabel,
}: FormatContentOptions): React.ReactNode {
  switch (format) {
    case "badge": {
      const displayNode =
        typeof rawValue === "boolean" ? (rawValue ? booleanYesLabel : booleanNoLabel) : (rawValue as React.ReactNode);
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium tracking-tight transition-colors",
            badgeColorClasses[color] ?? badgeColorClasses.neutral,
          )}
        >
          {displayNode}
        </Badge>
      );
    }

    case "currency": {
      const num = parseNumericValue(rawValue);
      if (num === null) return String(rawValue);
      const formatter = getNumberFormatter(locale, currency, decimals, true);
      return formatter ? formatter.format(num) : `${currency} ${num}`;
    }

    case "number": {
      const num = parseNumericValue(rawValue);
      if (num === null) return String(rawValue);
      const formatter = getNumberFormatter(locale, undefined, decimals, false);
      return formatter ? formatter.format(num) : num.toString();
    }

    case "date": {
      const date = rawValue instanceof Date ? rawValue : new Date(rawValue as string | number);
      if (Number.isNaN(date.getTime())) return String(rawValue);
      const formatter = getDateFormatter(locale, dateOptions);
      return formatter ? formatter.format(date) : date.toISOString();
    }

    case "url": {
      const safeUrl = sanitizeUrl(href ?? String(rawValue), {
        allowMailtoTel: false,
        allowRelative: true,
        allowBareDomain: false,
      });
      if (!safeUrl) {
        return <span>{String(rawValue)}</span>;
      }
      return (
        <a
          href={safeUrl}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noreferrer noopener" : undefined}
          className="text-primary inline-flex items-center gap-1 underline-offset-4 transition-colors hover:underline"
        >
          <span>{String(rawValue)}</span>
          {openInNewTab && (
            <>
              <ExternalLink className="size-3 opacity-70" aria-hidden="true" />
              <span className="sr-only"> ({openExternalLabel})</span>
            </>
          )}
        </a>
      );
    }

    case "email": {
      const email = sanitizeContactToken(rawValue);
      if (!email) return <span>{String(rawValue)}</span>;
      return (
        <a href={`mailto:${email}`} className="text-primary underline-offset-4 transition-colors hover:underline">
          {String(rawValue)}
        </a>
      );
    }

    case "phone": {
      const phone = sanitizeContactToken(rawValue);
      if (!phone) return <span>{String(rawValue)}</span>;
      return (
        <a href={`tel:${phone}`} className="text-primary underline-offset-4 transition-colors hover:underline">
          {String(rawValue)}
        </a>
      );
    }

    default:
      return typeof rawValue === "boolean"
        ? rawValue
          ? booleanYesLabel
          : booleanNoLabel
        : (rawValue as React.ReactNode);
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
  const t = useTranslations("infolist");
  const locale = useLocale();
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
    locale,
    color,
    currency,
    decimals,
    dateOptions,
    href,
    openInNewTab,
    booleanYesLabel: t("boolean_yes"),
    booleanNoLabel: t("boolean_no"),
    openExternalLabel: t("open_external"),
  });

  const copyText = typeof copyable === "string" ? copyable : String(rawValue);

  return (
    <EntryWrapper {...wrapperProps}>
      <div className="inline-flex max-w-full items-center gap-1.5">
        {hasRenderableNode(prefix) && <span className="text-muted-foreground shrink-0">{prefix}</span>}
        <div className="truncate">{formattedContent}</div>
        {hasRenderableNode(suffix) && <span className="text-muted-foreground shrink-0">{suffix}</span>}
        {copyable && <CopyButton text={copyText} className="size-5 shrink-0" />}
      </div>
    </EntryWrapper>
  );
});
