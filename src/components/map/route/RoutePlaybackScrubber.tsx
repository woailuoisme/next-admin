import { useTranslations } from "next-intl";
import { Pause, Play, RotateCcw } from "lucide-react";
import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

import type { VehicleInfo } from "./types";

interface RoutePlaybackScrubberProps {
  isPlaying: boolean;
  progress: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onSeek: (value: number) => void;
  vehicle?: VehicleInfo;
}

export const RoutePlaybackScrubber = memo(function RoutePlaybackScrubber({
  isPlaying,
  progress,
  onTogglePlay,
  onReset,
  onSeek,
  vehicle,
}: RoutePlaybackScrubberProps) {
  const t = useTranslations("map");

  const playLabel = isPlaying ? t("route_pause") : t("route_play");
  const resetLabel = t("route_reset");

  return (
    /*
			右缘留出 56px：MapControls(bottom-right → bottom-10/right-2，按钮 size-8 即 32px，
			控件左缘距右约 42px) 与 MapLibre 紧凑归因按钮都位于右下角。原先 `inset-x-3` 横跨到
			距右仅 12px，会把缩放控件下半部（罗盘完全被盖）与归因按钮一并遮住。
			这里改为两端独立定位，避免浮层遮挡交互控件。
		*/
    <div className="border-border/80 bg-background/90 absolute right-14 bottom-3 left-3 z-10 flex items-center gap-3 rounded-lg border px-3.5 py-2.5 shadow-lg backdrop-blur-md">
      <Button
        variant="ghost"
        size="icon"
        className="text-primary size-8 shrink-0"
        onClick={onTogglePlay}
        title={playLabel}
        aria-label={playLabel}
      >
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground size-8 shrink-0"
        onClick={onReset}
        title={resetLabel}
        aria-label={resetLabel}
      >
        <RotateCcw className="size-3.5" />
      </Button>

      <div className="flex flex-1 items-center gap-3">
        <Slider
          value={[Math.round(progress * 100)]}
          min={0}
          max={100}
          step={1}
          onValueChange={(val) => onSeek(val[0] / 100)}
          className="w-full cursor-pointer"
          aria-label={t("route_progress_aria")}
        />
        <span className="text-muted-foreground w-10 text-right font-mono text-xs font-semibold">
          {Math.round(progress * 100)}%
        </span>
      </div>

      {vehicle?.speed !== undefined ? (
        <div className="hidden items-center gap-1 sm:flex">
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[11px]">
            {vehicle.speed} km/h
          </Badge>
        </div>
      ) : null}
    </div>
  );
});
