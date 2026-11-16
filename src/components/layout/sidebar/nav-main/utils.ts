import type { NavItem, NavSubItem } from "../types";

function normalizeNavPath(path: string): string {
  return path.split("?")[0].replace(/\/+$/, "") || "/";
}

/**
 * Check if the target route path matches or is a prefix of the current path
 */
export function isPathActive(to?: string, currentPath?: string): boolean {
  if (!to || !currentPath) {
    return false;
  }
  const cleanTo = normalizeNavPath(to);
  const cleanCurrent = normalizeNavPath(currentPath);
  if (cleanTo === "/") {
    return cleanCurrent === "/";
  }
  return cleanCurrent === cleanTo || cleanCurrent.startsWith(`${cleanTo}/`);
}

/**
 * Resolve the most specific active sub-item path (exact match first, otherwise longest prefix).
 */
export function getActiveSubItemPath(items: readonly NavSubItem[], currentPath?: string): string | undefined {
  if (!currentPath || items.length === 0) {
    return undefined;
  }
  const cleanCurrent = normalizeNavPath(currentPath);
  let bestSubItem: NavSubItem | undefined;
  let bestLength = -1;

  for (const sub of items) {
    if (!sub.to) continue;
    const cleanTo = normalizeNavPath(sub.to);
    if (cleanCurrent === cleanTo) {
      return sub.to;
    }
    if (cleanTo !== "/" && cleanCurrent.startsWith(`${cleanTo}/`) && cleanTo.length > bestLength) {
      bestSubItem = sub;
      bestLength = cleanTo.length;
    }
  }

  return bestSubItem?.to;
}

/**
 * Check if any child item in a nav item is currently active
 */
export function hasActiveSubItem(item: NavItem, currentPath?: string): boolean {
  if (!currentPath || !item.items || item.items.length === 0) {
    return false;
  }
  return item.items.some((sub) => isPathActive(sub.to, currentPath));
}
