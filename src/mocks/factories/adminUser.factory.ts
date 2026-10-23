import { faker } from "@faker-js/faker";

import type { AdminRole, AdminUser, AdminUserStatus } from "@/features/auth";

export const STATIC_ADMIN_USERS: AdminUser[] = [
  {
    id: "admin-1",
    name: "Alex Rivers",
    email: "admin@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "superadmin",
    status: "active",
    createdAt: "2025-01-10T08:00:00.000Z",
    lastActiveAt: "2026-09-02T16:40:00.000Z",
  },
  {
    id: "admin-2",
    name: "Sarah Chen",
    email: "sarah.ops@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "admin",
    status: "active",
    createdAt: "2025-03-15T09:30:00.000Z",
    lastActiveAt: "2026-09-02T15:10:00.000Z",
  },
  {
    id: "admin-3",
    name: "Emma Watson",
    email: "auditor@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    role: "auditor",
    status: "active",
    createdAt: "2025-06-20T11:00:00.000Z",
    lastActiveAt: "2026-09-01T18:25:00.000Z",
  },
  {
    id: "admin-4",
    name: "David Miller",
    email: "david.m@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "manager",
    status: "suspended",
    createdAt: "2025-08-01T14:15:00.000Z",
    lastActiveAt: "2026-07-15T12:00:00.000Z",
  },
];

export function createAdminUsers(extraCount = 4): AdminUser[] {
  const users = [...STATIC_ADMIN_USERS];
  const roles: AdminRole[] = ["admin", "manager", "auditor"];
  const statuses: AdminUserStatus[] = ["active", "active", "suspended"];

  for (let i = 0; i < extraCount; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName, provider: "example.com" }).toLowerCase();
    const avatarUrl = faker.image.avatar();
    const role = faker.helpers.arrayElement(roles);
    const status = faker.helpers.arrayElement(statuses);
    const createdAt = faker.date.recent({ days: 120 }).toISOString();
    const lastActiveAt = faker.date.recent({ days: 10 }).toISOString();

    users.push({
      id: `admin-${users.length + 1}`,
      name,
      email,
      avatarUrl,
      role,
      status,
      createdAt,
      lastActiveAt,
    });
  }

  return users;
}
