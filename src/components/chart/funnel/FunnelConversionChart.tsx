"use client";

import { useTranslations } from "next-intl";

import { memo, useCallback } from "react";
import { Funnel, FunnelChart, LabelList, Tooltip } from "recharts";

import type { FunnelConversionChartProps } from "./types";

import { useChartHeight } from "../shared/ChartContext";
import { ChartFrame } from "../shared/ChartFrame";
import { type ChartTooltipEntry, type ChartTooltipRow, useChartDetailTooltip } from "../shared/ChartTooltip";
import { DEFAULT_ANIMATION_DURATION } from "../shared/constants";
import { useFunnelConversion } from "./useFunnelConversion";

const FUNNEL_CHART_MARGIN = { top: 10, right: 30, left: 30, bottom: 10 } as const;
const FUNNEL_TOOLTIP_CURSOR = { fill: "transparent" } as const;
const formatFunnelRate = (val: unknown) => `${val}%`;

interface FunnelTooltipItem {
  name: string;
  value: number;
  fill: string;
  conversionRate: number;
  dropoffRate: number;
}

export const FunnelConversionChart = memo(function FunnelConversionChart(props: FunnelConversionChartProps) {
  const {
    dataKey = "value",
    nameKey = "name",
    height,
    showTooltip = true,
    showLabels = true,
    showRates = true,
    isAnimationActive = true,
    className,
  } = props;

  const t = useTranslations("chart");
  const resolvedHeight = useChartHeight(height, 320);
  const { processedData, valueFormatter } = useFunnelConversion(props);

  const resolveTooltipDetail = useCallback(
    (payload: ReadonlyArray<ChartTooltipEntry>) => {
      const item = payload[0]?.payload as FunnelTooltipItem | undefined;
      if (!item) return null;

      const rows: ChartTooltipRow[] = [
        { label: t("funnel_value"), value: valueFormatter(item.value), valueClassName: "font-medium" },
        {
          label: t("funnel_retention"),
          value: `${item.conversionRate}%`,
          valueClassName: "text-primary font-semibold",
        },
      ];
      if (item.dropoffRate > 0) {
        rows.push({
          label: t("funnel_dropoff"),
          value: `-${item.dropoffRate}%`,
          valueClassName: "text-destructive font-medium",
        });
      }

      return {
        title: item.name,
        color: item.fill,
        rows,
      };
    },
    [t, valueFormatter],
  );

  const renderTooltip = useChartDetailTooltip(resolveTooltipDetail);

  return (
    <ChartFrame height={resolvedHeight} className={className}>
      <FunnelChart margin={FUNNEL_CHART_MARGIN}>
        {showTooltip && <Tooltip content={renderTooltip} cursor={FUNNEL_TOOLTIP_CURSOR} />}

        <Funnel
          dataKey={dataKey}
          nameKey={nameKey}
          data={processedData}
          isAnimationActive={isAnimationActive}
          animationDuration={DEFAULT_ANIMATION_DURATION}
        >
          {showLabels && (
            <LabelList
              position="right"
              fill="var(--foreground)"
              stroke="none"
              dataKey={nameKey}
              className="text-xs font-medium"
            />
          )}
          {showRates && (
            <LabelList
              position="left"
              fill="var(--muted-foreground)"
              stroke="none"
              dataKey="conversionRate"
              formatter={formatFunnelRate}
              className="font-mono text-[11px]"
            />
          )}
        </Funnel>
      </FunnelChart>
    </ChartFrame>
  );
});
