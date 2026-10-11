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

import { createTranslator, useTranslations } from "next-intl";

import { DICTIONARY, getUserLocale } from "@/i18n";

import type { NavGroup } from "./types";

function getMenuTranslator() {
  const locale = getUserLocale();
  return createTranslator({
    locale,
    messages: DICTIONARY[locale] ?? DICTIONARY.zh,
    namespace: "menu",
  });
}

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
      title: "UI Showcase",
      items: [
        {
          title: "Table Columns",
          to: "/showcase/tables",
          icon: TableProperties,
        },
        {
          title: "Form Fields",
          to: "/showcase/forms",
          icon: Sparkles,
        },
        {
          title: "Infolists & Callouts",
          to: "/showcase/infolists",
          icon: FileText,
        },
        {
          title: "Stats Cards",
          to: "/showcase/stats",
          icon: BarChart3,
        },
        {
          title: "Chart Widgets",
          to: "/showcase/charts",
          icon: AreaChart,
        },
        {
          title: "Map Components",
          to: "/showcase/maps",
          icon: MapPin,
        },
      ],
    },
  ];
}

/**
 * Filter menu groups and items based on the user's current role
 */
export function getAuthorizedMenu(
  groups: NavGroup[] = getSidebarMenuGroups(),
  userRole?: string,
): NavGroup[] {
  if (!userRole) {
    return groups;
  }

  return groups
    .filter((group) => {
      if (!group.roles || group.roles.length === 0) {
        return true;
      }
      return group.roles.includes(userRole);
    })
    .map((group) => {
      const filteredItems = group.items
        .filter((item) => {
          if (!item.roles || item.roles.length === 0) {
            return true;
          }
          return item.roles.includes(userRole);
        })
        .map((item) => {
          if (!item.items) {
            return item;
          }

          const filteredSubItems = item.items.filter((subItem) => {
            if (!subItem.roles || subItem.roles.length === 0) {
              return true;
            }
            return subItem.roles.includes(userRole);
          });

          return {
            ...item,
            items: filteredSubItems,
          };
        });

      return {
        ...group,
        items: filteredItems,
      };
    })
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
