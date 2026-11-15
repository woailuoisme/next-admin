"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { Check, Copy } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import type { StatCardValueProps } from "./types";

import { useStatCardContext } from "./StatCardContext";
import { DENSITY_STYLES } from "./types";
import { useNumberTween } from "./useNumberTween";

export const StatCardValue = memo(function StatCardValue({
  value,
  prefix,
  suffix,
  formatter,
  formatOptions,
  copyable = false,
  copyText,
  animated = false,
  density,
  className,
  children,
  ...props
}: StatCardValueProps) {
  const context = useStatCardContext();
  const t = useTranslations("stats");
  const format = useFormatter();
  const resolvedDensity = density ?? context.density ?? "compact";
  const dStyles = DENSITY_STYLES[resolvedDensity] ?? DENSITY_STYLES.compact;
  const [copied, setCopied] = useState(false);
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyResetTimerRef.current) clearTimeout(copyResetTimerRef.current);
    },
    [],
  );

  const isNumeric = typeof value === "number" && Number.isFinite(value);
  const animatedValue = useNumberTween(isNumeric ? value : 0, {
    enabled: animated && isNumeric,
  });

  // Value to format
  const activeValue = animated && isNumeric ? animatedValue : value;

  let formattedContent: React.ReactNode;
  if (children !== undefined) {
    formattedContent = children;
  } else if (
    activeValue === null ||
    activeValue === undefined ||
    (typeof activeValue === "number" && !Number.isFinite(activeValue))
  ) {
    formattedContent = t("no_data");
  } else if (formatter) {
    formattedContent = formatter(activeValue);
  } else if (typeof activeValue === "number") {
    formattedContent = format.number(activeValue, formatOptions);
  } else {
    formattedContent = activeValue;
  }

  const resolvedCopyText =
    copyText ??
    (typeof value === "number"
      ? Number.isFinite(value)
        ? String(value)
        : ""
      : value !== undefined && value !== null
        ? String(value)
        : "");
  const canCopy = copyable && resolvedCopyText.trim().length > 0;

  const handleCopy = useMemoizedFn(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!resolvedCopyText.trim()) return;

    try {
      await navigator.clipboard.writeText(resolvedCopyText);
      setCopied(true);
      toast.success(t("copied_success"));
      if (copyResetTimerRef.current) clearTimeout(copyResetTimerRef.current);
      copyResetTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t("copied_failed"));
    }
  });

  return (
    <div className={cn("group/val flex min-w-0 items-baseline gap-1", className)} {...props}>
      {prefix ? (
        <span className={cn("shrink-0 font-semibold text-muted-foreground", dStyles.prefixText)}>{prefix}</span>
      ) : null}

      <span
        className={cn(
          "min-w-0 truncate font-mono font-bold tracking-tight text-foreground tabular-nums",
          dStyles.valueText,
        )}
        title={
          typeof formattedContent === "string" || typeof formattedContent === "number"
            ? String(formattedContent)
            : undefined
        }
      >
        {formattedContent}
      </span>

      {suffix ? (
        <span className={cn("ml-0.5 shrink-0 font-medium text-muted-foreground", dStyles.suffixText)}>{suffix}</span>
      ) : null}

      {canCopy ? (
        <>
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground/60 hover:bg-muted hover:text-foreground relative z-10 ml-1 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded opacity-70 transition-all focus-visible:opacity-100 md:opacity-0 md:group-hover/val:opacity-100"
                onClick={handleCopy}
                aria-label={t("copy_value")}
              >
                {copied ? (
                  <Check className="animate-in text-primary zoom-in size-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="px-1.5 py-0.5 text-[10px]">
              {copied ? t("copied") : t("click_to_copy")}
            </TooltipContent>
          </Tooltip>
          <span className="sr-only" aria-live="polite">
            {copied ? t("copied_success") : ""}
          </span>
        </>
      ) : null}
    </div>
  );
});
