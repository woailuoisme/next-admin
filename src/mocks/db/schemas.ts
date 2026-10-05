import { z } from "zod";

export const adminUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
  avatarUrl: z.string().optional(),
  createdAt: z.string(),
  lastActiveAt: z.string(),
});

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  productCount: z.number(),
  createdAt: z.string().optional(),
});

export const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  price: z.number(),
  costPrice: z.number(),
  stock: z.number(),
  categoryId: z.string(),
  categoryName: z.string(),
  status: z.string(),
  imageUrl: z.string(),
  createdAt: z.string(),
});

export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  avatarUrl: z.string(),
  status: z.string(),
  totalSpent: z.number(),
  totalOrders: z.number(),
  createdAt: z.string(),
});

export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  status: z.string(),
  paymentStatus: z.string().optional(),
  subtotal: z.number(),
  tax: z.number(),
  shipping: z.number(),
  total: z.number(),
  items: z.array(z.record(z.string(), z.unknown())),
  shippingAddress: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  severity: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
  actionUrl: z.string().optional(),
  actionLabel: z.string().optional(),
});
