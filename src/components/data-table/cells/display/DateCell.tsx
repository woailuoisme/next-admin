import { format, formatDistanceToNow, isPast, isValid, parseISO } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import { isNil } from "es-toolkit";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { memo } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { DateCellProps } from "./types";

import { AVATAR_ALIGN_CLASSES, TEXT_ALIGN_CLASSES } from "../base";

function parseDate(value: Date | number | string): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  return parseISO(value);
}

export const DateCell = memo(function DateCell({
  value,
  format: formatStr = "yyyy-MM-dd HH:mm",
  relative = false,
  dualLine = false,
  primaryFormat = "relative",
  showIcon = false,
  overdueAlert = false,
  countdown = false,
  countdownPrefix,
  timezone,
  align = "left",
  className,
}: DateCellProps) {
  const locale = useLocale();
  const t = useTranslations("common");
  const dateLocale = locale === "zh" ? zhCN : enUS;

  if (isNil(value) || value === "") {
    return <span className="text-muted-foreground/40 text-xs italic">-</span>;
  }

  const parsedDate = parseDate(value);
  if (!isValid(parsedDate)) {
    return <span className="text-muted-foreground/40 text-xs italic">{t("invalid_date")}</span>;
  }

  const dateIsPast = isPast(parsedDate);
  const isOverdue = overdueAlert && dateIsPast;

  const exactFormatted = format(parsedDate, "yyyy-MM-dd HH:mm:ss", { locale: dateLocale });
  const customFormatted = format(parsedDate, formatStr, { locale: dateLocale });
  const relativeString = formatDistanceToNow(parsedDate, { addSuffix: true, locale: dateLocale });
  const countdownString = countdown
    ? dateIsPast
      ? t("countdown_expired")
      : `${countdownPrefix ?? t("countdown_prefix")}${formatDistanceToNow(parsedDate, { locale: dateLocale })}`
    : "";

  // 1. 双行同屏排版模式 (免悬停即可兼顾相对与绝对时间)
  if (dualLine) {
    const isRelativePrimary = primaryFormat === "relative";
    const primaryText = isRelativePrimary ? relativeString : customFormatted;
    const secondaryText = isRelativePrimary ? customFormatted : relativeString;

    return (
      <div className={cn("flex max-w-full flex-col leading-tight", AVATAR_ALIGN_CLASSES[align], className)}>
        <div
          className={cn(
            "flex items-center gap-1 text-xs",
            isOverdue ? "font-medium text-destructive" : "font-medium text-foreground",
          )}
        >
          {isOverdue ? (
            <AlertCircle className="text-destructive size-3 shrink-0 animate-pulse" />
          ) : (
            showIcon && <Calendar className="text-muted-foreground/60 size-3 shrink-0" />
          )}
          <span className="truncate">{primaryText}</span>
          {isOverdue && (
            <span className="bg-destructive/10 text-destructive rounded-xs px-1 font-sans text-[9px]">
              {t("overdue")}
            </span>
          )}
          {countdown && !isPast && (
            <span className="bg-primary/10 text-primary rounded-xs px-1 font-sans text-[9px]">{countdownString}</span>
          )}
        </div>

        <div className="text-muted-foreground/80 mt-0.5 flex items-center gap-1 font-mono text-[10px]">
          <span className="truncate">{secondaryText}</span>
          {timezone && (
            <span className="bg-muted/60 text-muted-foreground/60 rounded-xs px-0.5 text-[9px]">{timezone}</span>
          )}
        </div>
      </div>
    );
  }

  // 2. 单行排版模式
  const displayString = relative ? relativeString : customFormatted;

  const content = (
    <div
      className={cn(
        "flex items-center gap-1.5 font-mono text-xs tracking-tight whitespace-nowrap",
        isOverdue ? "font-medium text-destructive" : "text-foreground/90",
        TEXT_ALIGN_CLASSES[align],
        className,
      )}
    >
      {isOverdue ? (
        <AlertCircle className="text-destructive size-3 shrink-0 animate-pulse" />
      ) : countdown ? (
        <Clock className="text-muted-foreground/60 size-3 shrink-0" />
      ) : (
        showIcon && <Calendar className="text-muted-foreground/60 size-3 shrink-0" />
      )}
      <span className="truncate">{countdown ? countdownString : displayString}</span>
      {timezone && !countdown && (
        <span className="bg-muted/60 text-muted-foreground/70 rounded-xs px-1 font-sans text-[10px]">{timezone}</span>
      )}
      {isOverdue && (
        <span className="bg-destructive/10 text-destructive rounded-xs px-1 font-sans text-[10px]">{t("overdue")}</span>
      )}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex max-w-full cursor-default">{content}</div>
      </TooltipTrigger>
      <TooltipContent side="top" className="font-mono text-xs">
        <p>{exactFormatted}</p>
        {relative && <p className="text-muted-foreground mt-0.5 text-[10px]">格式化: {customFormatted}</p>}
        {timezone && <p className="text-muted-foreground mt-0.5 text-[10px]">时区: {timezone}</p>}
        {isOverdue && <p className="text-destructive mt-0.5 text-[10px] font-semibold">{t("overdue_hint")}</p>}
      </TooltipContent>
    </Tooltip>
  );
});
