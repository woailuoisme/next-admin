import Link from "next/link";
import { memo } from "react";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

import type { NavMainItemProps } from "./types";

import { NavBadge } from "./NavBadge";
import { isPathActive } from "./utils";

export const NavMainItem = memo(function NavMainItem({ item, currentPath }: NavMainItemProps) {
  if (!item.to) {
    return null;
  }

  const Icon = item.icon;
  const isActive = isPathActive(item.to, currentPath);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className="font-medium">
        <Link href={item.to}>
          <Icon className="size-4" />
          <span>{item.title}</span>
          <NavBadge badge={item.badge} className="ml-auto" />
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});
