import { faker } from "@faker-js/faker";
import { groupBy, round, sumBy } from "es-toolkit";

import type { Order } from "@/features/orders";
import type { Customer, CustomerStatus } from "@/features/users";

export function createCustomers(count = 50): Customer[] {
  const customers: Customer[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const phone = faker.phone.number({ style: "national" });
    const avatarUrl = faker.image.avatar();
    const status: CustomerStatus =
      faker.number.int({ min: 1, max: 100 }) <= 88 ? "active" : "inactive";
    const createdAt = faker.date.recent({ days: 180 }).toISOString();

    customers.push({
      id: `cust-${i + 1}`,
      name,
      email,
      phone,
      avatarUrl,
      totalOrders: 0,
      totalSpent: 0,
      status,
      createdAt,
    });
  }

  return customers;
}

export function syncCustomerStats(customers: Customer[], orders: Order[]): Customer[] {
  const ordersByCustomer = groupBy(orders, (o) => o.customerId);

  return customers.map((c) => {
    const customerOrders = ordersByCustomer[c.id];
    if (!customerOrders || customerOrders.length === 0) {
      return {
        ...c,
        totalOrders: 0,
        totalSpent: 0,
      };
    }

    const totalSpent = sumBy(customerOrders, (o) => (o.status !== "cancelled" ? o.total : 0));

    return {
      ...c,
      totalOrders: customerOrders.length,
      totalSpent: round(totalSpent, 2),
    };
  });
}
