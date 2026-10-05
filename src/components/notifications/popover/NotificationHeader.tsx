import { CheckCheck } from "lucide-react";
import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { m } from "@/i18n";

import type { NotificationHeaderProps } from "./types";

export const NotificationHeader = memo(function NotificationHeader({
  unreadCount,
  isMarkingAllAsRead,
  onMarkAllAsRead,
  className,
}: NotificationHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-foreground text-sm font-semibold tracking-tight">
          {m.notification.title()}
        </span>
        {unreadCount > 0 ? (
          <Badge
            variant="destructive"
            className="h-5 rounded-full px-1.5 text-[10px] font-semibold"
          >
            {m.notification.unread_count({ count: unreadCount })}
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="text-muted-foreground h-5 rounded-full px-1.5 text-[10px]"
          >
            {m.notification.all_synced()}
          </Badge>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onMarkAllAsRead}
        disabled={unreadCount === 0 || isMarkingAllAsRead}
        className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-xs font-normal"
      >
        <CheckCheck className="size-3.5" />
        <span>{m.notification.mark_all_read()}</span>
      </Button>
    </div>
  );
});
