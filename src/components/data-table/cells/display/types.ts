import type React from "react";

import type { RowActivationEvent } from "../../core/types";
import type { BaseCellProps } from "../base";
import type { UserOnlineStatus } from "../media/avatar/types";

export interface TextCellProps extends BaseCellProps {
  title?: React.ReactNode;
  value?: React.ReactNode;
  description?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  highlightText?: string;
  tag?: React.ReactNode;
  tagVariant?: "outline" | "secondary" | "primary" | "muted";
  kbd?: string;
  url?: string;
  isExternal?: boolean;
  lineClamp?: 1 | 2 | 3;
  copyable?: boolean | string;
  mono?: boolean;
  truncate?: boolean;
  tooltip?: React.ReactNode;
  size?: "xs" | "sm" | "base";
  weight?: "normal" | "medium" | "semibold" | "bold";
  onClick?: () => void;
}

export type BadgeVariantType = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";

export interface BadgeCellOption {
  label: React.ReactNode;
  variant?: BadgeVariantType;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

export interface BadgeCellProps extends BaseCellProps {
  value?: any;
  label?: any;
  maxCount?: number;
  labelMap?: Record<string, BadgeCellOption | React.ReactNode>;
  variantMap?: Record<string, BadgeVariantType>;
  dot?: boolean;
  pulse?: boolean;
  density?: "default" | "compact";
  icon?: React.ComponentType<{ className?: string }>;
  variant?: BadgeVariantType;
  color?: BadgeVariantType;
  tooltip?: React.ReactNode;
  onBadgeClick?: (value: any, event: RowActivationEvent) => void;
}

export interface IconCellOption {
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  label?: React.ReactNode;
}

export interface IconCellProps extends BaseCellProps {
  value?: any;
  icon?: React.ComponentType<{ className?: string }>;
  iconMap?: Record<string, IconCellOption | React.ComponentType<{ className?: string }>>;
  colorMap?: Record<string, string>;
  size?: "sm" | "md" | "lg";
  label?: React.ReactNode;
  labelPosition?: "right" | "bottom";
  container?: "none" | "badge" | "circle";
  tooltip?: React.ReactNode;
}

export interface DateCellProps extends BaseCellProps {
  value?: Date | string | number | null;
  format?: string;
  relative?: boolean;
  dualLine?: boolean;
  primaryFormat?: "relative" | "absolute";
  showTooltip?: boolean;
  showIcon?: boolean;
  overdueAlert?: boolean;
  countdown?: boolean;
  countdownPrefix?: string;
  timezone?: string;
}

export type MaskType = "phone" | "email" | "apiKey" | "idCard" | "creditCard" | "jwt" | "custom";

export interface MaskedCellProps extends BaseCellProps {
  value?: string | null;
  maskType?: MaskType;
  customMask?: (val: string) => string;
  allowReveal?: boolean;
  autoHideDuration?: number;
  copyable?: boolean;
  allowCopy?: boolean;
  maskChar?: string;
  mono?: boolean;
}

export interface NumberCellProps extends BaseCellProps {
  value?: number | null;
  mode?: "number" | "currency" | "percent";
  currency?: string;
  currencyCode?: string;
  precision?: number;
  decimals?: number;
  locale?: string;
  compact?: boolean;
  accounting?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  trend?: boolean;
  colorize?: boolean;
  delta?: number | string;
  deltaType?: "increase" | "decrease" | "neutral" | "auto";
  deltaDescription?: React.ReactNode;
  deltaPrefix?: string;
}

export interface CurrencyCellProps extends Omit<NumberCellProps, "mode"> {}

export interface ProgressSegment {
  value: number;
  color?: string;
  label?: string;
  className?: string;
}

export interface ProgressCellProps extends BaseCellProps {
  value?: number | null;
  max?: number;
  showLabel?: boolean;
  showPercentage?: boolean;
  showValue?: boolean;
  size?: "sm" | "md";
  colorByValue?: boolean;
  segments?: ProgressSegment[];
  target?: number;
  targetLabel?: string;
}

export interface ColorCellProps extends BaseCellProps {
  value?: string | null;
  color?: string | null;
  copyable?: boolean;
  showHex?: boolean;
  shape?: "circle" | "rounded" | "square";
  checkerboard?: boolean;
}

export interface UserCellProps extends BaseCellProps {
  name?: React.ReactNode;
  subtitle?: React.ReactNode;
  avatarSrc?: string;
  avatarUrl?: string;
  avatarFallback?: string;
  fallback?: string;
  nameField?: string;
  subtitleField?: string;
  avatarField?: string;
  statusField?: string;
  verifiedField?: string;
  shape?: "circle" | "rounded";
  size?: "xs" | "sm" | "md" | "lg";
  status?: UserOnlineStatus;
  autoColor?: boolean;
  verified?: boolean;
  copyableSubtitle?: boolean;
  allowUnassigned?: boolean;
  unassignedText?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
}

export interface RatingCellProps extends BaseCellProps {
  value: number;
  max?: number;
  allowHalf?: boolean;
  showScore?: boolean;
  reviewCount?: number | string;
  precision?: number;
  size?: "xs" | "sm" | "md";
  iconType?: "star" | "heart" | "flame" | "thumb";
  activeColor?: string;
  color?: string;
}

export interface SparklineCellProps extends BaseCellProps {
  data: number[];
  variant?: "line" | "bar";
  width?: number;
  height?: number;
  strokeWidth?: number;
  barWidth?: number;
  barGap?: number;
  color?: string;
  showFill?: boolean;
  fillGradient?: boolean;
  autoTrendColor?: boolean;
  showEndpoint?: boolean;
  showDot?: boolean;
  showMinMax?: boolean;
  interactive?: boolean;
  tooltip?: React.ReactNode;
}
