// Public API seam for admin-users feature
export { AdminUserDialog } from "./components/AdminUserDialog";
export { AdminUserTable } from "./components/AdminUserTable";
export {
  useAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
} from "./hooks";
export { AdminUsersPage, type AdminUsersPageProps } from "./pages/AdminUsersPage";
export { adminUserKeys, adminUserQueries } from "./queries";
export {
  adminRoleSchema,
  adminUserFilterSchema,
  adminUserInputSchema,
  adminUserSearchSchema,
  adminUserStatusSchema,
} from "./schemas";
export type {
  AdminRole,
  AdminUser,
  AdminUserFilters,
  AdminUserInput,
  AdminUserSearchParams,
  AdminUserStatus,
  CreateAdminUserInput,
} from "./types";
