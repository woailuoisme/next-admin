"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "cn";

import type { StatCardRootProps } from "./types";

import { useStatsGridContext } from "../grid/StatsGridContext";
import { StatCardContext } from "./StatCardContext";
import { DENSITY_STYLES } from "./types";

const STRETCHED_OVERLAY_CLASS =
  "focus-visible:ring-ring rounded-xl after:absolute after:inset-0 after:z-0 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset";

export function StatCardRoot({
  density,
  sparklineLayout,
  theme = "primary",
  to,
  linkLabel,
  onClick,
  onKeyDown,
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

  return (
    <StatCardContext value={contextValue}>
      <Card
        size={resolvedDensity === "compact" ? "sm" : "default"}
        data-density={resolvedDensity}
        data-sparkline-layout={resolvedSparklineLayout}
        onKeyDown={onKeyDown}
        className={cn(
          "@container relative gap-0 overflow-hidden border-border/60 py-0 transition-all duration-200",
          isInteractive &&
            "group cursor-pointer hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        {...props}
      >
        {to ? (
          <Link href={to} aria-label={linkLabel || undefined} onClick={onClick} className={STRETCHED_OVERLAY_CLASS} />
        ) : onClick ? (
          <button
            type="button"
            aria-label={linkLabel || undefined}
            onClick={onClick}
            className={cn("appearance-none border-0 bg-transparent p-0 text-left", STRETCHED_OVERLAY_CLASS)}
          />
        ) : null}
        <CardContent className={cn("flex h-full flex-col justify-between", dStyles.cardPadding, dStyles.headerGap)}>
          {children}
        </CardContent>
      </Card>
    </StatCardContext>
  );
}
