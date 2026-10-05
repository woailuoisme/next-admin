import { useDebounceFn, useMemoizedFn } from "ahooks";
import { useState } from "react";

export interface UseQuickFilterOptions {
  value?: string;
  onChange?: (val: string) => void;
  debounceWait?: number;
}

export function useQuickFilter({
  value = "",
  onChange,
  debounceWait = 250,
}: UseQuickFilterOptions = {}) {
  const [localSearch, setLocalSearch] = useState(value);
  const [prevQuickFilter, setPrevQuickFilter] = useState(value);

  if (prevQuickFilter !== value) {
    setPrevQuickFilter(value);
    setLocalSearch(value);
  }

  const { run: triggerQuickFilter } = useDebounceFn(
    (val: string) => {
      onChange?.(val);
    },
    { wait: debounceWait },
  );

  const handleSearchChange = useMemoizedFn((val: string) => {
    setLocalSearch(val);
    triggerQuickFilter(val);
  });

  const handleClearSearch = useMemoizedFn(() => {
    setLocalSearch("");
    onChange?.("");
  });

  return {
    search: localSearch,
    setSearch: setLocalSearch,
    handleSearchChange,
    handleClearSearch,
  };
}
