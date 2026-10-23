import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { memo } from "react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

import type { GlobalSearchTriggerProps } from "./types";

export const GlobalSearchTrigger = memo(function GlobalSearchTrigger({
  onClick,
  onMouseEnter,
  className,
  triggerText,
  ariaLabel,
}: GlobalSearchTriggerProps) {
  const t = useTranslations("layout");

  const effectiveTriggerText = triggerText ?? t("search_trigger");
  const effectiveAriaLabel = ariaLabel ?? t("search_aria");

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "group relative size-8 shrink-0 cursor-pointer justify-center rounded-lg border-border/70 bg-muted/30 p-0 text-xs font-normal text-muted-foreground transition-all hover:border-border hover:bg-muted/50 hover:text-foreground sm:size-auto sm:h-8 sm:w-48 sm:justify-between sm:px-2.5 md:w-56 lg:w-72",
        className,
      )}
      aria-label={effectiveAriaLabel}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Search className="text-muted-foreground group-hover:text-foreground size-3.5 shrink-0 transition-colors" />
        <span className="hidden truncate sm:inline">{effectiveTriggerText}</span>
      </div>
      <Kbd className="border-border/80 bg-background/80 text-muted-foreground hidden h-4.5 items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] md:inline-flex">
        <span className="text-xs">⌘</span>K
      </Kbd>
    </Button>
  );
});
