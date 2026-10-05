// Public API seam for orders feature

export { fetchOrderDetails, fetchOrders, updateOrderStatusApi } from "./api";
export { OrderDetailsSheet } from "./components/OrderDetailsSheet";
export { OrderMetricsCards } from "./components/OrderMetricsCards";
export { OrdersTable } from "./components/OrdersTable";
export { useUpdateOrderStatusMutation } from "./hooks";
export { computeOrderStats, OrdersPage, type OrdersPageProps } from "./pages/OrdersPage";
export { EMPTY_ORDER_FILTERS, orderKeys, orderQueries } from "./queries";
export {
  ORDER_PAYMENT_STATUS_OPTIONS,
  ORDER_PAYMENT_STATUSES,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUSES,
  orderFilterSchema,
  orderPaymentStatusSchema,
  orderSearchSchema,
  orderStatusSchema,
} from "./schemas";
export type {
  Order,
  OrderFilters,
  OrderItem,
  OrderListResponse,
  OrderPaymentStatus,
  OrderSearchParams,
  OrderStatus,
  OrderSummary,
} from "./types";
