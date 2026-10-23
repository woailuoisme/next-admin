import { useTranslations } from "next-intl";
import { Maximize2, Minimize2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface FullscreenToggleProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

/**
 * 弹窗右上角的全屏 / 还原切换按钮，FormDialog 与 ViewDialog 共用
 */
export function FullscreenToggle({ isFullscreen, onToggle }: FullscreenToggleProps) {
  const t = useTranslations("dialog");

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="text-muted-foreground hover:text-foreground absolute top-2.5 right-9 z-10"
      onClick={onToggle}
      title={isFullscreen ? t("fullscreen_exit") : t("fullscreen_enter")}
      aria-label={isFullscreen ? t("fullscreen_exit") : t("fullscreen_enter")}
    >
      {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
    </Button>
  );
}
