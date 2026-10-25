import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { memo } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "cn";

import type { NavSubItem } from "../types";
import type { NavMainCollapsibleProps } from "./types";

import { NavBadge } from "./NavBadge";
import { isPathActive } from "./utils";

const EMPTY_SUB_ITEMS: NavSubItem[] = [];

interface NavMainSubItemRowProps {
  subItem: NavSubItem;
  isActive: boolean;
}

const NavMainSubItemRow = memo(function NavMainSubItemRow({ subItem, isActive }: NavMainSubItemRowProps) {
  return (
    <SidebarMenuSubItem className="relative">
      {/* Connecting tree timeline dot */}
      <span
        className={cn(
          "ring-sidebar absolute top-1/2 -left-[10.5px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 transition-all duration-200",
          isActive
            ? "bg-primary ring-primary/25 size-2"
            : "bg-muted-foreground/40 group-hover/menu-sub-item:bg-foreground size-1.5",
        )}
      />
      <SidebarMenuSubButton
        asChild
        isActive={isActive}
        className={cn(
          "relative justify-between rounded-md pr-2 pl-3 transition-colors",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        )}
      >
        <Link href={subItem.to} className="flex w-full items-center justify-between">
          <span className="truncate">{subItem.title}</span>
          <NavBadge badge={subItem.badge} className="ml-auto" />
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
});

export const NavMainCollapsible = memo(function NavMainCollapsible({
  item,
  currentPath,
  isChildActive,
}: NavMainCollapsibleProps) {
  const Icon = item.icon;
  const subItems = item.items ?? EMPTY_SUB_ITEMS;

  return (
    <Collapsible asChild defaultOpen={isChildActive || item.defaultOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isChildActive} tooltip={item.title} className="font-medium">
            <Icon className="size-4" />
            <span>{item.title}</span>
            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {subItems.map((subItem) => (
              <NavMainSubItemRow key={subItem.to} subItem={subItem} isActive={isPathActive(subItem.to, currentPath)} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
});
