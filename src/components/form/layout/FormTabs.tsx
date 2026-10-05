import { type ComponentType, memo, type ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface FormTabItem {
  id: string;
  label: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  badge?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
}

export interface FormTabsProps {
  tabs: FormTabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (val: string) => void;
  className?: string;
}

export const FormTabs = memo(function FormTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
}: FormTabsProps) {
  const initialTab = defaultValue || tabs[0]?.id;

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
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className="data-[state=active]:bg-background cursor-pointer gap-1.5 text-xs"
            >
              {Icon && <Icon className="size-3.5 shrink-0" />}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="py-0.2 bg-primary/15 text-primary ml-1 rounded-full px-1.5 text-[10px]">
                  {tab.badge}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="pt-1 focus-visible:outline-none">
          {tab.children}
        </TabsContent>
      ))}
    </Tabs>
  );
});
