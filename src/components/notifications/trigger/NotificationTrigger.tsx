import { useMemoizedFn } from "ahooks";
import { Bell } from "lucide-react";
import { forwardRef, memo } from "react";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { NotificationTriggerProps } from "./types";

export const NotificationTrigger = memo(
  forwardRef<HTMLButtonElement, NotificationTriggerProps>(function NotificationTrigger(
    { unreadCount, onPrefetch, className, onMouseEnter, onFocus, ...props },
    ref,
  ) {
    const t = useTranslations("notification");
    const handleMouseEnter = useMemoizedFn((e: React.MouseEvent<HTMLButtonElement>) => {
      onPrefetch?.();
      onMouseEnter?.(e);
    });

    const handleFocus = useMemoizedFn((e: React.FocusEvent<HTMLButtonElement>) => {
      onPrefetch?.();
      onFocus?.(e);
    });

    const formattedBadge = unreadCount > 99 ? "99+" : unreadCount;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                ref={ref}
                variant="ghost"
                size="icon"
                className={cn("relative size-8 rounded-full transition-colors hover:bg-accent/80", className)}
                aria-label={t("view")}
                onMouseEnter={handleMouseEnter}
                onFocus={handleFocus}
                {...props}
              >
                <Bell className="text-muted-foreground size-4 transition-transform group-hover:scale-105" />
                {unreadCount > 0 && (
                  <>
                    <span
                      data-testid="notification-unread-badge"
                      className="bg-destructive text-destructive-foreground ring-background absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ring-2"
                    >
                      {formattedBadge}
                    </span>
                    <span className="bg-destructive/60 pointer-events-none absolute -top-0.5 -right-0.5 size-4 animate-ping rounded-full" />
                  </>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs font-medium">
            {t("title")} {unreadCount > 0 ? `(${t("unread_count", { count: unreadCount })})` : ""}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }),
);
