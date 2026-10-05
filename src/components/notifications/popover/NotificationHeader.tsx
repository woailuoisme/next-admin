import { CheckCheck } from "lucide-react";
import { memo } from "react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { NotificationHeaderProps } from "./types";

export const NotificationHeader = memo(function NotificationHeader({
  unreadCount,
  isMarkingAllAsRead,
  onMarkAllAsRead,
  className,
}: NotificationHeaderProps) {
  const t = useTranslations("notification");

  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border/50 bg-background/90 px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-foreground text-sm font-semibold tracking-tight">{t("title")}</span>
        {unreadCount > 0 ? (
          <Badge
            variant="secondary"
            className="border-primary/20 bg-primary/10 text-primary h-5 rounded-full border px-2 text-[11px] font-semibold"
          >
            {t("unread_count", { count: unreadCount })}
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="text-muted-foreground/80 bg-muted/60 h-5 rounded-full px-2 text-[11px] font-normal"
          >
            {t("all_synced")}
          </Badge>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onMarkAllAsRead}
        disabled={unreadCount === 0 || isMarkingAllAsRead}
        className="text-muted-foreground hover:text-foreground hover:bg-muted/60 h-7 gap-1 px-2 text-xs font-normal transition-colors"
      >
        <CheckCheck className="size-3.5" />
        <span>{t("mark_all_read")}</span>
      </Button>
    </div>
  );
});
