import { queryOptions } from "@tanstack/react-query";

import { getDemoAccountsApi } from "./api";

export const authKeys = {
  all: ["auth"] as const,
  demoAccounts: () => [...authKeys.all, "demo-accounts"] as const,
};

export const authQueries = {
  all: () => authKeys.all,
  demoAccounts: () =>
    queryOptions({
      queryKey: authKeys.demoAccounts(),
      queryFn: getDemoAccountsApi,
      staleTime: 5 * 60 * 1000,
    }),
};
