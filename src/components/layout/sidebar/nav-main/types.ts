import type { NavGroup, NavItem } from "../types";

export interface NavMainProps {
  groups: NavGroup[];
  className?: string;
}

export interface NavMainItemProps {
  item: NavItem;
  currentPath: string;
}

export interface NavMainCollapsibleProps {
  item: NavItem;
  currentPath: string;
  isChildActive: boolean;
}

export interface NavMainDropdownProps {
  item: NavItem;
  currentPath: string;
  isChildActive: boolean;
}
