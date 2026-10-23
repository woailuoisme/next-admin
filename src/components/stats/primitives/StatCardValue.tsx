import { useFormatter, useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { Check, Copy } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { StatCardValueProps } from "./types";

import { useStatCardContext } from "./StatCardContext";
import { DENSITY_STYLES } from "./types";
import { useNumberTween } from "./useNumberTween";

export const StatCardValue = memo(function StatCardValue({
  value,
  prefix,
  suffix,
  formatter,
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

  const isNumeric = typeof value === "number";
  const animatedValue = useNumberTween(isNumeric ? value : 0, {
    enabled: animated && isNumeric,
  });

  // Value to format
  const activeValue = animated && isNumeric ? animatedValue : value;

  let formattedContent: React.ReactNode;
  if (children !== undefined) {
    formattedContent = children;
  } else if (activeValue === null || activeValue === undefined) {
    formattedContent = "--";
  } else if (formatter) {
    formattedContent = formatter(activeValue);
  } else if (typeof activeValue === "number") {
    formattedContent = format.number(activeValue);
  } else {
    formattedContent = activeValue;
  }

  const handleCopy = useMemoizedFn(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const textToCopy = copyText ?? (value !== undefined && value !== null ? String(value) : "");
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(t("copied_success"));
      if (copyResetTimerRef.current) clearTimeout(copyResetTimerRef.current);
      copyResetTimerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t("copied_failed"));
    }
  });

  return (
    <div className={cn("group/val flex items-baseline gap-1", className)} {...props}>
      {prefix ? <span className={cn("font-semibold text-muted-foreground", dStyles.prefixText)}>{prefix}</span> : null}

      <span className={cn("font-mono font-bold tracking-tight text-foreground tabular-nums", dStyles.valueText)}>
        {formattedContent}
      </span>

      {suffix ? (
        <span className={cn("ml-0.5 font-medium text-muted-foreground", dStyles.suffixText)}>{suffix}</span>
      ) : null}

      {copyable && value !== null && value !== undefined ? (
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground/50 hover:bg-muted hover:text-foreground ml-1 inline-flex cursor-pointer items-center rounded p-0.5 opacity-0 transition-all group-hover/val:opacity-100 focus:opacity-100"
              onClick={handleCopy}
              aria-label={t("copy_value")}
            >
              {copied ? <Check className="animate-in text-primary zoom-in h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="px-1.5 py-0.5 text-[10px]">
            {copied ? t("copied") : t("click_to_copy")}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
});
