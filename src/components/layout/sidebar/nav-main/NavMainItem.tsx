"use client";

import Link from "next/link";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

import type { NavMainItemProps } from "./types";

import { NavBadge } from "./NavBadge";
import { isPathActive } from "./utils";

export function NavMainItem({ item, isActive: controlledActive, currentPath }: NavMainItemProps) {
	if (!item.to) {
		return null;
	}

	const Icon = item.icon;
	const isActive = controlledActive ?? isPathActive(item.to, currentPath);

	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className="font-medium">
				<Link href={item.to}>
					<Icon aria-hidden="true" />
					<span>{item.title}</span>
					<NavBadge badge={item.badge} className="ml-auto" />
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}
