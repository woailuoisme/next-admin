import { useTranslations } from "next-intl";
import { AlertCircle, Maximize2, RefreshCw } from "lucide-react";
import { memo, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import type { ChartCardProps, ChartPeriodOption } from "./types";

import { ChartEmptyState } from "../shared/ChartEmptyState";
import { ChartSkeleton } from "../shared/ChartSkeleton";
import type { MessageKeyOf } from "@/types/i18n";

const EMPTY_PERIODS: ChartPeriodOption[] = [];

const PERIOD_KEY_MAP: Record<string, MessageKeyOf<"chart">> = {
  "7D": "period_7d",
  "30D": "period_30d",
  "90D": "period_90d",
  "1Y": "period_1y",
  "12M": "period_year",
  day: "period_day",
  week: "period_week",
  month: "period_month",
  year: "period_year",
  all: "period_all",
};

export const ChartCard = memo(function ChartCard({
  title,
  description,
  periods,
  activePeriod,
  onPeriodChange,
  actionSlot,
  legendSlot,
  footerSlot,
  height = 300,
  isLoading = false,
  isEmpty = false,
  emptyMessage,
  errorMessage,
  onRetry,
  className,
  children,
  showFullscreen = false,
  fullscreenHeight = 500,
}: ChartCardProps) {
  const t = useTranslations("chart");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Normalize periods to ChartPeriodOption[]
  const normalizedPeriods = useMemo<ChartPeriodOption[]>(() => {
    if (!periods?.length) return EMPTY_PERIODS;
    return periods.map((p) => {
      if (typeof p === "string") {
        const i18nKey = PERIOD_KEY_MAP[p];
        return { label: i18nKey ? t(i18nKey) : p, value: p };
      }
      return p;
    });
  }, [periods, t]);

  const currentPeriod = activePeriod ?? normalizedPeriods[0]?.value;

  return (
    <>
      <Card className={cn("flex flex-col overflow-hidden border-border/60 shadow-xs", className)}>
        <CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
            {description && <CardDescription className="text-muted-foreground text-xs">{description}</CardDescription>}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {legendSlot}

            {normalizedPeriods.length > 0 && (
              <Tabs value={currentPeriod} onValueChange={onPeriodChange} className="h-8">
                <TabsList className="bg-muted/60 h-8 p-0.5">
                  {normalizedPeriods.map((opt) => (
                    <TabsTrigger
                      key={opt.value}
                      value={opt.value}
                      className="data-[state=active]:bg-background h-7 px-2.5 text-xs data-[state=active]:shadow-2xs"
                    >
                      {opt.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}

            {actionSlot}

            {showFullscreen && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFullscreen(true)}
                disabled={isLoading || isEmpty}
                className="text-muted-foreground hover:text-foreground size-8"
                title={t("fullscreen_title")}
                aria-label={t("fullscreen_title")}
              >
                <Maximize2 className="size-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="min-w-0 flex-1 pt-2 pb-5">
          {isLoading ? (
            <ChartSkeleton height={height} />
          ) : errorMessage ? (
            <div
              className="flex w-full flex-col items-center justify-center space-y-3 p-6 text-center"
              style={{ height }}
            >
              <div className="bg-destructive/10 text-destructive rounded-full p-2.5">
                <AlertCircle className="size-5" />
              </div>
              <p className="text-destructive text-sm font-medium">{errorMessage}</p>
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry} className="h-8 gap-1.5 text-xs">
                  <RefreshCw className="size-3.5" />
                  {t("retry")}
                </Button>
              )}
            </div>
          ) : isEmpty ? (
            <ChartEmptyState message={emptyMessage} height={height} />
          ) : (
            <div className="w-full min-w-0" style={{ height }}>
              {children}
            </div>
          )}

          {footerSlot && <div className="border-border/40 mt-2 border-t pt-4">{footerSlot}</div>}
        </CardContent>
      </Card>

      {/* Fullscreen Focus Dialog */}
      {showFullscreen && (
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          {/* 补 `sm:max-w-5xl`：DialogContent 基础含 `sm:max-w-sm`，裸 `max-w-5xl` 不在同一
				    合并组内会被它击败 → ≥640px 时被压到 24rem。全屏查看须显式覆盖。 */}
          <DialogContent className="max-w-5xl p-6 sm:max-w-5xl sm:rounded-xl">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg font-semibold tracking-tight">{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-muted-foreground text-xs">{description}</DialogDescription>
              )}
            </DialogHeader>
            <div className="w-full min-w-0 pt-2" style={{ height: fullscreenHeight }}>
              {isFullscreen ? children : null}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
});
