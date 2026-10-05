import { memo } from "react";

import { cn } from "@/lib/utils";

import type { AvatarCellProps } from "./types";

import { AVATAR_ALIGN_CLASSES } from "../../base";
import { StackedAvatarGroup } from "./AvatarGroup";
import { AvatarThumb } from "./AvatarThumb";

function AvatarCellInner({
  src,
  name,
  subtext,
  fallback,
  shape = "circle",
  size = "sm",
  status,
  colorSeed,
  autoColor = true,
  stacked,
  maxStacked = 3,
  align = "left",
  className,
}: AvatarCellProps) {
  // 1. Stacked Avatar Group Mode
  if (stacked && stacked.length > 0) {
    return (
      <div className={cn("flex items-center", AVATAR_ALIGN_CLASSES[align], className)}>
        <StackedAvatarGroup items={stacked} maxStacked={maxStacked} size={size} shape={shape} />
      </div>
    );
  }

  // 2. Single Avatar Mode (with optional text & subtext)
  const avatarElement = (
    <AvatarThumb
      src={src}
      name={name}
      fallback={fallback}
      size={size}
      shape={shape}
      status={status}
      colorSeed={colorSeed}
      autoColor={autoColor}
    />
  );

  if (!name && !subtext) {
    return (
      <div className={cn("flex items-center", AVATAR_ALIGN_CLASSES[align], className)}>
        {avatarElement}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex max-w-full min-w-0 items-center gap-2.5",
        AVATAR_ALIGN_CLASSES[align],
        className,
      )}
    >
      {avatarElement}
      <div className="flex min-w-0 flex-col truncate">
        {name && (
          <span className="text-foreground truncate text-xs leading-tight font-medium">{name}</span>
        )}
        {subtext && (
          <span className="text-muted-foreground/80 mt-0.5 truncate text-[11px] leading-normal">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}

export const AvatarCell = memo(AvatarCellInner);
