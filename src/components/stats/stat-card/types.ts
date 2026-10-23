import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { SparklineLayout, StatCardTheme, StatDensity } from "../shared/types";
import type { SparklinePoint, SparklineType } from "../sparkline/types";

/**
 * Trend direction definition
 */
export type TrendDirection = "up" | "down" | "neutral";

/**
 * StatCard trend configuration data shape
 */
export interface StatCardTrendData {
  /** Numeric change value or percentage (e.g. 12.5 or "+12.5%") */
  value: number | string;
  /** Direction of the trend. If omitted, inferred from positive/negative value */
  direction?: TrendDirection;
  /** Context label (e.g. "vs last month", "compared to target") */
  label?: string;
  /** Whether an upward trend is considered positive/favorable (default: true) */
  isPositiveGood?: boolean;
}

/**
 * StatCard component props
 */
export interface StatCardProps {
  /** Card metric label / title */
  title: string;
  /** Main metric value */
  value: number | string | null;
  /** Prefix string or element (e.g. "$", "¥") */
  prefix?: ReactNode;
  /** Suffix string or element (e.g. " items", " orders", "%") */
  suffix?: ReactNode;
  /** Optional helper or tooltip description */
  description?: string;
  /** Card icon component */
  icon?: LucideIcon;
  /** Color accent theme */
  theme?: StatCardTheme;
  /** Comparative trend indicator */
  trend?: StatCardTrendData;
  /** Optional mini sparkline array of numbers or data points */
  sparklineData?: number[] | SparklinePoint[];
  /** Sparkline type (area gradient vs bar) */
  sparklineType?: SparklineType;
  /** Layout position of sparkline ("inline" side-by-side with trend vs "bottom" full width) */
  sparklineLayout?: SparklineLayout;
  /** Card density spacing mode */
  density?: StatDensity;
  /** Secondary badge or tag */
  badge?: ReactNode;
  /** Top-right header actions slot (buttons, dropdowns, etc.) */
  actions?: ReactNode;
  /** Enable click-to-copy for metric value */
  copyable?: boolean;
  /** Alias for copyable following boolean is* naming convention */
  isCopyable?: boolean;
  /** Custom text to copy (defaults to value) */
  copyText?: string;
  /** Enable smooth count-up number tween animation */
  animated?: boolean;
  /** Alias for animated following boolean is* naming convention */
  isAnimated?: boolean;
  /** Custom value formatter */
  formatter?: (value: number | string) => ReactNode;
  /** Optional link destination for click-through drilldown */
  to?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Loading skeleton state */
  isLoading?: boolean;

  /** Custom container class */
  className?: string;
}
