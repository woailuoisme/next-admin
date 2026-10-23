import {
  AreaChart,
  BarChart3,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  MapPin,
  Package,
  Sparkles,
  TableProperties,
  Users,
} from "lucide-react";

import { useTranslations } from "next-intl";

import { createNamespaceTranslator } from "@/i18n";

import type { NavGroup } from "./types";

const getMenuTranslator = () => createNamespaceTranslator("menu");

/**
 * Get localized sidebar navigation menu groups with concise wording.
 * Accepts an optional translation function (e.g. from useTranslations('menu')).
 */
export function getSidebarMenuGroups(tMenu?: (key: any) => string): NavGroup[] {
  const t = tMenu ?? getMenuTranslator();
  return [
    {
      items: [
        {
          title: t("overview"),
          to: "/overview",
          icon: LayoutDashboard,
        },
        {
          title: t("catalog"),
          icon: Package,
          defaultOpen: true,
          items: [
            { title: t("products"), to: "/products", badge: 12 },
            { title: t("categories"), to: "/categories", badge: 4 },
            { title: t("orders"), to: "/orders", badge: 15 },
          ],
        },
        {
          title: t("users"),
          to: "/users",
          icon: Users,
        },
      ],
    },
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
      ],
    },
  ];
}

/** 未声明 roles 视为对所有角色开放 */
function isRoleAllowed(roles: string[] | undefined, userRole?: string): boolean {
  return !roles?.length || !userRole || roles.includes(userRole);
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
export function getRouteTitle(pathname: string, fallback?: string): string {
  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";
  const items = getFlatNavItems();

  // Exact match first
  const exact = items.find((item) => item.to === cleanPath);
  if (exact) {
    return exact.title;
  }

  // Prefix match
  const prefix = items.find((item) => item.to !== "/" && cleanPath.startsWith(`${item.to}/`));
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
 * React hook to retrieve translated sidebar navigation groups within Client Components
 */
export function useSidebarMenuGroups(): NavGroup[] {
  const t = useTranslations("menu");
  return getSidebarMenuGroups(t);
}
