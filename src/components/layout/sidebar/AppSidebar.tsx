"use client";

import { useMemo } from "react";

import { Sidebar, SidebarFooter, SidebarRail } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/stores/auth";

import type { NavGroup, SidebarUser } from "./types";

import { getAuthorizedMenu, useSidebarMenuGroups } from "./menu.config";
import { NavMain } from "./nav-main";
import { NavUser } from "./NavUser";
import { SidebarHeader } from "./SidebarHeader";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  customGroups?: NavGroup[];
}

export function AppSidebar({ className, customGroups, ...props }: AppSidebarProps) {
  const session = useAuthSession();
  const admin = session?.admin;
  const userRole = admin?.role;

  const dynamicGroups = useSidebarMenuGroups();

  const menuGroups = useMemo(() => {
    const baseGroups = customGroups ?? dynamicGroups;
    return getAuthorizedMenu(baseGroups, userRole);
  }, [customGroups, dynamicGroups, userRole]);

  const currentUser: SidebarUser | null = useMemo(() => {
    if (!admin) return null;
    return {
      name: admin.name,
      email: admin.email,
      avatar: admin.avatarUrl ?? "",
      role: userRole,
    };
  }, [admin, userRole]);

  return (
    <Sidebar collapsible="icon" className={cn("border-r border-sidebar-border", className)} {...props}>
      <SidebarHeader />
      <NavMain groups={menuGroups} />
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
