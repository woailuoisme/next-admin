import { AlertCircle, Maximize2, RefreshCw } from "lucide-react";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { MapCardProps } from "./types";

import { MapEmptyState } from "../shared/MapEmptyState";
import { MapSkeleton } from "../shared/MapSkeleton";
import { MapBasemapDropdown } from "./MapBasemapDropdown";
import { MapFullscreenDialog } from "./MapFullscreenDialog";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canFullscreen = fullscreenable !== undefined ? fullscreenable : showFullscreen;
  const resolvedErrorMsg =
    errorMessage || error?.message || (isError ? "Failed to load map data" : undefined);

  return (
    <>
      <Card className={cn("flex flex-col overflow-hidden border-border/60 shadow-xs", className)}>
        <CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
            {description ? (
              <CardDescription className="text-muted-foreground text-xs">
                {description}
              </CardDescription>
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
                onClick={() => setIsFullscreen(true)}
                disabled={isLoading || isEmpty}
                className="text-muted-foreground hover:text-foreground size-8"
                title="全屏聚焦查看"
                aria-label="全屏聚焦查看"
              >
                <Maximize2 className="size-3.5" />
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="min-w-0 flex-1 pt-2 pb-5">
          {isLoading ? (
            <MapSkeleton height={height} message={loadingMessage} />
          ) : resolvedErrorMsg ? (
            <div
              className="border-destructive/20 bg-destructive/5 flex w-full flex-col items-center justify-center space-y-3 rounded-lg border p-6 text-center"
              style={{ height }}
            >
              <div className="bg-destructive/10 text-destructive rounded-full p-2.5">
                <AlertCircle className="size-5" />
              </div>
              <p className="text-destructive text-sm font-medium">{resolvedErrorMsg}</p>
              {onRetry ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="h-8 gap-1.5 text-xs"
                >
                  <RefreshCw className="size-3.5" />
                  重试加载
                </Button>
              ) : null}
            </div>
          ) : isEmpty ? (
            <MapEmptyState height={height} description={emptyMessage} />
          ) : (
            <div
              className="border-border/40 relative w-full overflow-hidden rounded-lg border"
              style={{ height }}
            >
              {isFullscreen ? (
                <div className="bg-muted/20 text-muted-foreground flex size-full items-center justify-center text-xs">
                  全屏聚焦视图已激活
                </div>
              ) : (
                children
              )}
            </div>
          )}

          {footerSlot ? (
            <div className="border-border/40 mt-2 border-t pt-4">{footerSlot}</div>
          ) : null}
        </CardContent>
      </Card>

      <MapFullscreenDialog
        open={isFullscreen}
        onOpenChange={setIsFullscreen}
        title={title}
        description={description}
        fullscreenHeight={fullscreenHeight}
      >
        {children}
      </MapFullscreenDialog>
    </>
  );
});
