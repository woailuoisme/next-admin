"use client";

import { Sidebar, SidebarFooter, SidebarRail } from "@/components/ui/sidebar";
import { cn } from "cn";

import { useLayoutAuth } from "../LayoutAuthContext";
import type { NavGroup } from "./types";

import { useAuthorizedMenuGroups } from "./menu.config";
import { NavMain } from "./nav-main";
import { NavUser } from "./NavUser";
import { SidebarHeader } from "./SidebarHeader";

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	customGroups?: NavGroup[];
}

export function AppSidebar({ className, customGroups, ...props }: AppSidebarProps) {
	const { user } = useLayoutAuth();
	const menuGroups = useAuthorizedMenuGroups(customGroups, user?.role);

	return (
		<Sidebar collapsible="icon" className={cn("border-sidebar-border border-r", className)} {...props}>
			<SidebarHeader />
			<NavMain groups={menuGroups} />
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
