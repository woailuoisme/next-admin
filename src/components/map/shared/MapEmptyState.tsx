import { useTranslations } from "next-intl";
import { AlertCircle, MapPinOff, RefreshCw } from "lucide-react";
import { memo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MapEmptyStateProps {
  height?: number | string;
  title?: string;
  description?: string;
  message?: string;
  type?: "no-data" | "error" | "empty";
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;

  className?: string;
}

export const MapEmptyState = memo(function MapEmptyState({
  height = 400,
  title,
  description,
  message,
  type = "no-data",
  action,
  actionLabel,
  onAction,
  className,
}: MapEmptyStateProps) {
  const t = useTranslations("map");
  const isError = type === "error";

  const resolvedTitle = title ?? (isError ? t("error_default") : t("empty_title"));
  const resolvedDesc = message ?? description ?? (isError ? t("error_tile_timeout") : t("empty_desc"));

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-border/70 p-6 text-center select-none",
        isError ? "border-destructive/30 bg-destructive/5" : "bg-muted/10",
        className,
      )}
      style={{ height }}
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          isError ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground",
        )}
      >
        {isError ? <AlertCircle className="size-6 stroke-[1.5]" /> : <MapPinOff className="size-6 stroke-[1.5]" />}
      </div>

      <h4 className={cn("mt-3 text-sm font-semibold", isError ? "text-destructive" : "text-foreground")}>
        {resolvedTitle}
      </h4>
      <p className={cn("mt-1 max-w-sm text-xs", isError ? "text-destructive/80" : "text-muted-foreground")}>
        {resolvedDesc}
      </p>

      {action ? (
        <div className="mt-4">{action}</div>
      ) : actionLabel && onAction ? (
        <div className="mt-4">
          <Button
            variant={isError ? "destructive" : "outline"}
            size="sm"
            onClick={onAction}
            className="h-8 gap-1.5 text-xs"
          >
            {isError && <RefreshCw className="size-3.5" />}
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
});
