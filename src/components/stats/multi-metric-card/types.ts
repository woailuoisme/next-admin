import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { StatCardTheme, StatDensity } from "../shared/types";
import type { StatCardTrendData } from "../stat-card/types";

export interface SubMetricItem {
  label: string;
  value: string | number | null;
  prefix?: string;
  suffix?: string;
  trend?: StatCardTrendData;
}

export interface MultiMetricStatCardProps {
  title: string;
  primaryValue: string | number | null;
  primaryLabel?: string;
  prefix?: string;
  suffix?: string;
  primaryTrend?: StatCardTrendData;
  metrics?: SubMetricItem[];
  description?: string;
  icon?: LucideIcon;
  theme?: StatCardTheme;
  density?: StatDensity;
  badge?: ReactNode;
  to?: string;
  linkLabel?: string;
  onClick?: () => void;
  isLoading?: boolean;

  className?: string;
}
