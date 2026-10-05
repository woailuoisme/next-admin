import Link from "next/link";
import { memo, useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { StatCardRootProps } from "./types";

import { useStatsGridContext } from "../grid/StatsGridContext";
import { StatCardContext } from "./StatCardContext";
import { DENSITY_STYLES } from "./types";

export const StatCardRoot = memo(function StatCardRoot({
  density,
  sparklineLayout,
  theme = "primary",
  to,
  onClick,
  className,
  children,
  ...props
}: StatCardRootProps) {
  const gridContext = useStatsGridContext();
  const resolvedDensity = density ?? gridContext.density ?? "compact";
  const resolvedSparklineLayout = sparklineLayout ?? gridContext.sparklineLayout ?? "inline";
  const isInteractive = Boolean(to || onClick);
  const dStyles = DENSITY_STYLES[resolvedDensity] ?? DENSITY_STYLES.compact;

  const contextValue = useMemo(
    () => ({
      density: resolvedDensity,
      sparklineLayout: resolvedSparklineLayout,
      theme,
      isInteractive,
    }),
    [resolvedDensity, resolvedSparklineLayout, theme, isInteractive],
  );

  const content = (
    <Card
      size={resolvedDensity === "compact" ? "sm" : "default"}
      data-density={resolvedDensity}
      data-sparkline-layout={resolvedSparklineLayout}
      className={cn(
        "relative gap-0 overflow-hidden border-border/60 py-0 transition-all duration-200",
        isInteractive &&
          "group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      <CardContent
        className={cn(
          "flex h-full flex-col justify-between",
          dStyles.cardPadding,
          dStyles.headerGap,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );

  return (
    <StatCardContext value={contextValue}>
      {to ? (
        <Link href={to} className="block no-underline">
          {content}
        </Link>
      ) : (
        content
      )}
    </StatCardContext>
  );
});
