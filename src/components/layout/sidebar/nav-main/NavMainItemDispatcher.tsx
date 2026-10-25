import { memo } from "react";

import { useSidebar } from "@/components/ui/sidebar";

import type { NavMainItemProps } from "./types";

import { NavMainCollapsible } from "./NavMainCollapsible";
import { NavMainDropdown } from "./NavMainDropdown";
import { NavMainItem } from "./NavMainItem";
import { hasActiveSubItem, isPathActive } from "./utils";

export const NavMainItemDispatcher = memo(function NavMainItemDispatcher({ item, currentPath }: NavMainItemProps) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  // Case 1: Direct link without child items - passes derived isActive to skip re-renders
  if (!item.items || item.items.length === 0) {
    const isActive = isPathActive(item.to, currentPath);
    return <NavMainItem item={item} isActive={isActive} />;
  }

  const isChildActive = hasActiveSubItem(item, currentPath);

  // Case 2: Collapsed sidebar flyout dropdown
  if (isCollapsed) {
    return <NavMainDropdown item={item} currentPath={currentPath} isChildActive={isChildActive} />;
  }

  // Case 3: Expanded sidebar accordion
  return <NavMainCollapsible item={item} currentPath={currentPath} isChildActive={isChildActive} />;
});
