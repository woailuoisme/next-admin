import Link from "next/link";
import { memo } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import type { NavMainDropdownProps } from "./types";

import { NavBadge } from "./NavBadge";
import { isPathActive } from "./utils";

export const NavMainDropdown = memo(function NavMainDropdown({
  item,
  currentPath,
  isChildActive,
}: NavMainDropdownProps) {
  const Icon = item.icon;
  const subItems = item.items || [];

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            isActive={isChildActive}
            tooltip={item.title}
            className={cn(
              "cursor-pointer font-medium transition-colors",
              isChildActive &&
                "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-xs",
            )}
          >
            <Icon className="size-4" />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={10}
          className="border-sidebar-border bg-popover/95 min-w-48 rounded-lg border p-1.5 shadow-xl backdrop-blur-md"
        >
          <DropdownMenuLabel className="text-muted-foreground flex items-center justify-between px-2 py-1.5 text-xs font-semibold">
            <span>{item.title}</span>
            <NavBadge badge={item.badge} />
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/50 my-1" />
          {subItems.map((subItem) => {
            const isSubActive = isPathActive(subItem.to, currentPath);

            return (
              <DropdownMenuItem
                key={subItem.to}
                asChild
                className={cn(
                  "cursor-pointer rounded-md px-2.5 py-1.5 text-xs transition-colors focus:bg-accent focus:text-accent-foreground",
                  isSubActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                )}
              >
                <Link href={subItem.to} className="flex w-full items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-1.5 rounded-full transition-all",
                        isSubActive
                          ? "scale-125 bg-primary ring-2 ring-primary/20"
                          : "bg-muted-foreground/40",
                      )}
                    />
                    <span className="font-normal">{subItem.title}</span>
                  </div>
                  <NavBadge badge={subItem.badge} />
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
});
