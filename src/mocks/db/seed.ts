import { generateMockData, type MockDatabase } from "../factories";
import { resetIdempotencyStore } from "../middleware";
import { db, type MockDb } from "./instance";

/**
 * Drop all records across all database collections.
 */
export function dropDatabase(targetDb: MockDb = db): void {
  for (const key of Object.keys(targetDb) as (keyof MockDb)[]) {
    targetDb[key].clear();
  }
}

/**
 * Seed the mock database deterministically using the factory data generator.
 */
export async function seedDatabase(seed = 2026): Promise<MockDatabase> {
  dropDatabase(db);
  resetIdempotencyStore();
  const data = generateMockData({ seed });

  await Promise.all([
    ...data.categories.map((cat) => db.category.create(cat)),
    ...data.products.map((prod) => db.product.create(prod)),
    ...data.customers.map((cust) => db.customer.create(cust)),
    ...data.orders.map((ord) => db.order.create(ord)),
    ...data.adminUsers.map((admin) => db.adminUser.create(admin)),
    ...data.notifications.map((notif) => db.notification.create(notif)),
  ]);

  return data;
}

/**
 * Reset the mock database with a given deterministic seed.
 */
export async function resetDatabase(seed = 2026): Promise<MockDatabase> {
  return await seedDatabase(seed);
}

/**
 * Retrieve a serializable snapshot of the entire database state.
 */
export function getDatabaseSnapshot(): MockDatabase {
  return {
    adminUsers: db.adminUser.getAll(),
    customers: db.customer.getAll(),
    categories: db.category.getAll(),
    products: db.product.getAll(),
    orders: db.order.getAll(),
    notifications: db.notification.getAll(),
  };
}

// Backward-compatible aliases
export const drop = dropDatabase;
export const seedMockDatabase = seedDatabase;
export const resetDb = resetDatabase;
export const getDb = getDatabaseSnapshot;

// Initial deterministic in-memory seed
await seedDatabase();

// Devtools helper attached to window for manual testing in browser console
if (typeof window !== "undefined" && import.meta.env?.DEV) {
  (window as unknown as { __resetMockDb?: () => Promise<MockDatabase> }).__resetMockDb =
    resetDatabase;
}
