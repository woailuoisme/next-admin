import { faker } from "@faker-js/faker";

import type { AdminUser } from "@/features/auth";
import type { Category } from "@/features/categories";
import type { NotificationItem } from "@/features/notifications";
import type { Order } from "@/features/orders";
import type { Product } from "@/features/products";
import type { Customer } from "@/features/users";

import { createAdminUsers } from "./adminUser.factory";
import { createInitialCategories, syncCategoryProductCounts } from "./category.factory";
import { createCustomers, syncCustomerStats } from "./customer.factory";
import { createInitialNotifications } from "./notification.factory";
import { createOrders } from "./order.factory";
import { createProducts } from "./product.factory";

export interface MockDatabase {
  adminUsers: AdminUser[];
  customers: Customer[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  notifications: NotificationItem[];
}

export interface GenerateMockDataOptions {
  seed?: number;
  productCount?: number;
  customerCount?: number;
  orderCount?: number;
  extraAdminCount?: number;
}

export function generateMockData(options: GenerateMockDataOptions = {}): MockDatabase {
  const { seed = 2026, productCount = 100, customerCount = 50, orderCount = 200, extraAdminCount = 4 } = options;

  faker.seed(seed);

  const baseCategories = createInitialCategories();
  const products = createProducts(baseCategories, productCount);
  const categories = syncCategoryProductCounts(baseCategories, products);

  const initialCustomers = createCustomers(customerCount);
  const orders = createOrders(initialCustomers, products, orderCount);
  const customers = syncCustomerStats(initialCustomers, orders);

  const adminUsers = createAdminUsers(extraAdminCount);
  const notifications = createInitialNotifications();

  return {
    adminUsers,
    customers,
    categories,
    products,
    orders,
    notifications,
  };
}

export * from "./adminUser.factory";
export * from "./category.factory";
export * from "./customer.factory";
export * from "./notification.factory";
export * from "./order.factory";
export * from "./product.factory";
