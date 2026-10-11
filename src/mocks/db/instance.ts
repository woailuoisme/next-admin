import type { AdminUser } from "@/features/auth";
import type { Category } from "@/features/categories";
import type { NotificationItem } from "@/features/notifications";
import type { Order } from "@/features/orders";
import type { Product } from "@/features/products";
import type { Customer } from "@/features/users";

import { CollectionAdapter } from "./adapter";
import {
  adminUserSchema,
  categorySchema,
  customerSchema,
  notificationSchema,
  orderSchema,
  productSchema,
} from "./schemas";

export const db = {
  adminUser: new CollectionAdapter<AdminUser>(adminUserSchema),
  category: new CollectionAdapter<Category>(categorySchema),
  product: new CollectionAdapter<Product>(productSchema),
  customer: new CollectionAdapter<Customer>(customerSchema),
  order: new CollectionAdapter<Order>(orderSchema),
  notification: new CollectionAdapter<NotificationItem>(notificationSchema),
};

export type MockDb = typeof db;
