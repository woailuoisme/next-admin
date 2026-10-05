import { memo } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { m } from "@/i18n";

import type { NotificationTabKey } from "../shared";
import type { NotificationTabsProps } from "./types";

import { NOTIFICATION_TABS } from "../shared";

const TAB_TRIGGER_CLASS =
  "rounded-md text-xs data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs";

/** 页签 key → 多语言文案，保证标签唯一来源是 i18n 字典 */
const TAB_LABELS: Record<NotificationTabKey, () => string> = {
  all: m.notification.tab_all,
  order: m.notification.tab_order,
  system: m.notification.tab_system,
  unread: m.notification.tab_unread,
};

export const NotificationTabs = memo(function NotificationTabs({
  activeTab,
  onTabChange,
  className,
}: NotificationTabsProps) {
  return (
    <div className={cn("border-b border-border/40 px-3 pt-2 pb-1", className)}>
      <Tabs
        value={activeTab}
        onValueChange={(val) => onTabChange(val as NotificationTabKey)}
        className="w-full"
      >
        <TabsList className="bg-muted/60 grid h-8 w-full grid-cols-4 rounded-lg p-0.5 text-xs">
          {NOTIFICATION_TABS.map(({ key }) => (
            <TabsTrigger key={key} value={key} className={TAB_TRIGGER_CLASS}>
              {TAB_LABELS[key]()}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
});
