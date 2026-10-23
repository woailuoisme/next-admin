"use client";

import { useTranslations } from "next-intl";

import { useMemoizedFn } from "ahooks";
import { Moon, Sun } from "lucide-react";
import { memo } from "react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePreferencesStore } from "@/stores/preferences";

export interface ThemeToggleProps {
  className?: string;

  tooltip?: string;
  ariaLabel?: string;
}

export const ThemeToggle = memo(function ThemeToggle({ className, tooltip, ariaLabel }: ThemeToggleProps) {
  const t = useTranslations("shared");
  const mode = usePreferencesStore((s) => s.mode);
  const setMode = usePreferencesStore((s) => s.setMode);
  const resolvedMode = usePreferencesStore((s) => s.resolvedMode);

  const isDark = resolvedMode === "dark";

  const handleToggle = useMemoizedFn(() => {
    const nextMode = isDark ? "light" : "dark";
    setMode(nextMode);
  });

  const currentModeText = isDark ? t("theme_mode_dark") : t("theme_mode_light");
  const nextModeText = isDark ? t("theme_mode_light") : t("theme_mode_dark");

  const defaultTooltipLabel =
    mode === "auto"
      ? t("theme_toggle_tooltip_system", { mode: currentModeText, nextMode: nextModeText })
      : t("theme_toggle_tooltip_direct", { nextMode: nextModeText });

  const tooltipLabel = tooltip ?? defaultTooltipLabel;
  const effectiveAriaLabel = ariaLabel ?? tooltipLabel;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className={cn(
            "relative h-8 w-8 cursor-pointer overflow-hidden rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground",
            className,
          )}
          aria-label={effectiveAriaLabel}
        >
          <Sun
            className={cn(
              "h-4 w-4 transition-all duration-300",
              isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
            )}
          />
          <Moon
            className={cn(
              "absolute h-4 w-4 transition-all duration-300",
              isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0",
            )}
          />
          <span className="sr-only">{effectiveAriaLabel}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltipLabel}
      </TooltipContent>
    </Tooltip>
  );
});

export default ThemeToggle;
