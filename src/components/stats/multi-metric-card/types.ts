import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { StatCardTheme } from "../shared/types";
import type { StatCardTrendData } from "../stat-card/types";

export interface SubMetricItem {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  trend?: StatCardTrendData;
  color?: string;
}

export interface MultiMetricStatCardProps {
  title: string;
  primaryValue: string | number;
  primaryLabel?: string;
  prefix?: string;
  suffix?: string;
  primaryTrend?: StatCardTrendData;
  metrics?: SubMetricItem[];
  description?: string;
  icon?: LucideIcon;
  theme?: StatCardTheme;
  badge?: ReactNode;
  to?: string;
  onClick?: () => void;
  isLoading?: boolean;

  className?: string;
}
