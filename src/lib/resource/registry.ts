import type { NavGroup, NavItem, NavSubItem } from "@/components/layout/sidebar/types";

import { APP_RESOURCE_LIST } from "./manifest";
import type { ResourceManifestItem } from "./types";

export const APP_RESOURCES = APP_RESOURCE_LIST;

export interface ResourceGroupDefinition {
  id: string;
  labelKey?: string;
  icon?: NavItem["icon"];
  defaultOpen?: boolean;
  order?: number;
  roles?: readonly string[];
}

export const RESOURCE_NAV_GROUPS: Record<string, ResourceGroupDefinition> = {
  catalog: {
    id: "catalog",
    labelKey: "catalog",
    defaultOpen: true,
    order: 2,
  },
};

/**
 * 将 APP_RESOURCE_LIST 按 menuGroup / menuOrder 自动装配为 NavItem[]，
 * 供 menu.config.ts 与静态菜单组合，避免路由、权限与菜单三处重复维护。
 */
export function buildResourceNavItems(
  translateMenu: (key: string) => string,
  resources: readonly ResourceManifestItem[] = APP_RESOURCE_LIST,
): NavItem[] {
  const sorted = [...resources].sort((a, b) => (a.menuOrder ?? 99) - (b.menuOrder ?? 99));
  const grouped = new Map<string, ResourceManifestItem[]>();
  const orderedEntries: Array<
    { kind: "item"; item: ResourceManifestItem; order: number } | { kind: "group"; groupId: string; order: number }
  > = [];

  for (const res of sorted) {
    if (res.menuGroup && RESOURCE_NAV_GROUPS[res.menuGroup]) {
      const existing = grouped.get(res.menuGroup);
      if (existing) {
        existing.push(res);
      } else {
        grouped.set(res.menuGroup, [res]);
        orderedEntries.push({
          kind: "group",
          groupId: res.menuGroup,
          order: RESOURCE_NAV_GROUPS[res.menuGroup].order ?? res.menuOrder ?? 99,
        });
      }
    } else {
      orderedEntries.push({ kind: "item", item: res, order: res.menuOrder ?? 99 });
    }
  }

  orderedEntries.sort((a, b) => a.order - b.order);

  const navItems: NavItem[] = [];
  for (const entry of orderedEntries) {
    if (entry.kind === "item") {
      const { item } = entry;
      if (!item.icon) continue;
      navItems.push({
        title: translateMenu(item.menuKey),
        to: item.basePath,
        icon: item.icon,
        badge: item.badge,
        roles: item.roles ? [...item.roles] : undefined,
      });
    } else {
      const groupDef = RESOURCE_NAV_GROUPS[entry.groupId];
      const members = grouped.get(entry.groupId) ?? [];
      const firstIcon = groupDef.icon ?? members[0]?.icon;
      if (!firstIcon) continue;

      const subItems: NavSubItem[] = members.map((member) => ({
        title: translateMenu(member.menuKey),
        to: member.basePath,
        icon: member.icon,
        badge: member.badge,
        roles: member.roles ? [...member.roles] : undefined,
      }));

      navItems.push({
        title: translateMenu(groupDef.labelKey ?? groupDef.id),
        icon: firstIcon,
        defaultOpen: groupDef.defaultOpen,
        roles: groupDef.roles ? [...groupDef.roles] : undefined,
        items: subItems,
      });
    }
  }

  return navItems;
}

export function mergeWithResourceMenu(
  translateMenu: (key: string) => string,
  leadingItems: NavItem[],
  trailingGroups: NavGroup[],
): NavGroup[] {
  const resourceItems = buildResourceNavItems(translateMenu);
  return [
    {
      items: [...leadingItems, ...resourceItems],
    },
    ...trailingGroups,
  ];
}
