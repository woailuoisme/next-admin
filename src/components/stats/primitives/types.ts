import type { LucideIcon } from "lucide-react";
import type { NumberFormatOptions } from "next-intl";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type { SparklineLayout, StatCardTheme, StatDensity } from "../shared/types";
import type { StatCardTrendData } from "../stat-card/types";

export const DENSITY_STYLES: Record<
  StatDensity,
  {
    cardPadding: string;
    headerGap: string;
    titleText: string;
    valueText: string;
    prefixText: string;
    suffixText: string;
    iconContainer: string;
    iconSize: string;
    trendSpacing: string;
    sparklineHeight: number;
  }
> = {
  compact: {
    cardPadding: "p-3.5",
    headerGap: "space-y-1.5",
    titleText: "text-xs font-medium leading-none",
    valueText: "text-xl font-bold font-mono tracking-tight leading-none",
    prefixText: "text-sm",
    suffixText: "text-xs",
    iconContainer: "p-1 rounded-md",
    iconSize: "h-3.5 w-3.5",
    trendSpacing: "pt-0.5",
    sparklineHeight: 18,
  },
  default: {
    cardPadding: "p-5",
    headerGap: "space-y-3",
    titleText: "text-sm font-medium",
    valueText: "text-2xl font-bold font-mono tracking-tight",
    prefixText: "text-lg font-semibold",
    suffixText: "text-sm font-medium",
    iconContainer: "p-2 rounded-lg",
    iconSize: "h-4 w-4",
    trendSpacing: "pt-1",
    sparklineHeight: 32,
  },
  comfortable: {
    cardPadding: "p-6",
    headerGap: "space-y-4",
    titleText: "text-base font-medium",
    valueText: "text-3xl font-bold font-mono tracking-tight",
    prefixText: "text-xl font-semibold",
    suffixText: "text-base font-medium",
    iconContainer: "p-2.5 rounded-xl",
    iconSize: "h-5 w-5",
    trendSpacing: "pt-2",
    sparklineHeight: 40,
  },
};

export interface StatCardRootProps extends ComponentPropsWithoutRef<"div"> {
  density?: StatDensity;
  sparklineLayout?: SparklineLayout;
  theme?: StatCardTheme;
  to?: string;
  linkLabel?: string;
  onClick?: () => void;

  children: ReactNode;
}

export interface StatCardHelpTooltipProps {
  description: string;
  className?: string;
}

export interface StatCardIconProps extends ComponentPropsWithoutRef<"div"> {
  icon?: LucideIcon;
  theme?: StatCardTheme;
  density?: StatDensity;
  isInteractive?: boolean;
}

export interface StatCardValueProps extends Omit<ComponentPropsWithoutRef<"div">, "prefix"> {
  value?: number | string | null;
  prefix?: ReactNode;
  suffix?: ReactNode;
  formatter?: (value: number | string) => ReactNode;
  formatOptions?: NumberFormatOptions;
  copyable?: boolean;
  copyText?: string;
  animated?: boolean;
  density?: StatDensity;

  children?: ReactNode;
}

export interface StatCardTrendProps extends ComponentPropsWithoutRef<"div"> {
  trend?: StatCardTrendData | null;
  value?: number | string;
  direction?: "up" | "down" | "neutral";
  tone?: "positive" | "negative" | "neutral";
  label?: string;
  isPositiveGood?: boolean;
  variant?: "badge" | "inline";
  showLabel?: boolean;
}
