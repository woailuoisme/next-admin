import { Flame } from "lucide-react";
import { memo } from "react";

interface HeatmapLegendProps {
  title?: string;
  pointCount: number;
  legendGradient: string;
}

export const HeatmapLegend = memo(function HeatmapLegend({
  title = "热力密度 (KDE)",
  pointCount,
  legendGradient,
}: HeatmapLegendProps) {
  return (
    <div className="border-border/70 bg-background/90 absolute bottom-6 left-4 z-10 flex min-w-[200px] flex-col gap-1.5 rounded-lg border p-2.5 shadow-md backdrop-blur-md">
      <div className="text-foreground flex items-center justify-between gap-2 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <Flame className="text-primary size-3.5" />
          <span>{title}</span>
        </div>
        <span className="text-muted-foreground text-[10px] font-normal">{pointCount} 点</span>
      </div>

      {/* Gradient Color Bar */}
      <div
        className="border-border/50 h-2.5 w-full rounded-full border shadow-inner"
        style={{ background: legendGradient }}
      />

      <div className="text-muted-foreground flex justify-between text-[10px] font-medium">
        <span>低密度 (Low)</span>
        <span>中 (Med)</span>
        <span>高密度 (High)</span>
      </div>
    </div>
  );
});
