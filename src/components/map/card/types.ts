import type { ReactNode } from "react";

import type { BasemapStyleKey } from "../presets/basemaps";

export interface MapCardProps {
  title: ReactNode;
  description?: ReactNode;
  actionSlot?: ReactNode;
  legendSlot?: ReactNode;
  footerSlot?: ReactNode;

  /** Active basemap style key */
  basemap?: BasemapStyleKey;
  /** Callback when user changes basemap via dropdown */
  onBasemapChange?: (basemap: BasemapStyleKey) => void;
  /** Whether to display basemap selector dropdown in header (default: true) */
  showBasemapSelector?: boolean;

  /** Fullscreen dialog toggle */
  showFullscreen?: boolean;
  fullscreenHeight?: number | string;

  /** Map area height (default: 450) */
  height?: number | string;

  /** Loading state */
  isLoading?: boolean;
  loadingMessage?: string;

  /** Empty state */
  isEmpty?: boolean;
  emptyMessage?: string;

  /** Error state and retry callback */
  isError?: boolean;
  error?: Error | null;
  errorMessage?: string;
  onRetry?: () => void;

  /** Fullscreen toggle alias, overrides `showFullscreen` */
  fullscreenable?: boolean;

  className?: string;
  children: ReactNode;
}
