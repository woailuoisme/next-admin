import { z } from "zod";

import { baseTableSearchSchema } from "@/components/data-table";

export const ADMIN_ROLES = ["superadmin", "admin", "manager", "auditor"] as const;

export const ADMIN_USER_STATUSES = ["active", "suspended"] as const;

export const ADMIN_ROLE_OPTIONS = [
  { value: "superadmin", label: "Superadmin (Full administrative access)" },
  { value: "admin", label: "Admin (Operational management)" },
  { value: "manager", label: "Manager (Inventory & order management)" },
  { value: "auditor", label: "Auditor (Read-only auditor access)" },
] as const;

export const adminRoleSchema = z.enum(ADMIN_ROLES);

export const adminUserStatusSchema = z.enum(ADMIN_USER_STATUSES);

export const adminUserInputSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
  role: adminRoleSchema,
});

export const adminUserSearchSchema = baseTableSearchSchema.extend({
  role: adminRoleSchema.or(z.literal("all")).optional(),
  status: adminUserStatusSchema.or(z.literal("all")).optional(),
  createStaff: z.boolean().optional(),
  staffId: z.string().optional(),
});

export type AdminUserSearchParams = z.infer<typeof adminUserSearchSchema>;
export const adminUserFilterSchema = adminUserSearchSchema;
export type AdminUserFilterParams = AdminUserSearchParams;
