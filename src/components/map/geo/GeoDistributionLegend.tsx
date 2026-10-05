import { memo } from "react";

import type { LegendStep } from "./useGeoDistribution";

interface GeoDistributionLegendProps {
  legendTitle?: string;
  legendSteps: LegendStep[];
}

export const GeoDistributionLegend = memo(function GeoDistributionLegend({
  legendTitle = "Metric Distribution",
  legendSteps,
}: GeoDistributionLegendProps) {
  if (legendSteps.length === 0) return null;

  return (
    <div className="border-border/80 bg-background/90 absolute bottom-3 left-3 z-10 max-h-[calc(100%-1.5rem)] overflow-y-auto rounded-lg border p-3 shadow-md backdrop-blur-md">
      <h5 className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
        {legendTitle}
      </h5>
      <div className="flex flex-col gap-1.5">
        {legendSteps.map((step) => (
          <div key={step.rangeText} className="flex items-center gap-2 text-xs">
            <span
              className="border-border/60 size-3.5 shrink-0 rounded-sm border shadow-xs"
              style={{ backgroundColor: step.color }}
            />
            <span className="text-muted-foreground font-mono text-[11px]">{step.rangeText}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
