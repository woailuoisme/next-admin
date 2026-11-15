"use client";

import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { memo, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Map, MapControls, useMap } from "@/components/ui/map";
import { cn } from "cn";

import type { BasemapPreset, BasemapStyleKey } from "../presets/basemaps";
import type { Coordinates, MapCardSlotProps, MapCommonProps, MapFeedbackProps } from "../shared/types";

import { MapCard } from "../card/MapCard";
import { resolveBasemapConfig } from "../presets/basemaps";
import { CHINA_MAP_CENTER, MAP_ATTRIBUTION_PROPS } from "../shared/constants";
import { MapAutoResizer } from "../shared/MapAutoResizer";
import { MapEmptyState } from "../shared/MapEmptyState";
import { MapFitBounds } from "../shared/MapFitBounds";
import { MapSkeleton } from "../shared/MapSkeleton";
import { isValidCoordinate } from "../utils/coordinates";

export function useMapBasemapState(
  controlledBasemap: BasemapPreset = "carto",
  onBasemapChange?: (basemap: BasemapPreset) => void,
) {
  const [internalBasemap, setInternalBasemap] = useState<BasemapPreset>(controlledBasemap);
  const [lastPropBasemap, setLastPropBasemap] = useState<BasemapPreset>(controlledBasemap);

  if (controlledBasemap !== lastPropBasemap) {
    setLastPropBasemap(controlledBasemap);
    setInternalBasemap(controlledBasemap);
  }

  const activeBasemap = onBasemapChange ? controlledBasemap : internalBasemap;

  const handleBasemapChange = useMemoizedFn((next: BasemapStyleKey | BasemapPreset) => {
    if (!onBasemapChange) {
      setInternalBasemap(next);
    }
    onBasemapChange?.(next);
  });

  return { activeBasemap, handleBasemapChange };
}

interface MapRuntimeWatcherProps {
  onRuntimeError: (message: string) => void;
}

const MapRuntimeWatcher = memo(function MapRuntimeWatcher({ onRuntimeError }: MapRuntimeWatcherProps) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    const handleError = (event: { error?: { message?: string; status?: number } }) => {
      const msg = event?.error?.message;
      const status = event?.error?.status;
      if (status === 401 || status === 403 || status === 404 || msg) {
        onRuntimeError(msg || `HTTP ${status}`);
      }
    };

    map.on("error", handleError);
    return () => {
      map.off("error", handleError);
    };
  }, [map, onRuntimeError]);

  return null;
});

export interface MapFrameProps extends MapCommonProps, MapFeedbackProps {
  /** 业务默认卡片标题与描述（cardProps 未传入时兜底） */
  defaultCardTitle?: ReactNode;
  defaultCardDescription?: ReactNode;
  cardProps?: MapCardSlotProps;
  /** 默认自动居中中心（当显式 center 未提供或非法时） */
  fallbackCenter?: Coordinates;
  /** 供 MapFitBounds 使用的数据坐标点 */
  fitBoundsPoints?: readonly Coordinates[];
  /** 无障碍区域标签 */
  ariaLabel?: string;
  /** 覆盖在地图画布之上的浮层 UI（搜索条、图例、回放进度栏等） */
  overlaySlot?: ReactNode;
  /** 与主地图并列的侧边面板（如 LocationMarkerSidebar） */
  afterMapSlot?: ReactNode;
  /** 内部渲染在 <Map> 中的矢量/聚合/Marker/Arc 图层 */
  children?: ReactNode;
}

/**
 * MapFrame：收口 5 套业务地图外壳的深模块
 *
 * 统一托管：
 * 1. MapLibre 瓦片/样式运行时错误拦截与退化提示横幅；
 * 2. 单一状态机（Loading -> Error -> Empty -> Ready），彻底避免 MapCard 与内层双重渲染；
 * 3. 受控/非受控底图切换联动；
 * 4. 持久化 WebGL 全屏 Portal（由 MapCard 承载）；
 * 5. AutoResizer、FitBounds、Controls 与合规版权署名。
 */
export const MapFrame = memo(function MapFrame({
  height = 460,
  className,
  basemap = "carto",
  onBasemapChange,
  customStyleUrl,
  blank = false,
  center,
  fallbackCenter = CHINA_MAP_CENTER,
  zoom = 11,
  pitch,
  bearing,
  interactive = true,
  projection,
  autoFitBounds = false,
  fitBoundsPoints,
  isLoading = false,
  isEmpty = false,
  isError = false,
  error,
  errorMessage,
  emptyMessage,
  onRetry,
  cardProps,
  defaultCardTitle,
  defaultCardDescription,
  ariaLabel,
  overlaySlot,
  afterMapSlot,
  children,
}: MapFrameProps) {
  const t = useTranslations("map");
  const { activeBasemap, handleBasemapChange } = useMapBasemapState(basemap, onBasemapChange);

  const [tileWarning, setTileWarning] = useState<string | null>(null);
  const [mapResetEpoch, setMapResetEpoch] = useState(0);

  const basemapConfig = useMemo(
    () => resolveBasemapConfig(activeBasemap, customStyleUrl),
    [activeBasemap, customStyleUrl],
  );

  const safeCenter = useMemo<Coordinates>(() => {
    if (isValidCoordinate(center)) return center;
    if (isValidCoordinate(fallbackCenter)) return fallbackCenter;
    return CHINA_MAP_CENTER;
  }, [center, fallbackCenter]);

  const mapProjection = useMemo(() => (projection ? { type: projection } : undefined), [projection]);

  const handleRuntimeError = useCallback((msg: string) => {
    setTileWarning(msg);
  }, []);

  const handleTileRetry = useCallback(() => {
    setTileWarning(null);
    setMapResetEpoch((n) => n + 1);
    onRetry?.();
  }, [onRetry]);

  const hasFatalError = Boolean(isError || error);
  const errorDetail = error instanceof Error ? error.message : typeof error === "string" ? error : undefined;
  const resolvedErrorMsg = errorMessage || errorDetail || (hasFatalError ? t("error_default") : undefined);

  const standaloneContent = isLoading ? (
    <MapSkeleton height="100%" />
  ) : hasFatalError ? (
    <MapEmptyState
      height="100%"
      type="error"
      message={resolvedErrorMsg}
      actionLabel={onRetry ? t("retry") : undefined}
      onAction={onRetry}
    />
  ) : isEmpty ? (
    <MapEmptyState height="100%" type="no-data" message={emptyMessage} />
  ) : null;

  const mapCanvasBody = (
    <div
      className={cn("relative flex size-full overflow-hidden rounded-xl bg-muted/20", className)}
      role="region"
      aria-label={ariaLabel || (typeof cardProps?.title === "string" ? cardProps.title : t("aria_map_region"))}
    >
      {standaloneContent && !cardProps ? (
        standaloneContent
      ) : (
        <>
          <div className="relative h-full min-w-0 flex-1 overflow-hidden">
            <Map
              key={`map-engine-${mapResetEpoch}`}
              center={safeCenter}
              zoom={zoom}
              pitch={pitch}
              bearing={bearing}
              projection={mapProjection}
              {...MAP_ATTRIBUTION_PROPS}
              styles={basemapConfig.styles}
              blank={blank || basemapConfig.blank}
              interactive={interactive}
              className="size-full"
            >
              <MapAutoResizer />
              <MapRuntimeWatcher onRuntimeError={handleRuntimeError} />
              {autoFitBounds && fitBoundsPoints ? <MapFitBounds points={fitBoundsPoints} enabled={true} /> : null}
              <MapControls position="bottom-right" showZoom showCompass showLocate />
              {children}
            </Map>

            {tileWarning ? (
              <div
                role="status"
                className="border-destructive/30 bg-background/95 text-foreground absolute bottom-3 left-3 z-20 flex max-w-sm items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs shadow-md backdrop-blur-md"
              >
                <AlertTriangle className="text-destructive size-3.5 shrink-0" />
                <span className="line-clamp-1 flex-1">{t("error_tile_timeout")}</span>
                <Button variant="ghost" size="sm" onClick={handleTileRetry} className="h-6 px-1.5 text-[11px]">
                  <RefreshCw className="mr-1 size-3" />
                  {t("retry")}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTileWarning(null)}
                  aria-label={t("dismiss_notice")}
                  className="size-5"
                >
                  <X className="size-3" />
                </Button>
              </div>
            ) : null}

            {overlaySlot}
          </div>

          {afterMapSlot}
        </>
      )}
    </div>
  );

  if (cardProps) {
    return (
      <MapCard
        height={height}
        title={cardProps.title || defaultCardTitle || t("aria_map_region")}
        description={cardProps.description ?? defaultCardDescription}
        fullscreenable={cardProps.fullscreenable}
        showBasemapSelector={cardProps.showBasemapSelector ?? true}
        actionSlot={cardProps.actionSlot}
        legendSlot={cardProps.legendSlot}
        footerSlot={cardProps.footerSlot}
        basemap={activeBasemap}
        onBasemapChange={handleBasemapChange}
        isLoading={isLoading}
        isError={hasFatalError}
        error={error}
        errorMessage={resolvedErrorMsg}
        isEmpty={isEmpty}
        emptyMessage={emptyMessage}
        onRetry={onRetry}
      >
        {mapCanvasBody}
      </MapCard>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      {mapCanvasBody}
    </div>
  );
});
