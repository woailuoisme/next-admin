import type { z } from "zod";

import type { orderPaymentStatusSchema, orderSearchSchema, orderStatusSchema } from "./schemas";

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderPaymentStatus = z.infer<typeof orderPaymentStatusSchema>;
export type OrderSearchParams = z.infer<typeof orderSearchSchema>;
export type OrderFilters = OrderSearchParams;

export interface OrderItem {
  productId: string;
  productTitle: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
  createdAt: string;
  updatedAt?: string;
  shippingAddress?: string;
  subtotal: number;
  tax: number;
  shipping: number;
}

export interface OrderSparklines {
  totalOrders: number[];
  pending: number[];
  delivered: number[];
  avgOrderValue: number[];
}

export interface OrderSummary {
  total: number;
  pendingCount: number;
  deliveredCount: number;
  avgOrderValue: number;
  sparklines?: OrderSparklines;
}

export interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary?: OrderSummary;
}
