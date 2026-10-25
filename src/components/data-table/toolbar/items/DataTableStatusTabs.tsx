import { memo, type ReactElement } from "react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "cn";

import type { DataTableTabItem } from "../../core/types";

export interface DataTableStatusTabsProps<TData = any> {
  tabs: DataTableTabItem<TData>[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

function DataTableStatusTabsInner<TData = any>({
  tabs,
  activeTab,
  onTabChange,
  className,
}: DataTableStatusTabsProps<TData>) {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div
      data-slot="data-table-status-tabs"
      className={cn(
        "no-scrollbar flex w-full items-center gap-2 overflow-x-auto border-b border-border/50 pb-2.5",
        className,
      )}
    >
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="bg-muted/60 h-8.5 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="cursor-pointer gap-1.5 px-2.5 py-1 text-xs"
              >
                {Icon ? <Icon className="size-3.5 shrink-0" /> : null}
                <span>{tab.label}</span>
                {tab.badge !== undefined ? (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "px-1.5 py-0 font-mono text-[10px] leading-none transition-colors",
                      isActive ? "bg-primary/10 font-semibold text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tab.badge}
                  </Badge>
                ) : null}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}

export const DataTableStatusTabs = memo(DataTableStatusTabsInner) as <TData = any>(
  props: DataTableStatusTabsProps<TData>,
) => ReactElement | null;
