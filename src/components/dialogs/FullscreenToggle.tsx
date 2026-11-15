"use client";

import { useTranslations } from "next-intl";
import { Maximize2, Minimize2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "cn";

export interface FullscreenToggleProps {
  isFullscreen: boolean;
  onToggle: () => void;
  variant?: "dialog" | "sheet";
}

/**
 * 弹窗右上角的全屏 / 还原切换按钮，FormDialog 与 ViewDialog 共用
 */
export function FullscreenToggle({ isFullscreen, onToggle, variant = "dialog" }: FullscreenToggleProps) {
  const t = useTranslations("dialog");

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(
        "text-muted-foreground hover:text-foreground absolute z-10",
        variant === "sheet" ? "top-3 right-10" : "top-2 right-9",
      )}
      onClick={onToggle}
      title={isFullscreen ? t("fullscreen_exit") : t("fullscreen_enter")}
      aria-label={isFullscreen ? t("fullscreen_exit") : t("fullscreen_enter")}
    >
      {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
    </Button>
  );
}
