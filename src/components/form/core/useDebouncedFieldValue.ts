"use client";

import { useDebounceFn, useMemoizedFn } from "ahooks";
import { useState } from "react";

export interface UseDebouncedFieldValueOptions<T> {
  value: T;
  debounceMs?: number;
  onChange: (value: T) => void;
  onBlur?: () => void;
}

interface DraftState<T> {
  base: T;
  committed?: T;
  hasCommitted?: boolean;
  current: T;
}

/**
 * Manages local typing draft during debounce without render-phase setState or useEffect.
 * Automatically discards the draft when an external update (e.g., form reset) diverges from
 * both the starting base and our own last committed value.
 */
export function useDebouncedFieldValue<T>({
  value,
  debounceMs = 0,
  onChange,
  onBlur,
}: UseDebouncedFieldValueOptions<T>) {
  const isDebounced = debounceMs > 0;
  const [draft, setDraft] = useState<DraftState<T> | null>(null);

  const debouncedCommit = useDebounceFn(
    (nextVal: T) => {
      setDraft((prev) =>
        prev && !Object.is(prev.current, nextVal) ? { ...prev, hasCommitted: true, committed: nextVal } : null,
      );
      onChange(nextVal);
    },
    { wait: Math.max(debounceMs, 0) },
  );

  const isActiveDraft =
    isDebounced &&
    draft !== null &&
    (Object.is(draft.base, value) || (Boolean(draft.hasCommitted) && Object.is(draft.committed, value)));

  const displayValue = isActiveDraft ? draft.current : value;

  const handleChange = useMemoizedFn((nextVal: T) => {
    if (!isDebounced) {
      onChange(nextVal);
      return;
    }
    setDraft((prev) => {
      const sameBase =
        prev !== null &&
        (Object.is(prev.base, value) || (Boolean(prev.hasCommitted) && Object.is(prev.committed, value)));
      return {
        base: sameBase ? prev.base : value,
        committed: sameBase ? prev.committed : undefined,
        hasCommitted: sameBase ? prev.hasCommitted : false,
        current: nextVal,
      };
    });
    debouncedCommit.run(nextVal);
  });

  const handleClear = useMemoizedFn((emptyVal: T) => {
    if (isDebounced) {
      debouncedCommit.cancel();
      setDraft(null);
    }
    onChange(emptyVal);
  });

  const handleBlur = useMemoizedFn(() => {
    if (isDebounced) {
      debouncedCommit.flush();
    }
    onBlur?.();
  });

  return {
    displayValue,
    handleChange,
    handleClear,
    handleBlur,
  };
}
