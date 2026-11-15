import {
  AreaChart,
  BarChart3,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  MapPin,
  Radio,
  Sparkles,
  TableProperties,
} from "lucide-react";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { createNamespaceTranslator } from "@/i18n";
import { mergeWithResourceMenu } from "@/lib/resource/registry";

import { useLayoutAuth } from "../LayoutAuthContext";
import type { NavGroup } from "./types";

const getMenuTranslator = () => createNamespaceTranslator("menu");

/**
 * Get localized sidebar navigation menu groups with concise wording.
 * 资源导航项由 RESOURCE_MANIFEST 自动驱动，并与静态非资源菜单组合。
 */
export function getSidebarMenuGroups(tMenu?: (key: any) => string): NavGroup[] {
  const t = tMenu ?? getMenuTranslator();
  return mergeWithResourceMenu(
    (key) => t(key as never),
    [
      {
        title: t("overview"),
        to: "/overview",
        icon: LayoutDashboard,
      },
    ],
    [
      {
        title: t("showcase"),
        items: [
          {
            title: t("showcase_tables"),
            to: "/showcase/tables",
            icon: TableProperties,
          },
          {
            title: t("showcase_forms"),
            to: "/showcase/forms",
            icon: Sparkles,
          },
          {
            title: t("showcase_infolists"),
            to: "/showcase/infolists",
            icon: FileText,
          },
          {
            title: t("showcase_stats"),
            to: "/showcase/stats",
            icon: BarChart3,
          },
          {
            title: t("showcase_charts"),
            to: "/showcase/charts",
            icon: AreaChart,
          },
          {
            title: t("showcase_maps"),
            to: "/showcase/maps",
            icon: MapPin,
          },
          {
            title: t("showcase_realtime"),
            to: "/showcase/realtime",
            icon: Radio,
          },
        ],
      },
    ],
  );
}

/** 未声明 roles 视为对所有角色开放 */
// 调用方已保证 userRole 存在（getAuthorizedMenu 入口早退），这里不再重复放行分支
function isRoleAllowed(roles: string[] | undefined, userRole: string): boolean {
  return !roles?.length || roles.includes(userRole);
}

/**
 * Filter menu groups and items based on the user's current role
 */
export function getAuthorizedMenu(groups: NavGroup[] = getSidebarMenuGroups(), userRole?: string): NavGroup[] {
  if (!userRole) {
    return groups;
  }

  return groups
    .filter((group) => isRoleAllowed(group.roles, userRole))
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => isRoleAllowed(item.roles, userRole))
        .map((item) =>
          item.items
            ? { ...item, items: item.items.filter((subItem) => isRoleAllowed(subItem.roles, userRole)) }
            : item,
        ),
    }))
    .filter((group) => group.items.length > 0);
}

export interface FlatNavItem {
  title: string;
  to: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  parentTitle?: string;
}

/**
 * Flatten multi-level navigation hierarchy into a list of searchable items
 */
export function getFlatNavItems(groups: NavGroup[] = getSidebarMenuGroups()): FlatNavItem[] {
  const result: FlatNavItem[] = [];
  for (const group of groups) {
    for (const item of group.items) {
      if (item.to) {
        result.push({
          title: item.title,
          to: item.to,
          icon: item.icon,
          parentTitle: group.title,
        });
      }
      if (item.items) {
        for (const subItem of item.items) {
          if (subItem.to) {
            result.push({
              title: subItem.title,
              to: subItem.to,
              icon: subItem.icon ?? item.icon,
              parentTitle: item.title,
            });
          }
        }
      }
    }
  }
  return result;
}

/**
 * Dynamic route title lookup based on current pathname
 */
export function getRouteTitle(pathname: string, fallback?: string, items?: FlatNavItem[]): string {
  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  const searchItems = items ?? getFlatNavItems();

  // Exact match first
  const exact = searchItems.find((item) => item.to === cleanPath);
  if (exact) {
    return exact.title;
  }

  // Prefix match
  const prefix = searchItems.find((item) => item.to !== "/" && cleanPath.startsWith(`${item.to}/`));
  if (prefix) {
    return prefix.title;
  }

  if (fallback) {
    return fallback;
  }

  // Default fallback: parse last segment
  const segments = cleanPath.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? "Dashboard";
  return lastSegment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * React hook to retrieve the localized route title, reactive to locale changes
 */
export function useRouteTitle(pathname: string, fallback?: string): string {
  const menuGroups = useSidebarMenuGroups();
  return useMemo(() => {
    const flatItems = getFlatNavItems(menuGroups);
    return getRouteTitle(pathname, fallback, flatItems);
  }, [menuGroups, pathname, fallback]);
}

/**
 * React hook to retrieve translated sidebar navigation groups within Client Components
 */
export function useSidebarMenuGroups(): NavGroup[] {
  const t = useTranslations("menu");
  return useMemo(() => getSidebarMenuGroups(t), [t]);
}

/**
 * 统一的菜单权限过滤与扁平化组合 Hooks（AppSidebar 与 GlobalSearchDialog 共用）
 */
export function useAuthorizedMenuGroups(customGroups?: NavGroup[], userRoleProp?: string): NavGroup[] {
  const layoutAuth = useLayoutAuth();
  const userRole = userRoleProp ?? layoutAuth.user?.role;
  const dynamicGroups = useSidebarMenuGroups();

  return useMemo(() => {
    const baseGroups = customGroups ?? dynamicGroups;
    return getAuthorizedMenu(baseGroups, userRole);
  }, [customGroups, dynamicGroups, userRole]);
}

export function useAuthorizedFlatNavItems(customGroups?: NavGroup[], userRoleProp?: string): FlatNavItem[] {
  const authorizedGroups = useAuthorizedMenuGroups(customGroups, userRoleProp);
  return useMemo(() => getFlatNavItems(authorizedGroups), [authorizedGroups]);
}
