"use client";

import { usePathname } from "next/navigation";
import { memo } from "react";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import type { NavMainProps } from "./types";

import { NavMainItemDispatcher } from "./NavMainItemDispatcher";

export const NavMain = memo(function NavMain({ groups, className }: NavMainProps) {
  const currentPath = usePathname();

  return (
    <SidebarContent
      className={cn(
        "space-y-4 p-2 group-data-[collapsible=icon]:space-y-1 group-data-[collapsible=icon]:p-0",
        className,
      )}
    >
      {groups.map((group, groupIdx) => (
        <SidebarGroup key={group.title ?? `group-${groupIdx}`}>
          {group.title && (
            <SidebarGroupLabel className="text-muted-foreground px-2 text-[11px] font-semibold tracking-wider uppercase">
              {group.title}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <NavMainItemDispatcher key={item.title} item={item} currentPath={currentPath} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
});
