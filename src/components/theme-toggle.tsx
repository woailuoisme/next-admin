"use client";

import { useMemoizedFn } from "ahooks";
import { Moon, Sun } from "lucide-react";
import { memo } from "react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePreferencesStore } from "@/stores/preferences";

export interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = memo(function ThemeToggle({ className }: ThemeToggleProps) {
  const mode = usePreferencesStore((s) => s.mode);
  const setMode = usePreferencesStore((s) => s.setMode);
  const resolvedMode = usePreferencesStore((s) => s.resolvedMode);

  const isDark = resolvedMode === "dark";

  const handleToggle = useMemoizedFn(() => {
    const nextMode = isDark ? "light" : "dark";
    setMode(nextMode);
  });

  const tooltipLabel =
    mode === "auto"
      ? `当前跟随系统 (${isDark ? "深色" : "浅色"}) · 点击切换为${isDark ? "浅色" : "深色"}模式`
      : `切换至${isDark ? "浅色" : "深色"}模式`;

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
          aria-label={tooltipLabel}
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
          <span className="sr-only">切换明暗主题模式</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltipLabel}
      </TooltipContent>
    </Tooltip>
  );
});

export default ThemeToggle;
