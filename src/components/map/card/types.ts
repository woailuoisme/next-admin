import type { ReactNode } from "react";

import type { BasemapPreset } from "../presets/basemaps";
import type { MapFeedbackProps } from "../shared/types";

export interface MapCardProps extends MapFeedbackProps {
  title: ReactNode;
  description?: ReactNode;
  actionSlot?: ReactNode;
  legendSlot?: ReactNode;
  footerSlot?: ReactNode;

  /** Active basemap preset */
  basemap?: BasemapPreset;
  /** Callback when user changes basemap via dropdown */
  onBasemapChange?: (basemap: BasemapPreset) => void;
  /** Whether to display basemap selector dropdown in header (default: true) */
  showBasemapSelector?: boolean;

  /** Fullscreen dialog toggle */
  showFullscreen?: boolean;
  fullscreenHeight?: number | string;

  /** Map area height (default: 450) */
  height?: number | string;

  /** Loading status message */
  loadingMessage?: string;

  /** Fullscreen toggle alias, overrides `showFullscreen` */
  fullscreenable?: boolean;

  className?: string;
  children: ReactNode;
}
