import { memo } from "react";
import { useTranslations } from "next-intl";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import type { NotificationTabKey } from "../shared";
import type { NotificationTabsProps } from "./types";

import { NOTIFICATION_TABS } from "../shared";

const TAB_TRIGGER_CLASS =
  "relative h-9 rounded-none border-b-2 border-transparent px-3 text-xs font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none";

/** 页签 key → 多语言 key 映射 */
const TAB_LABEL_KEYS: Record<
  NotificationTabKey,
  "tab_all" | "tab_order" | "tab_system" | "tab_unread"
> = {
  all: "tab_all",
  order: "tab_order",
  system: "tab_system",
  unread: "tab_unread",
};

export const NotificationTabs = memo(function NotificationTabs({
  activeTab,
  unreadCount = 0,
  onTabChange,
  className,
}: NotificationTabsProps) {
  const t = useTranslations("notification");

  return (
    <div className={cn("border-b border-border/40 px-3", className)}>
      <Tabs
        value={activeTab}
        onValueChange={(val) => onTabChange(val as NotificationTabKey)}
        className="w-full"
      >
        <TabsList className="flex h-9 w-full items-center justify-start gap-1 rounded-none bg-transparent p-0">
          {NOTIFICATION_TABS.map(({ key }) => (
            <TabsTrigger key={key} value={key} className={TAB_TRIGGER_CLASS}>
              <span>{t(TAB_LABEL_KEYS[key])}</span>
              {key === "unread" && unreadCount > 0 && (
                <span className="bg-primary/10 text-primary flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
});
