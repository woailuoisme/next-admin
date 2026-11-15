// Public API seam for orders feature
export {
  computeOrderStats,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUSES,
  orderPaymentStatusSchema,
  orderResource,
  orderSearchSchema,
  orderStatusSchema,
} from "./resource";
export { OrdersActionView, OrdersListView, orderUI } from "./ui";
export type {
  Order,
  OrderFilters,
  OrderItem,
  OrderListResponse,
  OrderPaymentStatus,
  OrderSearchParams,
  OrderSparklines,
  OrderStatus,
  OrderSummary,
} from "./types";
