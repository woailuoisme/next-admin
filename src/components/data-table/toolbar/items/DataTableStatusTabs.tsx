import { memo, type ReactElement } from "react";

import { cn } from "@/lib/utils";

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
      <div
        role="tablist"
        className="bg-muted/60 text-muted-foreground inline-flex h-8.5 items-center gap-1 rounded-md p-1"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-all select-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden",
                isActive
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:bg-background/40 hover:text-foreground",
              )}
            >
              {Icon && <Icon className="size-3.5 shrink-0" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 font-mono text-[10px] leading-none transition-colors",
                    isActive
                      ? "bg-primary/10 font-semibold text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const DataTableStatusTabs = memo(DataTableStatusTabsInner) as <TData = any>(
  props: DataTableStatusTabsProps<TData>,
) => ReactElement | null;
