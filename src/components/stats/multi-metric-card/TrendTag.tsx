import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

import type { StatCardTrendData } from "../stat-card/types";

import { useTrendInfo } from "../stat-card/useTrendInfo";

interface TrendTagProps {
  trend: StatCardTrendData;
}

export const TrendTag = memo(function TrendTag({ trend }: TrendTagProps) {
  const trendInfo = useTrendInfo(trend);
  if (!trendInfo) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        trendInfo.colorClass,
      )}
    >
      {trendInfo.dir === "up" ? <ArrowUpRight className="h-3 w-3" /> : null}
      {trendInfo.dir === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
      {trendInfo.dir === "neutral" ? <Minus className="h-3 w-3" /> : null}
      <span>{trend.value}</span>
    </Badge>
  );
});
