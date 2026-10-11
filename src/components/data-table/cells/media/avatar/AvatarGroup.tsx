import { memo } from "react";

import { AvatarGroup as UiAvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { AvatarItem } from "./types";

import { AvatarThumb, avatarShapeClasses, avatarSizeClasses } from "./AvatarThumb";

interface StackedAvatarGroupProps {
  items: AvatarItem[];
  maxStacked?: number;
  size?: keyof typeof avatarSizeClasses;
  shape?: keyof typeof avatarShapeClasses;
}

function StackedAvatarGroupInner({
  items,
  maxStacked = 3,
  size = "sm",
  shape = "circle",
}: StackedAvatarGroupProps) {
  const visibleItems = items.slice(0, maxStacked);
  const remainingItems = items.slice(maxStacked);
  const remainingCount = remainingItems.length;

  return (
    <UiAvatarGroup>
      {visibleItems.map((item, idx) => (
        <Tooltip key={item.name || item.src || idx}>
          <TooltipTrigger asChild>
            <AvatarThumb
              src={item.src}
              name={item.name}
              fallback={item.fallback}
              size={size}
              shape={shape}
              status={item.status}
              className="cursor-pointer transition-transform hover:z-10 hover:scale-105"
            />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p className="font-semibold">{item.name || "匿名用户"}</p>
            {(item.role || item.subtext) && (
              <p className="text-muted-foreground text-[11px]">{item.role || item.subtext}</p>
            )}
          </TooltipContent>
        </Tooltip>
      ))}

      {remainingCount > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="focus-visible:ring-ring cursor-pointer rounded-full outline-hidden transition-transform hover:z-10 hover:scale-105 focus-visible:ring-2"
            >
              <AvatarGroupCount className={cn(avatarSizeClasses[size], avatarShapeClasses[shape])}>
                +{remainingCount}
              </AvatarGroupCount>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between border-b pb-1.5 text-xs">
              <span className="text-foreground font-medium">全部成员</span>
              <span className="text-muted-foreground">{items.length} 人</span>
            </div>
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {remainingItems.map((rem, remIdx) => (
                <div
                  key={rem.name || rem.src || remIdx}
                  className="hover:bg-muted/50 flex items-center gap-2.5 rounded-md p-1"
                >
                  <AvatarThumb
                    src={rem.src}
                    name={rem.name}
                    fallback={rem.fallback}
                    size="xs"
                    shape={shape}
                    status={rem.status}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-xs font-medium">{rem.name || "匿名用户"}</p>
                    {(rem.role || rem.subtext) && (
                      <p className="text-muted-foreground truncate text-[11px]">{rem.role || rem.subtext}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </UiAvatarGroup>
  );
}

export const StackedAvatarGroup = memo(StackedAvatarGroupInner);
