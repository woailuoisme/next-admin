import { useMemoizedFn } from "ahooks";
import { Clock, ExternalLink } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { NotificationItemRowProps } from "./types";

import { SEVERITY_BADGE_CLASSES, formatRelativeTime, getCategoryIconComponent } from "../shared";

export const NotificationItemRow = memo(function NotificationItemRow({
  item,
  onItemClick,
}: NotificationItemRowProps) {
  const { Icon, className: iconClassName } = getCategoryIconComponent(item.category, item.severity);
  const severityBgClass = SEVERITY_BADGE_CLASSES[item.severity];

  const handleClick = useMemoizedFn(() => {
    onItemClick(item);
  });

  const handleKeyDown = useMemoizedFn((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onItemClick(item);
    }
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid={`notification-item-${item.id}`}
      className={cn(
        "group relative flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        item.read
          ? "border-transparent text-muted-foreground hover:bg-muted/50"
          : "border-primary/10 bg-primary/5 text-foreground hover:bg-primary/10",
      )}
    >
      {/* 分类/级别图标 */}
      <div
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border shadow-2xs",
          severityBgClass,
        )}
      >
        <Icon className={iconClassName} />
      </div>

      {/* 文本及元信息 */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-1.5">
          <h4
            className={cn(
              "line-clamp-1 text-xs leading-snug font-semibold",
              item.read ? "text-foreground/85" : "text-foreground",
            )}
          >
            {item.title}
          </h4>
          <span className="text-muted-foreground/80 flex shrink-0 items-center gap-1 text-[10px]">
            <Clock className="size-2.5" />
            {formatRelativeTime(item.createdAt)}
          </span>
        </div>

        <p className="text-muted-foreground line-clamp-2 text-[11px] leading-relaxed">
          {item.description}
        </p>

        {item.actionLabel && (
          <div className="text-primary flex items-center gap-1 pt-1 text-[11px] font-medium hover:underline">
            <span>{item.actionLabel}</span>
            <ExternalLink className="size-2.5" />
          </div>
        )}
      </div>

      {/* 未读指示点 */}
      {!item.read && (
        <span
          data-testid="notification-unread-dot"
          className="bg-primary ring-background absolute top-3 right-2 size-2 rounded-full ring-2"
        />
      )}
    </div>
  );
});
