import { memo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { m } from "@/i18n";

import type { NotificationFooterProps } from "./types";

export const NotificationFooter = memo(function NotificationFooter({
  total,
  onGotoOverview,
  className,
}: NotificationFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground",
        className,
      )}
    >
      <span>{m.notification.total_records({ count: total })}</span>
      <Button
        variant="link"
        size="sm"
        onClick={onGotoOverview}
        className="text-muted-foreground hover:text-foreground h-auto p-0 text-[11px]"
      >
        {m.notification.goto_overview()} &rarr;
      </Button>
    </div>
  );
});
