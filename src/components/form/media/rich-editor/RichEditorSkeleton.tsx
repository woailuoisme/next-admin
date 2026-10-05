import { memo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface RichEditorSkeletonProps {
  minHeight?: string | number;
  className?: string;
}

export const RichEditorSkeleton = memo(function RichEditorSkeleton({
  minHeight = 160,
  className,
}: RichEditorSkeletonProps) {
  return (
    <div
      className={cn("flex flex-col overflow-hidden rounded-md border bg-card/40", className)}
      style={{ minHeight }}
      data-testid="rich-editor-skeleton"
    >
      {/* Toolbar skeleton */}
      <div className="bg-muted/30 flex flex-wrap items-center gap-1.5 border-b p-1.5">
        <Skeleton className="h-7 w-7 rounded-sm" />
        <Skeleton className="h-7 w-7 rounded-sm" />
        <div className="bg-border/60 mx-0.5 h-4 w-px" />
        <Skeleton className="h-7 w-7 rounded-sm" />
        <Skeleton className="h-7 w-7 rounded-sm" />
        <div className="bg-border/60 mx-0.5 h-4 w-px" />
        <Skeleton className="h-7 w-7 rounded-sm" />
        <Skeleton className="h-7 w-7 rounded-sm" />
      </div>
      {/* Content skeleton */}
      <div className="flex-1 space-y-2.5 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
});
