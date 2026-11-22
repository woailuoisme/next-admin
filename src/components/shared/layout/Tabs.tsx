"use client";

import { hasRenderableNode, renderIconSlot } from "@/components/shared/renderable";
import { Badge } from "@/components/ui/badge";
import { Tabs as TabsRoot, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "cn";

import { Grid } from "./Grid";
import type { LayoutTabItem, TabsProps } from "./types";

function getTabKey(tab: LayoutTabItem, index: number): string {
	return tab.value ?? tab.id ?? `tab-${index}`;
}

/**
 * 通用多标签页布局容器：统一替代 `FormTabs` 与 `InfolistTabs`。
 */
export function Tabs({ tabs, defaultValue, value, onValueChange, className }: TabsProps) {
	if (tabs.length === 0) return null;

	const firstKey = getTabKey(tabs[0], 0);
	const initialValue = defaultValue ?? firstKey;

	return (
		<TabsRoot
			defaultValue={value === undefined ? initialValue : undefined}
			value={value}
			onValueChange={onValueChange}
			className={cn("w-full text-left", className)}
		>
			<TabsList className="bg-muted/70 h-auto w-full scrollbar-none flex-nowrap justify-start gap-1 overflow-x-auto rounded-lg p-1">
				{tabs.map((tab, index) => {
					const tabKey = getTabKey(tab, index);
					const iconNode = renderIconSlot(tab.icon, "size-3.5 shrink-0");
					return (
						<TabsTrigger
							key={tabKey}
							value={tabKey}
							disabled={tab.disabled}
							className="data-[state=active]:bg-background data-[state=active]:text-foreground flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all data-[state=active]:shadow-xs"
						>
							{iconNode}
							<span>{tab.label}</span>
							{hasRenderableNode(tab.badge) && (
								<Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-[10px] font-medium">
									{tab.badge}
								</Badge>
							)}
						</TabsTrigger>
					);
				})}
			</TabsList>

			{tabs.map((tab, index) => {
				const tabKey = getTabKey(tab, index);
				return (
					<TabsContent key={tabKey} value={tabKey} className="mt-4">
						{tab.columns ? <Grid columns={tab.columns}>{tab.children}</Grid> : tab.children}
					</TabsContent>
				);
			})}
		</TabsRoot>
	);
}
