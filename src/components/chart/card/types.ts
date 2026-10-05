import type { ReactNode } from "react";

export interface ChartPeriodOption {
  label: string;
  value: string;
}

export interface ChartCardProps {
  title: ReactNode;
  description?: ReactNode;
  periods?: (string | ChartPeriodOption)[];
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
  actionSlot?: ReactNode;
  legendSlot?: ReactNode;
  footerSlot?: ReactNode;
  height?: number;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
  children?: ReactNode;
  /** Whether to show the fullscreen maximize button */
  showFullscreen?: boolean;
  /** Fullscreen dialog height (defaults to 500) */
  fullscreenHeight?: number;
}
