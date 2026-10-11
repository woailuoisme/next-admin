import { isNil } from "es-toolkit";
import { Flame, Heart, Star, ThumbsUp } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { RatingCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";

const starSizes = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
};

const iconComponents = {
  star: Star,
  heart: Heart,
  flame: Flame,
  thumb: ThumbsUp,
};

const defaultIconColors = {
  star: "text-amber-500 fill-amber-500",
  heart: "text-rose-500 fill-rose-500",
  flame: "text-orange-500 fill-orange-500",
  thumb: "text-primary fill-primary",
};

export const RatingCell = memo(function RatingCell({
  value,
  max = 5,
  allowHalf = true,
  showScore = false,
  reviewCount,
  precision = 1,
  size = "sm",
  iconType = "star",
  activeColor,
  color,
  align = "left",
  className,
}: RatingCellProps) {
  if (isNil(value) || Number.isNaN(value)) {
    return <span className="text-muted-foreground/40 text-xs italic">-</span>;
  }

  const clampedValue = Math.max(0, Math.min(value, max));
  const starSizeClass = starSizes[size];
  const IconComp = iconComponents[iconType] || Star;
  const resolvedActiveColor = color || activeColor || defaultIconColors[iconType] || defaultIconColors.star;

  return (
    <div
      className={cn("flex items-center gap-1.5", JUSTIFY_ALIGN_CLASSES[align], className)}
      data-testid="rating-cell"
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, index) => {
          const starNumber = index + 1;
          const isFull = clampedValue >= starNumber;
          const isHalf = allowHalf && clampedValue >= starNumber - 0.5 && clampedValue < starNumber;

          if (isFull) {
            return (
              <IconComp
                key={index}
                className={cn(starSizeClass, "shrink-0 fill-current", resolvedActiveColor)}
                aria-hidden="true"
              />
            );
          }

          if (isHalf) {
            return (
              <div key={index} className="relative inline-flex shrink-0">
                <IconComp
                  className={cn(starSizeClass, "fill-transparent text-muted-foreground/30")}
                  aria-hidden="true"
                />
                <div className="absolute inset-0 w-1/2 overflow-hidden">
                  <IconComp
                    className={cn(starSizeClass, "shrink-0 fill-current", resolvedActiveColor)}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          }

          return (
            <IconComp
              key={index}
              className={cn(starSizeClass, "shrink-0 fill-transparent text-muted-foreground/30")}
              aria-hidden="true"
            />
          );
        })}
      </div>

      {showScore && (
        <span className="text-foreground/80 font-mono text-xs font-semibold tabular-nums">
          {clampedValue.toFixed(precision)}
        </span>
      )}

      {reviewCount !== undefined && reviewCount !== null && (
        <span className="text-muted-foreground/70 font-sans text-[11px]">({reviewCount})</span>
      )}
    </div>
  );
});
