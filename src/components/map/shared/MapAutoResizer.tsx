import { memo, useEffect } from "react";

import { useMap } from "@/components/ui/map";

export interface MapAutoResizerProps {
  /** Debounce delay in ms before triggering map.resize (default: 50) */
  debounceMs?: number;
}

/**
 * Headless controller inside a <Map> component that automatically monitors
 * container size changes (Sidebar collapse, Tabs switch, ResizablePanels, Dialog open)
 * and invokes map.resize() to prevent canvas distortion and tile white-screen.
 */
export const MapAutoResizer = memo(function MapAutoResizer({ debounceMs = 50 }: MapAutoResizerProps) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (map && typeof map.resize === "function") {
          map.resize();
        }
      }, debounceMs);
    };

    // 1. Observe container element resize
    let observer: ResizeObserver | null = null;
    const container = map.getContainer?.();
    if (container && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        handleResize();
      });
      observer.observe(container);
    }

    // 2. Window resize fallback
    window.addEventListener("resize", handleResize);

    // 3. Tab visibility restoration
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleResize();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 4. Initial sync after load
    if (isLoaded) {
      handleResize();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (observer && container) {
        observer.unobserve(container);
        observer.disconnect();
      }
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [map, isLoaded, debounceMs]);

  return null;
});
