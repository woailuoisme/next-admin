import { queryOptions } from "@tanstack/react-query";

import { fetchAdminUsers } from "./api";

export const adminUserKeys = {
  all: ["admin-users"] as const,
  lists: () => [...adminUserKeys.all, "list"] as const,
};

export const adminUserQueries = {
  all: () => adminUserKeys.all,
  list: () =>
    queryOptions({
      queryKey: adminUserKeys.lists(),
      queryFn: fetchAdminUsers,
    }),
};
