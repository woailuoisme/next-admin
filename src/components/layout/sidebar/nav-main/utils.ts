import type { NavItem } from "../types";

/**
 * Check if the target route path matches or is a prefix of the current path
 */
export function isPathActive(to?: string, currentPath?: string): boolean {
  if (!to || !currentPath) {
    return false;
  }
  return currentPath === to || currentPath.startsWith(`${to}/`);
}

/**
 * Check if any child item in a nav item is currently active
 */
export function hasActiveSubItem(item: NavItem, currentPath: string): boolean {
  if (!item.items || item.items.length === 0) {
    return false;
  }
  return item.items.some((sub) => isPathActive(sub.to, currentPath));
}
