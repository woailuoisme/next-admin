import type { ComponentType, ReactNode } from "react";

import { BarChart3 } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

export interface ChartEmptyStateProps {
  message?: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  actionSlot?: ReactNode;
  height?: number | string;
  className?: string;
}

export const ChartEmptyState = memo(function ChartEmptyState({
  message = "暂无统计数据",
  description,
  icon: Icon = BarChart3,
  actionSlot,
  height = 240,
  className,
}: ChartEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center space-y-2 p-6 text-center select-none",
        className,
      )}
      style={{ height }}
    >
      <div className="border-border/40 bg-muted/60 text-muted-foreground/60 mb-1 rounded-full border p-3">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-muted-foreground text-sm font-medium">{message}</p>
      {description && <p className="text-muted-foreground/70 max-w-xs text-xs">{description}</p>}
      {actionSlot && <div className="pt-2">{actionSlot}</div>}
    </div>
  );
});
