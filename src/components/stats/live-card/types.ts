import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { StatCardTheme } from "../shared/types";
import type { SparklinePoint } from "../sparkline/types";

/**
 * System/Service health status for LiveStatCard
 */
export type LiveStatus = "online" | "warning" | "error" | "offline";

export interface LiveStatusConfigItem {
  dotClass: string;
  pingClass: string;
  badgeClass: string;
  defaultText: string;
}

/**
 * LiveStatCard component props for real-time monitoring
 */
export interface LiveStatCardProps {
  /** Metric label */
  title: string;
  /** Dynamic or static telemetry value */
  value: number | string;
  /** Metric unit prefix */
  prefix?: string;
  /** Metric unit suffix (e.g. " ms", " req/s", " pods") */
  suffix?: string;
  /** Health / connection status */
  status?: LiveStatus;
  /** Custom status badge label (e.g. "Healthy", "Elevated Latency") */
  statusText?: string;
  /** Formatted timestamp or relative age ("10s ago", "Just now") */
  lastUpdated?: string;
  /** Animate ping pulse effect (default: true) */
  pulse?: boolean;
  /** Micro sparkline data points (e.g. recent ping/QPS buffer) */
  sparklineData?: number[] | SparklinePoint[];
  /** Telemetry icon */
  icon?: LucideIcon;
  /** Accent theme */
  theme?: StatCardTheme;
  /** Tooltip or contextual help description */
  description?: string;
  /** Custom badge element */
  badge?: ReactNode;
  /** Optional link destination */
  to?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Loading skeleton state */
  isLoading?: boolean;

  /** Container class */
  className?: string;
}
