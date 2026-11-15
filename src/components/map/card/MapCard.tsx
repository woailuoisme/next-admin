"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useMemoizedFn } from "ahooks";
import { Maximize2 } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "cn";

import type { MapCardProps } from "./types";

import { MapEmptyState } from "../shared/MapEmptyState";
import { MapSkeleton } from "../shared/MapSkeleton";
import { MapBasemapDropdown } from "./MapBasemapDropdown";

const MapFullscreenDialog = dynamic(() => import("./MapFullscreenDialog").then((mod) => mod.MapFullscreenDialog), {
  ssr: false,
});

export const MapCard = memo(function MapCard({
  title,
  description,
  actionSlot,
  legendSlot,
  footerSlot,
  basemap = "carto",
  onBasemapChange,
  showBasemapSelector = true,
  showFullscreen = true,
  fullscreenable,
  height = 450,
  fullscreenHeight = "calc(90vh - 80px)",
  isLoading = false,
  loadingMessage,
  isEmpty = false,
  emptyMessage,
  isError = false,
  error,
  errorMessage,
  onRetry,
  className,
  children,
}: MapCardProps) {
  const t = useTranslations("map");
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * 单一持久化 WebGL 宿主节点：进入/退出全屏仅将该 DOM 节点在卡片槽位与 Dialog 槽位间移动，
   * 绝不卸载重挂载 <Map> 实例，彻底保全 WebGL 上下文、相机视角与叠加图层。
   */
  const [hostEl] = useState<HTMLDivElement | null>(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("div");
    el.className = "size-full";
    return el;
  });

  useEffect(() => {
    return () => {
      hostEl?.remove();
    };
  }, [hostEl]);

  const attachCardSlot = useCallback(
    (slot: HTMLDivElement | null) => {
      if (slot && hostEl && !isFullscreen && hostEl.parentNode !== slot) {
        slot.appendChild(hostEl);
      }
    },
    [hostEl, isFullscreen],
  );

  const attachDialogSlot = useCallback(
    (slot: HTMLDivElement | null) => {
      if (slot && hostEl && isFullscreen && hostEl.parentNode !== slot) {
        slot.appendChild(hostEl);
      }
    },
    [hostEl, isFullscreen],
  );

  const openFullscreen = useMemoizedFn(() => setIsFullscreen(true));
  const canFullscreen = fullscreenable ?? showFullscreen;
  const hasError = Boolean(isError || error);
  const errorDetail = error instanceof Error ? error.message : typeof error === "string" ? error : undefined;
  const resolvedErrorMsg = errorMessage || errorDetail || (hasError ? t("error_default") : undefined);
  const shouldRenderMap = !isLoading && !hasError && !isEmpty;

  return (
    <>
      <Card className={cn("flex flex-col overflow-hidden border-border/60 shadow-xs", className)}>
        <CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
            {description ? (
              <CardDescription className="text-muted-foreground text-xs">{description}</CardDescription>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {legendSlot}

            {showBasemapSelector && onBasemapChange ? (
              <MapBasemapDropdown basemap={basemap} onBasemapChange={onBasemapChange} />
            ) : null}

            {actionSlot}

            {canFullscreen ? (
              <Button
                variant="outline"
                size="icon"
                onClick={openFullscreen}
                disabled={isLoading || isEmpty || hasError}
                className="text-muted-foreground hover:text-foreground size-8"
                title={t("fullscreen_title")}
                aria-label={t("fullscreen_title")}
              >
                <Maximize2 className="size-3.5" />
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="min-w-0 flex-1 pt-2 pb-5">
          {isLoading ? (
            <MapSkeleton height={height} message={loadingMessage} />
          ) : hasError ? (
            <MapEmptyState
              height={height}
              type="error"
              message={resolvedErrorMsg}
              actionLabel={onRetry ? t("retry") : undefined}
              onAction={onRetry}
            />
          ) : isEmpty ? (
            <MapEmptyState height={height} type="no-data" message={emptyMessage} />
          ) : (
            <div className="border-border/40 relative w-full overflow-hidden rounded-lg border" style={{ height }}>
              {isFullscreen ? (
                <div className="bg-muted/20 text-muted-foreground flex size-full items-center justify-center text-xs">
                  {t("fullscreen_active")}
                </div>
              ) : (
                <div ref={attachCardSlot} className="size-full" />
              )}
            </div>
          )}

          {footerSlot ? <div className="border-border/40 mt-2 border-t pt-4">{footerSlot}</div> : null}
        </CardContent>
      </Card>

      {shouldRenderMap && hostEl ? createPortal(children, hostEl) : null}

      {canFullscreen && isFullscreen ? (
        <MapFullscreenDialog
          open={isFullscreen}
          onOpenChange={setIsFullscreen}
          title={title}
          description={description}
          fullscreenHeight={fullscreenHeight}
          onHostMount={attachDialogSlot}
        />
      ) : null}
    </>
  );
});
