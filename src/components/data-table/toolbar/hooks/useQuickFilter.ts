import { useDebouncer } from "@tanstack/react-pacer";
import { useMemoizedFn } from "ahooks";
import { useState } from "react";

export interface UseQuickFilterOptions {
  value?: string;
  onChange?: (val: string) => void;
  debounceWait?: number;
}

export function useQuickFilter({ value = "", onChange, debounceWait = 250 }: UseQuickFilterOptions = {}) {
  const [draftState, setDraftState] = useState<{ baseValue: string; text: string } | null>(null);
  const search = draftState && draftState.baseValue === value ? draftState.text : value;

  const setSearch = useMemoizedFn((text: string) => {
    setDraftState({ baseValue: value, text });
  });

  const debouncer = useDebouncer(
    (val: string) => {
      onChange?.(val);
    },
    { wait: debounceWait },
  );

  const handleSearchChange = useMemoizedFn((val: string) => {
    setDraftState({ baseValue: value, text: val });
    debouncer.maybeExecute(val);
  });

  const handleClearSearch = useMemoizedFn(() => {
    debouncer.cancel();
    setDraftState({ baseValue: value, text: "" });
    onChange?.("");
  });

  return {
    search,
    setSearch,
    handleSearchChange,
    handleClearSearch,
  };
}
