import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { StatCardTheme } from "../shared/types";
import type { StatCardTrendData } from "../stat-card/types";

/**
 * Pacing status relative to milestone or period quota
 */
export type PacingStatus = "ahead" | "on_track" | "behind";

/**
 * ProgressStatCard component props
 */
export interface ProgressStatCardProps {
  /** Card metric label / title */
  title: string;
  /** Current completed value */
  value: number | string;
  /** Goal or quota target */
  targetValue?: number | string;
  /** Explicit completion percentage (0-100) overrides auto-calculated progress */
  progress?: number;
  /** Prefix string (e.g. "$", "¥") */
  prefix?: string;
  /** Suffix string (e.g. " items", " orders", "%") */
  suffix?: string;
  /** Optional helper or tooltip description */
  description?: string;
  /** Card icon component */
  icon?: LucideIcon;
  /** Color accent theme */
  theme?: StatCardTheme;
  /** Contextual pace label (e.g. "+12% ahead of schedule") */
  pacingLabel?: string;
  /** Status indicator override for pacing badge */
  pacingStatus?: PacingStatus;
  /** Optional comparative trend indicator */
  trend?: StatCardTrendData;
  /** Secondary badge or tag */
  badge?: ReactNode;
  /** Optional link destination for click-through drilldown */
  to?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Loading skeleton state */
  isLoading?: boolean;

  /** Custom container class */
  className?: string;
}
