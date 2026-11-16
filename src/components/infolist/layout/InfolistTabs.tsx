"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "cn";

import type { InfolistTabsProps } from "./types";

import { hasRenderableNode } from "../core/utils";
import { InfolistGrid } from "./InfolistGrid";

export const InfolistTabs = React.memo(function InfolistTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
}: InfolistTabsProps) {
  if (tabs.length === 0) {
    return null;
  }

  const initialTab = defaultValue ?? tabs[0]?.value;

  return (
    <Tabs
      defaultValue={initialTab}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full space-y-4", className)}
    >
      <TabsList className="border-border/60 bg-muted/60 h-9 w-full scrollbar-none justify-start overflow-x-auto border p-1">
        {tabs.map((tab) => {
          const hasIcon = tab.icon !== null && tab.icon !== undefined && typeof tab.icon !== "boolean";
          const hasBadge = hasRenderableNode(tab.badge);

          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
              className="data-active:bg-background data-[state=active]:bg-background cursor-pointer gap-1.5 text-xs"
            >
              {hasIcon && (
                <span
                  className="inline-flex size-3.5 shrink-0 items-center justify-center [&>svg]:size-3.5"
                  aria-hidden="true"
                >
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {hasBadge && (
                <Badge variant="secondary" className="bg-primary/15 text-primary ml-1 h-4 px-1.5 py-0 text-[10px]">
                  {tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="pt-1 focus-visible:outline-none">
          {tab.columns ? <InfolistGrid columns={tab.columns}>{tab.children}</InfolistGrid> : tab.children}
        </TabsContent>
      ))}
    </Tabs>
  );
});
