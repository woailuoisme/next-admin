import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import type { InfolistTabsProps } from "./types";

import { InfolistGrid } from "./InfolistGrid";

export const InfolistTabs = React.memo(function InfolistTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
}: InfolistTabsProps) {
  const initialTab = defaultValue || tabs[0]?.value;

  return (
    <Tabs
      defaultValue={initialTab}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full space-y-4", className)}
    >
      {/*
				TabsList 基础为 `inline-flex` + 触发器的 `whitespace-nowrap`（min-width:auto），
				故 Tab 数量多时总宽会超出容器且既不换行也不滚动 → 横向溢出。
				这里补上横向滚动，并用 scrollbar-none 隐藏滚动条以保持外观整洁。
			*/}
      <TabsList className="border-border/60 bg-muted/60 h-9 w-full scrollbar-none justify-start overflow-x-auto border p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:bg-background cursor-pointer gap-1.5 text-xs"
          >
            {tab.icon && <span className="size-3.5 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="bg-primary/15 text-primary ml-1 rounded-full px-1.5 py-0.5 text-[10px]">
                {tab.badge}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="pt-1 focus-visible:outline-none">
          {tab.columns ? <InfolistGrid columns={tab.columns}>{tab.children}</InfolistGrid> : tab.children}
        </TabsContent>
      ))}
    </Tabs>
  );
});
