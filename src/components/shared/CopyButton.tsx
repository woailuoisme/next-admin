"use client";

import { useTranslations } from "next-intl";

import { useMemoizedFn } from "ahooks";
import { Check, Copy } from "lucide-react";
import { type MouseEvent, memo, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface CopyButtonProps {
  text: string;
  className?: string;
  title?: string;
  successMessage?: string;
  errorMessage?: string;
  copiedTooltip?: string;
}

export const CopyButton = memo(function CopyButton({
  text,
  className,
  title,
  successMessage,
  errorMessage,
  copiedTooltip,
}: CopyButtonProps) {
  const t = useTranslations("shared");

  const resolvedTitle = title ?? t("copy_action");
  const resolvedSuccessMessage = successMessage ?? t("copied_success");
  const resolvedErrorMessage = errorMessage ?? t("copied_failed");
  const resolvedCopiedTooltip = copiedTooltip ?? t("copied");

  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = useMemoizedFn(async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(resolvedSuccessMessage);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to copy text", err);
      toast.error(resolvedErrorMessage);
    }
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "size-6 cursor-pointer p-0 text-muted-foreground transition-colors hover:text-foreground",
            className,
          )}
          onClick={handleCopy}
          aria-label={resolvedTitle}
        >
          {copied ? (
            <Check className="animate-in text-primary zoom-in size-3 duration-200" />
          ) : (
            <Copy className="size-3 transition-transform duration-150 hover:scale-110" />
          )}
          <span className="sr-only">{resolvedTitle}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="px-2 py-1 text-[11px]">
        {copied ? resolvedCopiedTooltip : resolvedTitle}
      </TooltipContent>
    </Tooltip>
  );
});
