import { Loader2, MapPin } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

export interface MapSkeletonProps {
  height?: number | string;
  className?: string;
  message?: string;
}

export const MapSkeleton = memo(function MapSkeleton({
  height = 400,
  className,
  message = "正在载入矢量地理数据与底图资源...",
}: MapSkeletonProps) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/20 select-none",
        className,
      )}
      style={{ height }}
      role="status"
      aria-label={message}
    >
      {/* Grid texture representing map coordinates */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Center pulsing radar ring */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="bg-primary/10 relative flex size-14 items-center justify-center rounded-full">
          <div className="bg-primary/20 absolute size-full animate-ping rounded-full duration-1000" />
          <MapPin className="text-primary size-6" />
        </div>

        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Loader2 className="text-primary size-3.5 animate-spin" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
});
