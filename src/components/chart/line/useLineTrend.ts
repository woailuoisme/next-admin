"use client";

import { useTranslations } from "next-intl";

import type { ChartReferenceLine } from "../shared/types";
import type { LineTrendChartProps } from "./types";

import { useChartFormatters } from "../hooks/useChartFormatters";
import { useChartTheme } from "../hooks/useChartTheme";
import {
  DEFAULT_LINE_ACTIVE_DOT_BASE,
  DEFAULT_REFERENCE_DASH,
  DEFAULT_REFERENCE_STROKE,
  DEFAULT_REFERENCE_STROKE_WIDTH,
} from "../shared/constants";
import { CHART_PALETTE } from "../shared/theme";

export function useLineTrend(props: LineTrendChartProps) {
  const t = useTranslations("chart");
  const {
    series,
    dataKey = "value",
    seriesName = t("line_default_series"),
    theme = "primary",
    color,
    referenceValue,
    referenceLabel,
    referenceLines: propReferenceLines,
    valueFormatter: propValueFormatter,
    xAxisFormatter: propXAxisFormatter,
    yAxisFormatter: propYAxisFormatter,
  } = props;

  const { activeStroke } = useChartTheme({
    theme,
    color,
  });

  const { valueFormatter, xAxisFormatter, yAxisFormatter } = useChartFormatters({
    valueFormatter: propValueFormatter,
    xAxisFormatter: propXAxisFormatter,
    yAxisFormatter: propYAxisFormatter,
  });

  const normalizedSeries = series?.length
    ? series.map((s, idx) => {
        const resolvedColor = s.color || CHART_PALETTE[idx % CHART_PALETTE.length];
        return {
          ...s,
          color: resolvedColor,
          strokeWidth: s.strokeWidth ?? 2.5,
          activeDot: {
            ...DEFAULT_LINE_ACTIVE_DOT_BASE,
            stroke: resolvedColor,
          },
        };
      })
    : [
        {
          dataKey,
          name: seriesName,
          color: activeStroke,
          strokeWidth: 2.5,
          activeDot: {
            ...DEFAULT_LINE_ACTIVE_DOT_BASE,
            stroke: activeStroke,
          },
        },
      ];

  let referenceLines: ChartReferenceLine[] | undefined = propReferenceLines;
  if (typeof referenceValue === "number") {
    const primaryLine: ChartReferenceLine = {
      y: referenceValue,
      label: referenceLabel ?? t("line_reference_target", { value: valueFormatter(referenceValue) }),
      stroke: DEFAULT_REFERENCE_STROKE,
      strokeDasharray: DEFAULT_REFERENCE_DASH,
      strokeWidth: DEFAULT_REFERENCE_STROKE_WIDTH,
      position: "insideTopRight",
    };
    referenceLines = propReferenceLines?.length ? [primaryLine, ...propReferenceLines] : [primaryLine];
  }

  return {
    normalizedSeries,
    referenceLines,
    valueFormatter,
    xAxisFormatter,
    yAxisFormatter,
  };
}
