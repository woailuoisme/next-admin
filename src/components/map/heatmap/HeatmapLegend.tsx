import { useTranslations } from "next-intl";
import { Flame } from "lucide-react";
import { memo } from "react";

interface HeatmapLegendProps {
  title?: string;
  pointCount: number;
  legendGradient: string;
}

export const HeatmapLegend = memo(function HeatmapLegend({ title, pointCount, legendGradient }: HeatmapLegendProps) {
  const t = useTranslations("map");
  const resolvedTitle = title ?? t("heatmap_density");

  return (
    <div className="border-border/70 bg-background/90 absolute bottom-6 left-4 z-10 flex min-w-[200px] flex-col gap-1.5 rounded-lg border p-2.5 shadow-md backdrop-blur-md">
      <div className="text-foreground flex items-center justify-between gap-2 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <Flame className="text-primary size-3.5" />
          <span>{resolvedTitle}</span>
        </div>
        <span className="text-muted-foreground text-[10px] font-normal">
          {t("heatmap_points_count", { count: pointCount })}
        </span>
      </div>

      {/* Gradient Color Bar */}
      <div
        className="border-border/50 h-2.5 w-full rounded-full border shadow-inner"
        style={{ background: legendGradient }}
      />

      <div className="text-muted-foreground flex justify-between text-[10px] font-medium">
        <span>{t("heatmap_low")}</span>
        <span>{t("heatmap_medium")}</span>
        <span>{t("heatmap_high")}</span>
      </div>
    </div>
  );
});
