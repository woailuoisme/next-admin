import { queryOptions } from "@tanstack/react-query";

import { fetchCategories } from "./api";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
};

export const categoryQueries = {
  all: () => categoryKeys.all,
  list: () =>
    queryOptions({
      queryKey: categoryKeys.lists(),
      queryFn: fetchCategories,
      staleTime: 60 * 1000,
    }),
};
