import { faker } from "@faker-js/faker";
import { round, sumBy } from "es-toolkit";

import type { Order, OrderItem, OrderPaymentStatus, OrderStatus } from "@/features/orders";
import type { Product } from "@/features/products";
import type { Customer } from "@/features/users";

export function createOrders(customers: Customer[], products: Product[], count = 200): Order[] {
  if (customers.length === 0 || products.length === 0) {
    return [];
  }

  const orders: Order[] = [];

  for (let i = 0; i < count; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const itemCount = faker.number.int({ min: 1, max: 4 });
    const selectedProducts = faker.helpers.arrayElements(products, itemCount);

    const items: OrderItem[] = selectedProducts.map((p) => {
      const quantity = faker.number.int({ min: 1, max: 3 });
      return {
        productId: p.id,
        productTitle: p.title,
        price: p.price,
        quantity,
      };
    });

    const subtotal = round(
      sumBy(items, (item) => item.price * item.quantity),
      2,
    );
    const tax = round(subtotal * 0.08, 2);
    const shipping = subtotal > 300 ? 0 : 15;
    const total = round(subtotal + tax + shipping, 2);

    // Status weighting
    const statusRoll = faker.number.int({ min: 1, max: 100 });
    let status: OrderStatus = "delivered";
    let paymentStatus: OrderPaymentStatus = "paid";

    if (statusRoll <= 7) {
      status = "cancelled";
      paymentStatus = faker.helpers.arrayElement(["failed", "paid"]);
    } else if (statusRoll <= 15) {
      status = "pending";
      paymentStatus = faker.helpers.arrayElement(["pending", "paid"]);
    } else if (statusRoll <= 35) {
      status = "processing";
    } else if (statusRoll <= 50) {
      status = "shipped";
    }

    const street = faker.location.streetAddress();
    const city = faker.location.city();
    const state = faker.location.state({ abbreviated: true });
    const zip = faker.location.zipCode();
    const shippingAddress = `${street}, ${city}, ${state} ${zip}`;

    const createdAt = faker.date.recent({ days: 180 }).toISOString();

    orders.push({
      id: `ord-${i + 1}`,
      orderNumber: `ORD-2026-${String(i + 1000).padStart(5, "0")}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      items,
      subtotal,
      tax,
      shipping,
      total,
      status,
      paymentStatus,
      shippingAddress,
      createdAt,
    });
  }

  // Sort orders descending by createdAt so latest orders appear first by default
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
