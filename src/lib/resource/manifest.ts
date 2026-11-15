import { FolderTree, Package, ShoppingCart, Users } from "lucide-react";

import type { ResourceManifestItem } from "./types";

/**
 * 资源元信息清单（单一数据源）：
 * 供侧边栏导航、全局搜索、面包屑与各 feature 的 defineResource 共用，
 * 避免基础设施层反向导入 src/features/*。
 */
export const RESOURCE_MANIFEST = {
  products: {
    name: "products",
    entityName: "Product",
    basePath: "/products",
    i18nNamespace: "products",
    menuKey: "products",
    menuGroup: "catalog",
    menuOrder: 1,
    icon: Package,
    badge: 12,
  },
  categories: {
    name: "categories",
    entityName: "Category",
    basePath: "/categories",
    i18nNamespace: "categories",
    menuKey: "categories",
    menuGroup: "catalog",
    menuOrder: 2,
    icon: FolderTree,
    badge: 4,
  },
  orders: {
    name: "orders",
    entityName: "Order",
    basePath: "/orders",
    i18nNamespace: "orders",
    menuKey: "orders",
    menuGroup: "catalog",
    menuOrder: 3,
    icon: ShoppingCart,
    badge: 15,
  },
  users: {
    name: "users",
    entityName: "Customer",
    basePath: "/users",
    i18nNamespace: "users",
    menuKey: "users",
    menuOrder: 4,
    icon: Users,
  },
} as const satisfies Record<string, ResourceManifestItem>;

export type AppResourceName = keyof typeof RESOURCE_MANIFEST;

export const APP_RESOURCE_LIST: readonly ResourceManifestItem[] = Object.values(RESOURCE_MANIFEST);
