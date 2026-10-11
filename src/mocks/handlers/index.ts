import { authHandlers } from "./auth";
import { categoriesHandlers } from "./categories";
import { dashboardHandlers } from "./dashboard";
import { notificationHandlers } from "./notifications";
import { ordersHandlers } from "./orders";
import { productsHandlers } from "./products";
import { usersHandlers } from "./users";

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...productsHandlers,
  ...categoriesHandlers,
  ...ordersHandlers,
  ...usersHandlers,
  ...notificationHandlers,
];
