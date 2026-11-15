"use client";

import { useFormatter } from "next-intl";
import { memo } from "react";

export interface HoveredRegionInfo {
  name: string;
  value?: number;
  properties: Record<string, unknown>;
}

interface GeoDistributionHoverCardProps {
  info: HoveredRegionInfo | null;
  unit?: string;
}

export const GeoDistributionHoverCard = memo(function GeoDistributionHoverCard({
  info,
  unit = "",
}: GeoDistributionHoverCardProps) {
  const formatter = useFormatter();
  if (!info) return null;

  return (
    <div className="border-border/80 bg-background/95 pointer-events-none absolute top-3 right-3 z-10 min-w-44 rounded-lg border p-3 shadow-lg backdrop-blur-md transition-all">
      <p className="text-foreground text-xs font-semibold">{info.name}</p>
      {info.value !== undefined && Number.isFinite(info.value) ? (
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-primary font-mono text-lg font-bold">
            {formatter.number(info.value, { maximumFractionDigits: 3 })}
          </span>
          {unit ? <span className="text-muted-foreground text-xs">{unit}</span> : null}
        </div>
      ) : null}
    </div>
  );
});
