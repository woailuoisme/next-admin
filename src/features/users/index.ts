// Public API seam for users feature
export {
  CUSTOMER_STATUSES,
  customerResource,
  customerSearchSchema,
  customerStatusSchema,
  type ToggleCustomerStatusInput,
} from "./resource";
export { customerUI, UsersListView } from "./ui";
export type { Customer, CustomerFilters, CustomerSearchParams, CustomerStatus } from "./types";
