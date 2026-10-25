import { useTranslations } from "next-intl";
import { ArrowRight, Plane } from "lucide-react";
import { memo } from "react";

import type { FlightArcItem } from "./types";

interface ArcDetailCardProps {
  arc: FlightArcItem | null;
}

export const ArcDetailCard = memo(function ArcDetailCard({ arc }: ArcDetailCardProps) {
  const t = useTranslations("map");
  if (!arc) return null;

  return (
    <div className="border-border/80 bg-background/95 pointer-events-none absolute top-3 left-3 z-10 min-w-56 rounded-lg border p-3.5 shadow-lg backdrop-blur-md transition-all">
      <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
        <Plane className="text-primary size-3.5" />
        <span>{t("arc_flight_detail")}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-foreground font-semibold">{arc.fromName || t("arc_flight_origin")}</span>
        <ArrowRight className="text-muted-foreground size-3" />
        <span className="text-foreground font-semibold">{arc.toName || t("arc_flight_dest")}</span>
      </div>
      {arc.value !== undefined ? (
        <div className="border-border mt-2 border-t pt-1.5 text-xs">
          <span className="text-muted-foreground">{t("arc_flight_volume")}: </span>
          <span className="text-primary font-semibold">{arc.value}</span>
        </div>
      ) : null}
    </div>
  );
});
