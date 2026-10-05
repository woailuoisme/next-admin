import { Sparkles } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";
import { m } from "@/i18n";

import type { NotificationEmptyStateProps } from "./types";

export const NotificationEmptyState = memo(function NotificationEmptyState({
  activeTab,
  className,
}: NotificationEmptyStateProps) {
  return (
    <div
      data-testid="notification-empty-state"
      className={cn(
        "flex h-64 flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground",
        className,
      )}
    >
      <div className="bg-muted/60 text-muted-foreground/60 mb-1 flex size-12 items-center justify-center rounded-full">
        <Sparkles className="size-6" />
      </div>
      <p className="text-foreground text-xs font-medium">{m.notification.empty_title()}</p>
      <p className="text-muted-foreground max-w-[200px] text-[11px]">
        {activeTab === "unread"
          ? m.notification.empty_unread_desc()
          : m.notification.empty_category_desc()}
      </p>
    </div>
  );
});
