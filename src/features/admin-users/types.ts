import type { z } from "zod";

import type {
  adminRoleSchema,
  adminUserInputSchema,
  adminUserSearchSchema,
  adminUserStatusSchema,
} from "./schemas";

export type AdminRole = z.infer<typeof adminRoleSchema>;
export type AdminUserStatus = z.infer<typeof adminUserStatusSchema>;
export type AdminUserInput = z.infer<typeof adminUserInputSchema>;
export type CreateAdminUserInput = AdminUserInput;
export type AdminUserSearchParams = z.infer<typeof adminUserSearchSchema>;
export type AdminUserFilters = AdminUserSearchParams;

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: AdminRole;
  status: AdminUserStatus;
  createdAt: string;
  lastActiveAt: string;
}
