import type { LucideIcon } from "lucide-react";

export interface NavSubItem {
  title: string;
  to: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  badge?: string | number;
  roles?: string[];
}

export interface NavItem {
  title: string;
  to?: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  badge?: string | number;
  items?: NavSubItem[];
  roles?: string[];
  defaultOpen?: boolean;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
  roles?: string[];
}

export interface SidebarUser {
  name: string;
  email: string;
  avatar: string;
  role?: string;
}
