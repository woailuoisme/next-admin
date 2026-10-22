import { memo } from "react";

import { cn } from "@/lib/utils";

import type { SparklineLayout, StatCardTheme, StatDensity } from "../shared/types";
import type { SparklinePoint, SparklineType } from "../sparkline/types";

import { getStatTheme } from "../shared/theme";
import { MiniSparkline } from "../sparkline/MiniSparkline";
import { useStatCardContext } from "./StatCardContext";
import { DENSITY_STYLES } from "./types";

export interface StatCardSparklineProps {
  data?: readonly (number | SparklinePoint)[];
  type?: SparklineType;
  layout?: SparklineLayout;
  theme?: StatCardTheme;
  density?: StatDensity;
  color?: string;
  height?: number;
  className?: string;
}

export const StatCardSparkline = memo(function StatCardSparkline({
  data,
  type = "area",
  layout,
  theme,
  density,
  color,
  height,
  className,
}: StatCardSparklineProps) {
  const context = useStatCardContext();
  const resolvedLayout = layout ?? context.sparklineLayout ?? "inline";
  const resolvedDensity = density ?? context.density ?? "compact";
  const resolvedTheme = theme ?? context.theme ?? "primary";

  if (!data || data.length < 2) return null;

  const themeConfig = getStatTheme(resolvedTheme);
  const dStyles = DENSITY_STYLES[resolvedDensity];
  const sparkHeight = height ?? dStyles.sparklineHeight;
  const strokeColor = color ?? themeConfig.strokeColor;

  const sparkline = (
    <MiniSparkline
      data={data}
      color={strokeColor}
      type={type}
      height={sparkHeight}
      className={cn("w-full", className)}
    />
  );

  if (resolvedLayout === "bottom") {
    return <div className="w-full pt-1">{sparkline}</div>;
  }

  return <div className="ml-auto w-20 shrink-0">{sparkline}</div>;
});
