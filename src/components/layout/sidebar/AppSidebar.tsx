"use client";

import { memo, useMemo } from "react";

import { Sidebar, SidebarFooter, SidebarRail } from "@/components/ui/sidebar";
import { cn } from "cn";
import { useAuthSession } from "@/stores/auth";

import type { NavGroup, SidebarUser } from "./types";

import { useAuthorizedMenuGroups } from "./menu.config";
import { NavMain } from "./nav-main";
import { NavUser } from "./NavUser";
import { SidebarHeader } from "./SidebarHeader";

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  customGroups?: NavGroup[];
}

export const AppSidebar = memo(function AppSidebar({ className, customGroups, ...props }: AppSidebarProps) {
  const session = useAuthSession();
  const admin = session?.admin;
  const userRole = admin?.role;

  const menuGroups = useAuthorizedMenuGroups(customGroups);

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
    <Sidebar collapsible="icon" className={cn("border-sidebar-border border-r", className)} {...props}>
      <SidebarHeader />
      <NavMain groups={menuGroups} />
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});
